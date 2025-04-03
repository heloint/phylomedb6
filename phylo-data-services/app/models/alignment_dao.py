from __future__ import annotations

from typing import Generator

import mariadb
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class AlignmentDAO(BaseModel):
    phylome_id: int
    alignment: bytes
    alignment_type: str
    seed_protein_id: int

    @classmethod
    def get_alignment_by_phylome_id(
        cls,
        db_connection: mariadb.Connection,
        phylome_id: int,
    ) -> Generator[AlignmentDAO, None, None]:
        cursor: mariadb.Cursor = db_connection.cursor()
        query: str = """
        SELECT
            ar.phylome_id,
            a.alignment,
            a.alignment_type,
            ar.seed_protein_id
        FROM
            alignments AS a
        JOIN
            alignment_relations AS ar
        ON
            (a.alignment_md5_id = ar.alignment_md5_id)
        WHERE ar.phylome_id = ?;
        """
        cursor.execute(query, (phylome_id,))
        yield from generate_instances_from_cursor(cls, cursor)
