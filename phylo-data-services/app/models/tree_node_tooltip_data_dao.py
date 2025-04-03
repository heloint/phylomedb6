from __future__ import annotations

from typing import Iterator

import mariadb
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class TreeNodeTooltipData(BaseModel):
    protein_id: int
    external_protein_id: str
    description: str
    gene_id: int
    external_gene_id: str
    contig_id: str
    gene_name: str
    source: str
    genome_id: int
    external_genome_id: str
    taxid: int
    name: str

    @classmethod
    def get_by_tree_id(
        cls,
        connection: mariadb.Connection,
        tree_id: int,
    ) -> Iterator[TreeNodeTooltipData]:
        """
        Collects the relevant data for the tree nodes (proteins).
        """
        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""
    SELECT
        proteins.protein_id,
        proteins.external_protein_id,
        proteins.description,
        proteins.gene_id,
        genes.external_gene_id,
        genes.contig_id,
        genes.gene_name,
        genes.source,
        genomes.genome_id,
        genomes.external_genome_id,
        genomes.taxid,
        species.name
    FROM
        proteins
    JOIN
        genes ON proteins.gene_id = genes.gene_id
    JOIN
        genomes ON genomes.genome_id = genes.genome_id
    JOIN
        species ON genomes.taxid = species.taxid
    WHERE
        proteins.protein_id IN (
            SELECT
                tree_contents.target_protein_id
            FROM
                tree_contents
            JOIN
                trees ON trees.phylome_id = tree_contents.phylome_id
                    AND trees.seed_protein_id = tree_contents.seed_protein_id
            WHERE
                trees.tree_id = ?
        );
    """
        cursor.execute(query, (tree_id,))
        results = generate_instances_from_cursor(cls, cursor)
        return results
