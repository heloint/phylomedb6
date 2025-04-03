#!/usr/bin/env python3
from __future__ import annotations

from datetime import datetime
from typing import Generator

import mariadb  # type: ignore
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class TreeAlignment(BaseModel, validate_assignment=True):
    tree_id: int
    phylome_id: int
    seed_protein_id: int
    method: str
    lk: float
    newick: str
    alignment_md5_id: str
    alignment: bytes
    sha1: str
    timestamp: datetime
    seqs_numb: int
    residues_numb: int
    alignment_type: str

    @classmethod
    def get_by_tree_id(
        cls,
        connection: mariadb.Connection,
        tree_id: int,
    ) -> Generator[TreeAlignment, None, None]:
        """
        Retrieves entries from the `alignments` table by `tree_id` using joints with the `alignment_relations` and .
        """
        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""
        SELECT
            trees.tree_id,
            trees.phylome_id,
            trees.seed_protein_id,
            trees.method,
            trees.lk,
            trees.newick,
            alignments.alignment_md5_id,
            alignments.alignment,
            alignments.sha1,
            alignments.timestamp,
            alignments.seqs_numb,
            alignments.residues_numb,
            alignments.alignment_type
        FROM
            trees
        JOIN
            alignment_relations
        ON
            (trees.seed_protein_id = alignment_relations.seed_protein_id AND trees.phylome_id = alignment_relations.phylome_id)
        JOIN
            alignments
        ON
            (alignments.alignment_md5_id = alignment_relations.alignment_md5_id)
        WHERE
            trees.tree_id=?;
        """
        cursor.execute(query, (tree_id,))
        yield from generate_instances_from_cursor(cls, cursor)
