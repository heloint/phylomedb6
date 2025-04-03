#!/usr/bin/env python3
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable
from typing import TypedDict

import mariadb  # type: ignore
from ete4 import Tree  # type: ignore
from ete4.core import operations as ops  # type: ignore
from ete4.smartview import Face
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request
from fastapi import Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from utils.mariadb_connection import MariadbSession
from models.tree_dao import TreeDAO
from services.tree_view_data_service import TreeViewDataService
from utils.tree_viewer import add_tree
from utils.tree_viewer import GLOBAL_TREE_CACHE

router = APIRouter()


ProteinID = int
GeneID = int
ContigID = str


class ProteinIDData(TypedDict):
    faces: dict[GeneID, Face]
    homologs: set[ProteinID]
    orthologs: set[ProteinID]
    neighbours: set[ProteinID]


GET_FACE_CACHE: dict[ProteinID, ProteinIDData] = {}


class SequenceSearchResponse(BaseModel):
    protein_id: int
    genome_id: int
    taxonomy_id: int
    species_name: str
    description: str
    timestamp: datetime


class CacheCheckResponse(BaseModel):
    tree_id: int | str
    exists: bool


class SequenceSearchRetrieveResult(BaseModel):
    result: str


@dataclass
class Gene:
    gene_id: int | None
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
    orthologs_with: Iterable["Gene"] | None
    homologs_with: Iterable["Gene"] | None


class GeneNeighbourhoodResult(TypedDict):
    target_gene_id_by_protein_id: int
    gene_neighbourhood: list[Gene]


@router.get("/ete-smartview/get/{tree_id}", response_model=None)
def get_tree_view_from_db(
    _: Request,
    tree_id: int,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
) -> Response:
    tree_dao = TreeDAO.get_by_tree_id(db_connection, tree_id)
    if not tree_dao:
        raise HTTPException(
            status_code=404,
            detail=f"Tree not found in the database with ID: {tree_id}",
        )

    tree_view_data = TreeViewDataService.generate_data_from_tree(
        db_connection=db_connection,
        tree_id=tree_dao.tree_id,
        phylome_id=tree_dao.phylome_id,
        tree_seed_protein_id=tree_dao.seed_protein_id,
        tree_newick=tree_dao.newick,
    )
    ops.update_sizes_all(tree_view_data["tree"])

    tid: int = add_tree(tree_view_data)
    print(f'Added tree {tree_view_data["name"]} with id {tid}.')
    response = RedirectResponse(url=f'/static/gui.html?tree={tree_view_data["name"]}')
    return response


@router.get("/ete-smartview/check-cache/{tree_id}", response_model=CacheCheckResponse)
def check_global_tree_cache(tree_id: int) -> CacheCheckResponse:
    global GLOBAL_TREE_CACHE
    GLOBAL_TREE_CACHE.remove_stale_tree_caches()
    return CacheCheckResponse(
        tree_id=tree_id, exists=tree_id in GLOBAL_TREE_CACHE.trees
    )
