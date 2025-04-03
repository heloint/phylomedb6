#!/usr/bin/env python3

import mariadb  # type: ignore
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Response
from fastapi.responses import FileResponse

from services.taxonomy_trees_service import TaxonomyTreesService
from utils.mariadb_connection import MariadbSession

router = APIRouter()


@router.get("/taxonomy-trees/{phylome_id}/{tree_style}", response_model=None)
async def get_taxonomy_trees(
    phylome_id: int,
    tree_style: str,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
) -> str | Response:

    try:
        image_file_path: str = (
            TaxonomyTreesService.get_taxonomy_tree_images_by_phylome_id(
                db_connection, phylome_id, tree_style
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    return FileResponse(image_file_path)
