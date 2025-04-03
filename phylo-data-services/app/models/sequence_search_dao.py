from __future__ import annotations

from typing import Generator
from typing import Iterable

import mariadb
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class SequenceSearchDAO(BaseModel):
    protein_id: int
    external_protein_id: str
    external_genome_id: str
    taxonomy_id: int
    species_name: str
    description: str

    @classmethod
    def get_protein_results_by_protein_ids(
        cls,
        db_connection: mariadb.Connection,
        protein_ids: Iterable[int],
    ) -> Generator[SequenceSearchDAO, None, None]:
        cursor: mariadb.Cursor = db_connection.cursor()
        protein_ids_placeholders: str = ",".join(["?" for _ in protein_ids])
        query: str = f"""\
            SELECT
                proteins.protein_id,
                proteins.external_protein_id,
                genomes.external_genome_id,
                genomes.taxid,
                species.name,
                proteins.description
            FROM
                proteins
            JOIN
                genes
            ON
                proteins.gene_id = genes.gene_id
            JOIN
                genomes
            ON
                genomes.genome_id = genes.genome_id
            JOIN
                species
            ON
                genomes.taxid = species.taxid
            WHERE
                proteins.protein_id IN ({protein_ids_placeholders})
        """
        cursor.execute(query, tuple(protein_ids))
        print("==> ", cursor._transformed_statement)
        yield from generate_instances_from_cursor(cls, cursor)
