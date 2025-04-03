#!/usr/bin/env python3
import os

import mariadb  # type: ignore
from pydantic import BaseModel
from ete4 import Tree  # type: ignore
from ete4.core import operations as ops  # type: ignore
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from utils.mariadb_connection import MariadbSession
from services.sequence_search_service import SequenceSearchService
from services.sequence_search_service import SequenceSearchSubmitResult

router = APIRouter()


class SequenceSearchParams(BaseModel):
    query_sequence: str


@router.post("/search-by-sequence")
async def search_genomes_by_sequence(
    sequence_search_params: SequenceSearchParams,
) -> SequenceSearchSubmitResult:
    # try:
    ssh_working_directory: str = os.environ["CLUSTER_BLAST_DB_PATH"]
    result = SequenceSearchService.submit_blast_protein_search(
        ssh_working_directory=ssh_working_directory,
        query_sequence=sequence_search_params.query_sequence,
    )
    return result


@router.get("/search-by-sequence/{submitted_job_id}/{job_directory_uuid}")
async def get_sequence_query_result(
    submitted_job_id: int,
    job_directory_uuid: str,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
):
    try:
        ssh_working_directory: str = os.environ["CLUSTER_BLAST_DB_PATH"]
        result = SequenceSearchService.get_search_result(
            db_connection=db_connection,
            submitted_job_id=submitted_job_id,
            job_directory_uuid=job_directory_uuid,
            ssh_working_directory=ssh_working_directory,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
