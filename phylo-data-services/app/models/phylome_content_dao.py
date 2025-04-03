from __future__ import annotations

from datetime import datetime
from typing import Generator

import mariadb  # type: ignore
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class PhylomeContentDAO(BaseModel, validate_assignment=True):
    phylome_id: int
    genome_id: int
    external_genome_id: str
    taxid: int
    version: int
    source: str
    comments: str
    timestamp: datetime

    @classmethod
    def get_by_phylome_id(
        cls,
        connection: mariadb.Connection,
        phylome_id: int,
    ) -> Generator[PhylomeContentDAO, None, None]:
        """
        Retrieves entries from the join of `phylome_contents`
        and `genomes` table by `phylome_id`.
        """
        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""
            SELECT
                phylome_contents.phylome_id,
                phylome_contents.genome_id,
                genomes.external_genome_id,
                genomes.taxid,
                genomes.version,
                genomes.source,
                genomes.comments,
                genomes.timestamp
            FROM
                phylome_contents
            JOIN
                genomes
            ON
                (phylome_contents.genome_id = genomes.genome_id)
            WHERE
                phylome_contents.phylome_id = ?;
            """
        cursor.execute(query, (phylome_id,))
        yield from generate_instances_from_cursor(cls, cursor)
