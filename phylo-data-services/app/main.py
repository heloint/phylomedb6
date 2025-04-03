#!/usr/bin/env python3
import os
from contextlib import asynccontextmanager
from typing import Any
from typing import Optional

from ete3 import NCBITaxa  # type: ignore
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Response
from fastapi.responses import FileResponse
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from controllers import drawers_controller, search_by_sequence_controller
from controllers import ete_smartview_controller
from controllers import layouts_controller
from controllers import taxonomy_trees_controller
from controllers import trees_controller
from controllers import phylo_explorer_controller
from controllers import phylome_downloads_controller
from services.taxonomy_trees_service import TaxonomyTreesService
from utils.tree_viewer import GLOBAL_TREE_CACHE

from services.phylo_explorer_db_service import PhyloExplorerDBService
from services.blast_db_service import BlastDBService

def setup_ncbi_taxonomy_database() -> None:
    if not os.path.exists("./taxdump.tar.gz") and not os.path.isfile(
        "./taxdump.tar.gz"
    ):
        ncbi = NCBITaxa()
        ncbi.update_taxonomy_database()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global GLOBAL_TREE_CACHE
    setup_ncbi_taxonomy_database()
    TaxonomyTreesService.generate_all_taxonomy_tree_images()
    BlastDBService.generate_blast_databases_for_genomes()
    PhyloExplorerDBService.generate_phylo_explorer_db()
    phylome_downloads_controller.setup_context()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(ete_smartview_controller.router)
app.include_router(drawers_controller.router)
app.include_router(layouts_controller.router)
app.include_router(trees_controller.router)
app.include_router(taxonomy_trees_controller.router)
app.include_router(phylo_explorer_controller.router)
app.include_router(phylome_downloads_controller.router)
app.include_router(search_by_sequence_controller.router)


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.exception_handler(404)
async def not_found_exception_handler(_: Optional[Any], exc: Any):
    return {"message": str(exc)}, 404


@app.exception_handler(400)
async def bad_request_exception_handler(_: Optional[Any], exc: Any):
    return {"message": str(exc)}, 400


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Optional[Any], exc: Any):
    return {"detail": exc.detail}, exc.status_code

def nice_html(content, title="Tree Explorer"):
    global GLOBAL_TREE_CACHE
    return f"""
<!DOCTYPE html>
<html><head><title>{title}</title>
<link rel="icon" type="image/png" href="/static/icon.png">
<link rel="stylesheet" href="/static/upload.css"></head>
<body><div class="centered">{content}</div></body></html>"""

@app.get("/", response_model=None)
async def get_root() -> str | Response:
    global GLOBAL_TREE_CACHE
    tree: dict[trees_controller.Tree] = GLOBAL_TREE_CACHE.trees  # type: ignore
    if GLOBAL_TREE_CACHE and tree:
        if len(GLOBAL_TREE_CACHE.trees) == 1:  # type: ignore
            name: str = list(t.name for t in GLOBAL_TREE_CACHE.trees.values())[0]  # type: ignore
            response = RedirectResponse(url=f"/static/gui.html?tree={name}")
            return response
        else:
            trees: str = "\n".join(
                '<li><a href="/static/gui.html?tree=' f'{t.name}">{t.name}</li>'
                for t in GLOBAL_TREE_CACHE.trees.values()  # type: ignore
            )
            return nice_html(f"<h1>Loaded Trees</h1><ul>\n{trees}\n</ul>")
    return nice_html(
        """<h1>ETE</h1>
<p>No trees loaded.</p>
<p>See the <a href="/help">help page</a> for more information.</p>"""
    )


@app.get("/help")
def get_help() -> str:
    return nice_html(
        """<h1>Help</h1>
You can go to the <a href="/static/upload.html">upload page</a>, see
a <a href="/">list of loaded trees</a>, or
<a href="http://etetoolkit.org/">consult the documentation</a>."""
    )


@app.get("/static/{path:path}")
def get_static_path(path) -> FileResponse:
    global GLOBAL_TREE_CACHE
    DIR: str = os.path.dirname(os.path.abspath(__file__))
    file_path: str = os.path.join(DIR, "static", path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)
