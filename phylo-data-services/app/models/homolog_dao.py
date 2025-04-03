from __future__ import annotations

from typing import Iterable
from typing import Iterator
from typing import Optional

import mariadb  # type: ignore
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class HomologDAO(BaseModel, validate_assignment=True):
    seed_gene_id: int
    homolog_gene_id: int
    protein_id: int

    @classmethod
    def get_homologs_for_seed_genes(
        cls,
        connection: mariadb.Connection,
        seed_gene_ids: Iterable[int],
        target_gene_ids: Optional[Iterable[int]] = None,
        phylome_id: Optional[int] = None,
    ) -> Iterator[HomologDAO]:
        cursor: mariadb.Cursor = connection.cursor()
        seed_gene_ids_placeholders: str = ",".join(["?" for _ in seed_gene_ids]).rstrip(
            ","
        )
        where_clause_content: str = (
            f"proteins.gene_id NOT IN ({seed_gene_ids_placeholders})"
        )
        where_clause_args: Iterable[int] = seed_gene_ids

        if target_gene_ids is not None:
            target_gene_ids_placeholders: str = ",".join(
                ["?" for _ in target_gene_ids]
            ).rstrip(",")
            where_clause_content = f"{where_clause_content} AND proteins.gene_id IN ({target_gene_ids_placeholders})"
            where_clause_args = (*seed_gene_ids, *target_gene_ids)

        if phylome_id is not None:
            where_clause_content = f"{where_clause_content} AND homologs.phylome_id=?"
            where_clause_args = (*where_clause_args, phylome_id)

        query: str = f"""
        WITH homologs_proteins AS (
            SELECT proteins.gene_id, homologs.protein_2 AS protein_id
            FROM proteins
            JOIN homologs
            ON (homologs.protein_1 = proteins.protein_id)
            WHERE proteins.gene_id IN ({seed_gene_ids_placeholders})
            UNION
            SELECT proteins.gene_id, homologs.protein_1 AS protein_id
            FROM proteins
            JOIN homologs
            ON (homologs.protein_2 = proteins.protein_id)
            WHERE proteins.gene_id IN ({seed_gene_ids_placeholders})
        )
        SELECT
            homologs_proteins.gene_id AS seed_gene_id,
            proteins.gene_id AS homolog_gene_id,
            proteins.protein_id
        FROM proteins
        JOIN homologs_proteins
        ON (proteins.protein_id = homologs_proteins.protein_id)
        JOIN homologs
        ON (homologs.protein_1 = proteins.protein_id OR homologs.protein_2 = proteins.protein_id)
        WHERE {where_clause_content}
        """
        cursor.execute(query, (*seed_gene_ids, *seed_gene_ids, *where_clause_args))
        yield from generate_instances_from_cursor(cls, cursor)
