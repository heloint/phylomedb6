from __future__ import annotations

from typing import Iterator

import mariadb  # type: ignore
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class TreeContentDAO(BaseModel, validate_assignment=True):
    phylome_id: int
    seed_protein_id: int
    target_protein_id: int

    @classmethod
    def get_by_phylome_id_and_seed_protein_id(
        cls,
        connection: mariadb.Connection,
        phylome_id: int,
        seed_protein_id: int,
    ) -> Iterator[TreeContentDAO]:
        """
        Retrieves an entry from the `tree_contents` table by `phylome_id`.
        """
        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""
            SELECT
                phylome_id,
                seed_protein_id,
                target_protein_id
            FROM
                tree_contents
            WHERE
                phylome_id = ?
                AND seed_protein_id = ?
            """
        cursor.execute(query, (phylome_id, seed_protein_id))
        yield from generate_instances_from_cursor(cls, cursor)
