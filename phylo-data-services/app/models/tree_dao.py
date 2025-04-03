from __future__ import annotations

from typing import Generator
from typing import Optional

import mariadb  # type: ignore
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class TreeDAO(BaseModel, validate_assignment=True):
    tree_id: int
    phylome_id: int
    seed_protein_id: int
    method: str
    lk: float
    newick: str

    @classmethod
    def get_by_tree_id(
        cls,
        connection: mariadb.Connection,
        tree_id: int,
    ) -> Optional[TreeDAO]:
        """
        Retrieves an entry from the `trees` table by `tree_id`.
        """
        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""
            SELECT
                tree_id,
                phylome_id,
                seed_protein_id,
                method,
                lk,
                newick
            FROM
                trees
            WHERE
                tree_id = ?
            """
        cursor.execute(query, (tree_id,))
        results = generate_instances_from_cursor(cls, cursor)
        result_tree: TreeDAO | None = next(results, None)
        return result_tree

    @classmethod
    def get_tree_by_phylome_id(
        cls,
        connection: mariadb.Connection,
        phylome_id: int,
    ) -> Generator[TreeDAO, None, None]:
        """
        Retrieves an entry from the `trees` table by `phylome_id`.
        """
        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""
        SELECT
            tree_id,
            phylome_id,
            seed_protein_id,
            method,
            lk,
            newick
        FROM
            trees
        WHERE
            phylome_id = ?;
        """
        cursor.execute(query, (phylome_id,))

        yield from generate_instances_from_cursor(cls, cursor)
