#!/usr/bin/env python3
from __future__ import annotations

from typing import Generator

import mariadb  # type: ignore
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class ProteinSequence(BaseModel, validate_assignment=True):
    protein_id: int
    description: str
    taxid: int
    sequence: str

    @classmethod
    def get_sequences_by_genome_id(
        cls,
        connection: mariadb.Connection,
        genome_id: int,
    ) -> Generator[ProteinSequence, None, None]:
        """
        Retrieves protein sequences along with their description, taxid, and sequence
        for a specific genome_id by joining the `protein_sequences`, `proteins`, `sequences`,
        and `genomes` tables.
        """

        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""


            SELECT
    protein_sequences.protein_id,
    proteins.description,
    genomes.taxid,
    protein_sequences.sequence
FROM
    protein_sequences
JOIN
    proteins ON proteins.protein_id = protein_sequences.protein_id
JOIN
    genes ON proteins.gene_id = genes.gene_id
JOIN
    genomes ON genes.genome_id = genomes.genome_id
WHERE
    genomes.genome_id = ?
LIMIT 5;

        """
        cursor.execute(query, (genome_id,))
        yield from generate_instances_from_cursor(cls, cursor)
