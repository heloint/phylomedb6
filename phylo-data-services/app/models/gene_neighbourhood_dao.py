from __future__ import annotations

from datetime import datetime
from typing import Iterator

import mariadb  # type: ignore
from pydantic import BaseModel

from models.utils import generate_instances_from_cursor


class GeneNeighbourhoodDAO(BaseModel, validate_assignment=True):
    gene_id: int
    main_contig_gene_id: int
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
    protein_id: int

    @classmethod
    def get_by_tree_id(
        cls, connection: mariadb.Connection, tree_id: int, neighbour_num_range: int = 3
    ) -> Iterator[GeneNeighbourhoodDAO]:
        cursor: mariadb.Cursor = connection.cursor()
        query: str = (
            f"CALL GetGeneNeighbourhoodsByTreeId({tree_id}, {neighbour_num_range})"
        )
        cursor.execute(query)
        yield from generate_instances_from_cursor(cls, cursor)
