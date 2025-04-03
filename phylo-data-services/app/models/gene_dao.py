from __future__ import annotations

from datetime import datetime
from typing import Generator
from typing import Iterator

import mariadb  # type: ignore
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class GeneDAO(BaseModel, validate_assignment=True):
    gene_id: int
    external_gene_id: str
    contig_id: str
    gene_name: str
    source: str
    start: int
    end: int
    relative_contig_gene_order: int
    strand: str
    timestamp: datetime
    genome_id: int

    @classmethod
    def get_by_protein_id(
        cls,
        connection: mariadb.Connection,
        protein_id: int,
    ) -> GeneDAO | None:
        """
        Retrieves gene based on the `protein_id`.
        """
        cursor: mariadb.Cursor = connection.cursor()
        query: str = """
        SELECT
            genes.gene_id,
            genes.external_gene_id,
            genes.contig_id,
            genes.gene_name,
            genes.source,
            genes.start,
            genes.end,
            genes.relative_contig_gene_order,
            genes.strand,
            genes.timestamp,
            genes.genome_id
        FROM
            genes
        JOIN
            proteins
        ON
            proteins.gene_id = genes.gene_id
        WHERE
            proteins.protein_id = ?
        LIMIT 1
        """
        cursor.execute(query, (protein_id,))
        return next(generate_instances_from_cursor(cls, cursor), None)

    @classmethod
    def get_contig_genes_by_protein_id(
        cls,
        connection: mariadb.Connection,
        protein_id: int,
    ) -> Generator[GeneDAO, None, None]:
        """
        Retrieves genes based on the `protein_id` and finds all genes sharing the same `contig_id`.
        A single query is used to fetch genes that share the same contig_id as the gene related to the protein_id.
        """
        cursor: mariadb.Cursor = connection.cursor()

        query: str = """
        SELECT
            gene_id,
            external_gene_id,
            contig_id,
            gene_name,
            source,
            start,
            end,
            relative_contig_gene_order,
            strand,
            timestamp,
            genome_id
        FROM
            genes
        WHERE
            contig_id = (
                SELECT g1.contig_id
                FROM genes g1
                JOIN proteins p1 ON g1.gene_id = p1.gene_id
                WHERE p1.protein_id = ?
                LIMIT 1
            )
        ORDER BY start, end
        """
        cursor.execute(query, (protein_id,))
        yield from generate_instances_from_cursor(cls, cursor)

    @classmethod
    def get_protein_ids_by_gene_id(
        cls, connection: mariadb.Connection, gene_id: int
    ) -> Iterator[int]:
        cursor: mariadb.Cursor = connection.cursor()
        query: str = """
        SELECT proteins.protein_id
        FROM genes
        JOIN proteins
        ON (proteins.gene_id = genes.gene_id)
        WHERE genes.gene_id = ?
        """
        cursor.execute(query, (gene_id,))
        for line in cursor:
            yield line[0]
