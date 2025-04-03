#!/usr/bin/env python3
import asyncio
from pathlib import Path

import mariadb  # type: ignore
from ete4 import Tree  # type: ignore
from ete4.core import operations as ops  # type: ignore
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi.responses import FileResponse
from fastapi.responses import HTMLResponse

from services.alignment_display_service import AlignmentDisplayService
from services.alignments_download_service import (
    AlignmentsDownloadService,
    GetAlignmentsFastaOutputData,
)
from services.proteome_download_service import ProteomeDownloadService
from services.trees_download_service import GetTreesNewickData, TreesDownloadService
from utils.mariadb_connection import MariadbSession
from services.orthologs_download_service import (
    GetOrthologsReportOutputData,
    OrthologsDownloadService,
)

router = APIRouter()


DOWNLOADS_BASE_DIRECTORY: str = "/app/_downloads_output"


LOCKS_TREES: dict[int, asyncio.Lock] = {}
LOCKS_ALIGNMENTS: dict[int, asyncio.Lock] = {}


async def get_orthologs_lock(phylome_id: int):
    global LOCKS_ALIGNMENTS
    if phylome_id not in LOCKS_ALIGNMENTS:
        LOCKS_ALIGNMENTS[phylome_id] = asyncio.Lock()
    return LOCKS_ALIGNMENTS[phylome_id]


async def phylome_orthologs_lock(
    lock: asyncio.Lock = Depends(get_orthologs_lock),
):
    async with lock:
        yield


async def get_alignments_lock(phylome_id: int):
    global LOCKS_ALIGNMENTS
    if phylome_id not in LOCKS_ALIGNMENTS:
        LOCKS_ALIGNMENTS[phylome_id] = asyncio.Lock()
    return LOCKS_ALIGNMENTS[phylome_id]


async def phylome_alignments_lock(
    lock: asyncio.Lock = Depends(get_alignments_lock),
):
    async with lock:
        yield


async def get_trees_lock(phylome_id: int):
    global LOCKS_TREES
    if phylome_id not in LOCKS_TREES:
        LOCKS_TREES[phylome_id] = asyncio.Lock()
    return LOCKS_TREES[phylome_id]


async def phylome_trees_lock(lock: asyncio.Lock = Depends(get_trees_lock)):
    async with lock:
        yield


def setup_context() -> None:
    print("==> Starting to setup the downloads controller context.")
    # Create output directories for different operations.
    Path(DOWNLOADS_BASE_DIRECTORY).mkdir(exist_ok=True, parents=True)
    print("==> Finished to setup the downloads controller context.")


@router.get(
    "/phylome-downloads/phylomes/{phylome_id}/orthologs",
)
async def download_orthologs_report(
    phylome_id: int,
    lock: bool = Depends(phylome_orthologs_lock),
):
    try:
        result: GetOrthologsReportOutputData = (
            OrthologsDownloadService.get_orthologs_report_by_phylome_id(
                phylome_id, DOWNLOADS_BASE_DIRECTORY
            )
        )
        return FileResponse(
            path=result["output_file_path"],
            media_type="application/x-tar",
            filename=result["output_file_name"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )


@router.get(
    "/phylome-downloads/phylomes/{phylome_id}/alignments",
)
async def download_alignments_fasta(
    phylome_id: int,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
    lock: bool = Depends(phylome_alignments_lock),
):
    try:
        result: GetAlignmentsFastaOutputData = (
            AlignmentsDownloadService.get_alignments_fasta_by_phylome_id(
                db_connection, phylome_id, DOWNLOADS_BASE_DIRECTORY
            )
        )
        return FileResponse(
            path=result["output_file_path"],
            media_type="application/x-tar",
            filename=result["output_file_name"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )


@router.get(
    "/phylome-downloads/phylomes/{phylome_id}/trees",
)
async def download_trees_newick(
    phylome_id: int,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
    lock: bool = Depends(phylome_trees_lock),
):
    try:
        result: GetTreesNewickData = (
            TreesDownloadService.get_trees_newick_by_phylome_id(
                db_connection, phylome_id, DOWNLOADS_BASE_DIRECTORY
            )
        )
        return FileResponse(
            path=result["output_file_path"],
            media_type="application/x-tar",
            filename=result["output_file_name"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )


@router.get(
    "/ete-smartview/proteomes/{genome_id}",
)
async def get_protein_sequences_by_genome_id(
    genome_id: int,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
):
    try:
        result = ProteomeDownloadService.get_proteome_fasta_by_genome_id(
            db_connection, genome_id, DOWNLOADS_BASE_DIRECTORY
        )
        return FileResponse(
            path=result["output_file_path"],
            media_type="application/fasta",
            filename=result["output_file_name"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )


@router.get(
    "/ete-smartview/alignment/{tree_id}/{alignment_type}",
    response_class=HTMLResponse,
)
def get_tree_alignment_html(
    tree_id: int,
    alignment_type: str,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
):
    try:
        html_result: str = AlignmentDisplayService.get_tree_alignment_html(
            db_connection, tree_id, alignment_type
        )
        return html_result
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
