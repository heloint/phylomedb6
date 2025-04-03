#!/usr/bin/env python3

from fastapi import APIRouter
import json
from datetime import datetime
from typing import List, Tuple, Union
import os
from contextlib import asynccontextmanager
import mariadb  # type: ignore
from fastapi import FastAPI, HTTPException
from fastapi.param_functions import Depends

from ete3 import NCBITaxa  # type: ignore
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from utils.mariadb_connection import MariadbSession
from models.phylo_explorer_heatmap_dao import PhyloExplorerHeatmapDAO
from services.phylo_explorer_heatmap_service import PhyloExplorerHeatmapJSONService
from pydantic.main import BaseModel


router = APIRouter()


templates = Jinja2Templates(directory="templates")


class ExplorerParams(BaseModel):
    search_taxids: list[int]
    reduced_search: bool = False


@router.get("/phylo-explorer-service/phylo-explorer", response_class=HTMLResponse)
async def get_phylo_explorer_entry(request: Request):
    return templates.TemplateResponse(
        request=request, name="phylo_explorer_entry.html", context={}  # type: ignore
    )


@router.get("/phylo-explorer-service/all_species_heatmap")  # WORKING
def get_all_species_heatmap(
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
):
    """Retrieves all species available for searching and returns their names and tax IDs."""
    result: List[PhyloExplorerHeatmapDAO] = PhyloExplorerHeatmapDAO.all_species_heatmap(
        db_connection
    )
    output: list[str] = [f"{entry.species_name} -> [{entry.taxid}]" for entry in result]
    return output


@router.post("/phylo-explorer-service/heatmap_input")  # WORKING
def get_heatmap_input(
    explorer_params: ExplorerParams,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
):
    """Gets phylomes based on the provided search taxonomy IDs and returns a heatmap input as a dictionary"""
    phylomes: tuple[tuple[str, int, int, int]] | None = (
        PhyloExplorerHeatmapDAO.get_heatmap_input(
            db_connection, explorer_params.search_taxids
        )
    )
    if phylomes is None:
        raise HTTPException(
            status_code=404,
            detail=f"Could not find phylomes by the given taxonomy IDs: {explorer_params.search_taxids}",
        )
    d3_js_input: object = PhyloExplorerHeatmapJSONService(
        phylomes, explorer_params.search_taxids
    ).json_output

    heatmap_input_response_dict: dict[str, list | str | int | dict] = (
        PhyloExplorerHeatmapJSONService.object_to_dict(d3_js_input)
    )

    return heatmap_input_response_dict


@router.post("/phylo-explorer-service/heatmap_search_result")  # WORKING
def get_heatmap_search_result(
    explorer_params: ExplorerParams,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
):
    """Receives a list of taxonomy IDs and searches for corresponding phylomes in the database, returning the results."""

    result: List[tuple[int, str, str, str | None, datetime]] = (
        PhyloExplorerHeatmapDAO.get_heatmap_search_result(
            db_connection, explorer_params.search_taxids
        )
    )

    json_output: list[dict[str, Union[str, int, datetime, None]]] = [
        {
            "phylomeID": phylome_id,
            "phylomeName": phylome_name,
            "seed": seed,
            "comments": comments,
            "timeStamp": time_stamp.strftime("%Y-%m-%d"),  # type: ignore
        }
        for phylome_id, phylome_name, seed, comments, time_stamp in set(result)
    ]

    return json.dumps(json_output)


@router.post("/phylo-explorer-service/explorer_json")
def get_explorer_json(
    explorer_params: ExplorerParams,
    db_connection: mariadb.Connection = Depends(MariadbSession.get_connection),
):
    """Retrieves heatmap input based on taxonomy IDs, optionally reduces the result, and returns a JSON response."""
    phylomes: tuple[tuple[str, int, int, int]] | None = (
        PhyloExplorerHeatmapDAO.get_heatmap_input(
            db_connection, explorer_params.search_taxids
        )
    )
    if phylomes is None:
        raise HTTPException(
            status_code=404,
            detail=f"Phylome not found by the given taxonomy IDs: {explorer_params.search_taxids}",
        )

    divided_dict_obj: object = PhyloExplorerHeatmapJSONService(
        phylomes, explorer_params.search_taxids
    ).divided_json
    # If reduced_search flag is 'True' (as string), then reduce down the result
    # only to the first chunk. Two instances of the HeatmapJSON is created,
    # because the dendrogram tree must be reconstructed as well correspondingly
    # to the reduced data.

    # Serialize to JSON
    divided_dict: dict[str, list[Union[str, int]] | dict[str, list]] = (
        PhyloExplorerHeatmapJSONService.object_to_dict(divided_dict_obj)
    )
    if explorer_params.reduced_search:
        try:
            first_chunk_phy_ids: list[int] = [
                int(item) for item in divided_dict["colIDJSON_1"]
            ]

            reduced_phylomes: tuple[tuple[str, int, int, int]] | None = (
                PhyloExplorerHeatmapDAO.get_reduced_heatmap_input(
                    db_connection, first_chunk_phy_ids
                )
            )
            if reduced_phylomes is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Could not find any phylomes for the given taxonomy IDs: {first_chunk_phy_ids}",
                )

            reduced_divided_dict_obj: object = PhyloExplorerHeatmapJSONService(
                reduced_phylomes, explorer_params.search_taxids
            ).divided_json

            reduced_divided_dict: dict[str, list[Union[str, int]] | dict[str, list]] = (
                PhyloExplorerHeatmapJSONService.object_to_dict(reduced_divided_dict_obj)
            )

        except KeyError:
            reduced_divided_dict = divided_dict

        return reduced_divided_dict

    return JSONResponse(divided_dict)
