#!/usr/bin/env python3
import json
import sys
from time import time

import brotli  # type: ignore
from ete4 import Tree as Tree_ete  # type: ignore
from ete4.core import operations as ops  # type: ignore
from ete4.parser import newick  # type: ignore
from ete4.smartview.renderer import drawer as drawer_module  # type: ignore
from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from fastapi import Response
from fastapi.datastructures import QueryParams
from pydantic import BaseModel

from utils.tree_viewer import activate_clade  # type: ignore
from utils.tree_viewer import activate_node
from utils.tree_viewer import change_selection_name
from utils.tree_viewer import deactivate_clade
from utils.tree_viewer import deactivate_node
from utils.tree_viewer import find_node
from utils.tree_viewer import get_active_clade
from utils.tree_viewer import get_drawer
from utils.tree_viewer import get_newick
from utils.tree_viewer import get_nodes_info
from utils.tree_viewer import get_selection_info
from utils.tree_viewer import get_selections
from utils.tree_viewer import get_stats
from utils.tree_viewer import get_tid
from utils.tree_viewer import GLOBAL_TREE_CACHE
from utils.tree_viewer import load_tree
from utils.tree_viewer import prune_by_selection
from utils.tree_viewer import remove_active
from utils.tree_viewer import remove_search
from utils.tree_viewer import remove_selection
from utils.tree_viewer import search_to_selection
from utils.tree_viewer import sort_subtree
from utils.tree_viewer import store_active
from utils.tree_viewer import store_search
from utils.tree_viewer import store_selection
from utils.tree_viewer import TreeData
from utils.tree_viewer import unselect_node
from utils.tree_viewer import update_node_props
from utils.tree_viewer import update_node_style

router = APIRouter()


class Leaves(BaseModel):
    name: str
    props: dict[str, str]  # typed but need check
    id: list[int]


class NodeStyle(BaseModel):
    fgcolor: str
    bgcolor: str
    fgopacity: int
    outline_line_color: str
    outline_line_width: float
    outline_color: str
    outline_opacity: float
    vt_line_color: str
    hz_line_color: str
    hz_line_type: int
    vt_line_type: int
    size: int
    shape: str
    draw_descendants: bool
    hz_line_width: float
    vt_line_width: float


class Tree(BaseModel):
    leaves: Leaves
    props: dict
    node_id: str


class Trees:
    tree_data: TreeData
    layouts: dict
    selected: dict
    name: str
    time: float
    searches: dict
    style: dict
    ultrametric: bool
    nodestyles: NodeStyle
    initialized: bool


@router.get("/trees")
def get_trees() -> list[dict[str, str]]:
    global GLOBAL_TREE_CACHE
    GLOBAL_TREE_CACHE.remove_stale_tree_caches()
    # TODO: Add here the APP_GLOBAL loop through check for the stale cached tree objects!
    if GLOBAL_TREE_CACHE.safe_mode:  # type: ignore
        raise HTTPException(
            status_code=404, detail="invalid path /trees in safe_mode mode"
        )
    tree_return: list[dict[str, str]] = [
        {"id": str(tid), "name": str(tdata.name)} for tid, tdata in GLOBAL_TREE_CACHE.trees.items()  # type: ignore
    ]
    return tree_return


def touch_and_get(
    tree_id: str | int | None,
) -> tuple[TreeData | None, list[int] | None]:  # typed
    global GLOBAL_TREE_CACHE
    """Load tree, update its timer, and return the tree data object and subtree."""
    tid: int
    subtree: list[int] | None = None
    tree_data: TreeData | None = None

    tid_subtree = get_tid(tree_id)
    if tid_subtree is not None:
        tid, subtree = tid_subtree
        tree_data = GLOBAL_TREE_CACHE.trees[int(tid)]

    load_tree(tree_id)  # load if it was not loaded in memory
    tree_data.timer = time()  # type: ignore # update the tree's timer
    return tree_data, subtree


@router.get("/trees/{tree_id}")  # typed
def get_tree_tree_id(tree_id: int | None) -> dict[str, str | list | None]:
    global GLOBAL_TREE_CACHE
    if GLOBAL_TREE_CACHE.safe_mode:  # type: ignore
        raise HTTPException(
            status_code=404,
            detail=f"invalid path /trees/{tree_id} in safe_mode mode",
        )
    tree_data, subtree = touch_and_get(tree_id)
    if not tree_data:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found or has None value for tree ID: {tree_id}.",
        )
    props: set[str | int] = set()
    node: Tree
    for node in tree_data.tree[subtree].traverse():  # type: ignore
        props |= {k for k in node.props if not k.startswith("_")}
    tree_return: dict[str, str | list | None] = {
        "name": tree_data.name,
        "props": list(props),
    }
    return tree_return


@router.get("/trees/{tree_id}/nodeinfo")  # typed
def get_tree_nodeinfo(tree_id: int | None) -> dict:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    if not tree_data:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found or has None value for tree ID: {tree_id}.",
        )
    nodeinfo: dict = tree_data.tree[subtree].props  # type: ignore
    return nodeinfo


@router.get("/trees/{tree_id}/nodestyle")  # typed
def get_tree_nodestyle(tree_id: str | int | None) -> NodeStyle:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    if not tree_data or not tree_data.tree:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )
    nodestyle: NodeStyle = NodeStyle(
        fgcolor=tree_data.tree[subtree].sm_style["fgcolor"],
        bgcolor=tree_data.tree[subtree].sm_style["bgcolor"],
        fgopacity=tree_data.tree[subtree].sm_style["fgopacity"],
        outline_line_color=tree_data.tree[subtree].sm_style["outline_line_color"],
        outline_line_width=tree_data.tree[subtree].sm_style["outline_line_width"],
        outline_color=tree_data.tree[subtree].sm_style["outline_color"],
        outline_opacity=tree_data.tree[subtree].sm_style["outline_opacity"],
        vt_line_color=tree_data.tree[subtree].sm_style["vt_line_color"],
        hz_line_color=tree_data.tree[subtree].sm_style["hz_line_color"],
        hz_line_type=tree_data.tree[subtree].sm_style["hz_line_type"],
        vt_line_type=tree_data.tree[subtree].sm_style["vt_line_type"],
        size=tree_data.tree[subtree].sm_style["size"],
        shape=tree_data.tree[subtree].sm_style["shape"],
        draw_descendants=tree_data.tree[subtree].sm_style["draw_descendants"],
        hz_line_width=tree_data.tree[subtree].sm_style["hz_line_width"],
        vt_line_width=tree_data.tree[subtree].sm_style["vt_line_width"],
    )
    return nodestyle


@router.get("/trees/{tree_id}/editable_props")  # typed
def get_tree_editable_props(tree_id: int | None) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    filtered_props: dict[str, str] = {
        k: v
        for k, v in tree_data.tree[subtree].props.items()  # type: ignore
        if k not in ["tooltip", "hyperlink"] and type(v) in [int, float, str]
    }
    return filtered_props


@router.get("/trees/{tree_id}/name")  # typed
def get_tree_name(tree_id: str) -> str | None:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    if not tree_data or not tree_data.name:
        raise HTTPException(
            status_code=404,
            detail=f"Name attribute in the tree data has None value with tree ID: {tree_id}",
        )
    name: str | None = tree_data.name
    return name


@router.get("/trees/{tree_id}/newick")  # typed
def get_tree_newick(tree_id: int | str) -> str:
    global GLOBAL_TREE_CACHE
    MAX_MB: int = 200
    newick: str = get_newick(tree_id, MAX_MB)
    return newick


@router.get("/trees/{tree_id}/seq")  # typed
def get_tree_seq(tree_id: int | None) -> str:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)

    def fasta(node: Leaves):
        global GLOBAL_TREE_CACHE
        name: str = node.name if node.name else ",".join(map(str, node.id))
        name_seq: str = ">" + name + "\n" + node.props["seq"]
        return name_seq

    fasta_leaf: str = "\n".join(
        fasta(leaf)
        for leaf in tree_data.tree[subtree].leaves()  # type: ignore
        if leaf.props.get("seq")
    )

    return fasta_leaf


@router.get("/trees/{tree_id}/nseq")  # typed
def get_tree_nseq(tree_id: str | None | int) -> int:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    return sum(1 for leaf in tree_data.tree[subtree].leaves() if leaf.props.get("seq"))  # type: ignore


@router.get("/trees/{tree_id}/all_selections")  # typed
def get_tree_all_selections(
    tree_id: str | None,
) -> dict[str, dict[int | str, dict[str, int]]]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    if not tree_data:
        raise HTTPException(
            status_code=404, detail=f"Tree data not found for tree ID: {tree_id}."
        )
    all_selections: dict[str, dict[int | str, dict[str, int]]] = {
        "selected": {
            name: {"nresults": len(results), "nparents": len(parents)}
            for name, (results, parents) in (tree_data.selected or {}).items()
        }
    }
    return all_selections


@router.get("/trees/{tree_id}/selections")  # typed
def get_tree_selections(
    tree_id: str | None,
) -> dict[str, list[int | str] | None]:
    global GLOBAL_TREE_CACHE
    selection_result: list[str | int] | None = get_selections(tree_id)
    if selection_result is None:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve the tree selection by tree_id: {tree_id}",
        )
    return {"selections": selection_result}


@router.get("/trees/{tree_id}/select")  # typed
def get_tree_select(tree_id: str, request: Request) -> dict[str, str | int]:
    global GLOBAL_TREE_CACHE
    select_params: QueryParams = request.query_params
    nresults: int
    nparents: int
    nresults, nparents = store_selection(tree_id, dict(select_params))
    return {"message": "ok", "nresults": nresults, "nparents": nparents}


@router.get("/trees/{tree_id}/unselect")  # typed
def get_tree_unselect(tree_id: str, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    removed: bool = unselect_node(tree_id, dict(request.query_params))
    return {"message": "ok" if removed else "selection not found"}


@router.get("/trees/{tree_id}/remove_selection")  # typed
def get_tree_remove_selection(tree_id: str, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    removed: tuple = remove_selection(tree_id, dict(request.query_params))
    return {"message": "ok" if removed else "selection not found"}


@router.get("/trees/{tree_id}/change_selection_name")  # typed
def get_tree_change_Selection_name(tree_id: int, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    change_selection_name(tree_id, dict(request.query_params))
    return {"message": "ok"}


@router.get("/trees/{tree_id}/selection/info")  # typed
def get_tree_selection_info(
    tree_id: str, request: Request
) -> list[dict[str, int]] | dict[str, list]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    return get_selection_info(tree_data, dict(request.query_params))


@router.get("/trees/{tree_id}/search_to_selection")  # typed
def get_tree_search_to_selection(tree_id: int, request: Request):
    global GLOBAL_TREE_CACHE
    search_to_selection(tree_id, dict(request.query_params))
    return {"message": "ok"}


@router.get("/trees/{tree_id}/prune_by_selection")  # pending
def get_tree_prune_by_selection(tree_id: int, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    prune_by_selection(tree_id, dict(request.query_params))
    return {"message": "ok"}


@router.get("/trees/{tree_id}/active")  # typed
def get_tree_active(tree_id: str) -> str:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    node: Tree = tree_data.tree[subtree]  # type: ignore

    if get_active_clade(node, tree_data.active.clades.results):  # type: ignore
        return "active_clade"
    elif node in tree_data.active.nodes.results:  # type: ignore
        return "active_node"
    else:
        return ""


@router.get("/trees/{tree_id}/activate_node")  # typed
def get_tree_activate_node(tree_id: str) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    activate_node(tree_id)
    return {"message": "ok"}


@router.get("/trees/{tree_id}/deactivate_node")  # typed
def get_tree_deactivate_node(tree_id: str) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    deactivate_node(tree_id)
    return {"message": "ok"}


@router.get("/trees/{tree_id}/activate_clade")  # typed
def get_tree_activate_clade(tree_id: str) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    activate_clade(tree_id)
    return {"message": "ok"}


@router.get("/trees/{tree_id}/deactivate_clade")  # typed
def get_tree_deactivate_clade(tree_id: str) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    deactivate_clade(tree_id)
    return {"message": "ok"}


@router.get("/trees/{tree_id}/store_active_nodes")  # typed
def get_tree_store_active_nodes(tree_id: str, request: Request) -> dict[str, str | int]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    nresults, nparents = store_active(tree_data, 0, dict(request.query_params))
    return {"message": "ok", "nresults": nresults, "nparents": nparents}


@router.get("/trees/{tree_id}/store_active_clades")  # typed
def get_tree_store_active_clades(
    tree_id: str, request: Request
) -> dict[str, str | int]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    nresults, nparents = store_active(tree_data, 1, dict(request.query_params))
    return {"message": "ok", "nresults": nresults, "nparents": nparents}


@router.get("/trees/{tree_id}/remove_active_nodes")
def get_tree_remote_active_nodes(tree_id: str) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    remove_active(tree_data, 0)
    return {"message": "ok"}


@router.get("/trees/{tree_id}/remove_active_clades")  # typed
def get_tree_remote_active_clades(tree_id: str) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    remove_active(tree_data, 1)
    return {"message": "ok"}


@router.get("/trees/{tree_id}/all_active")  # typed
def get_tree_all_active(
    tree_id: str,
) -> dict[str, list[str] | list[str | int | dict]]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    return {
        "nodes": get_nodes_info(tree_data.active.nodes.results, ["*"]),  # type: ignore
        "clades": get_nodes_info(tree_data.active.clades.results, ["*"]),  # type: ignore
    }


@router.get("/trees/{tree_id}/all_active_leaves")  # typed
def get_tree_all_active_leaves(
    tree_id: str,
) -> (
    list[dict[str, int]] | dict[str, list]
):  # Need to check the contents of the output list
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    active_leaves: set[str] = set(
        n for n in tree_data.active.nodes.results if n.is_leaf  # type: ignore
    )
    for n in tree_data.active.clades.results:  # type: ignore
        active_leaves.update(set(n.leaves()))
    return get_nodes_info(active_leaves, ["*"])


@router.get("/trees/{tree_id}/searches")  # typed
def get_tree_searches(
    tree_id: str,
) -> dict[str, dict[str | int, dict[str, int]]]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    if not tree_data:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found or has None value for tree ID: {tree_id}.",
        )
    return {
        "searches": {
            text: {"nresults": len(results), "nparents": len(parents)}
            for text, (results, parents) in (tree_data.searches or {}).items()
        }
    }


@router.get("/trees/{tree_id}/search")  # typed
def get_tree_search(tree_id: str, request: Request) -> dict[str, int | str]:
    global GLOBAL_TREE_CACHE
    nresults: int
    nparents: int
    nresults, nparents = store_search(tree_id, dict(request.query_params))  # type: ignore
    return {"message": "ok", "nresults": nresults, "nparents": nparents}


@router.get("/trees/{tree_id}/remove_search")  # typed
def get_tree_remove_search(tree_id: int, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    removed: tuple = remove_search(tree_id, dict(request.query_params))
    return {"message": "ok" if removed else "search not found"}


@router.get("/trees/{tree_id}/find")  # typed
def get_tree_find(tree_id: str, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    try:
        tree_data, _ = touch_and_get(tree_id)
        if not tree_data:
            raise HTTPException(
                status_code=404,
                detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
            )
        node: Tree_ete = find_node(tree_data.tree, dict(request.query_params))
        if node is None:
            raise HTTPException(status_code=404, detail="Returned node has None value!")
        return {"id": ",".join(map(str, node.id))}
    except Exception as e:
        print(f"[ERROR] {str(e)}", file=sys.stderr)
        raise HTTPException(
            status_code=400, detail=f"Failed to find tree by ID: {tree_id}"
        )


@router.get("/trees/{tree_id}/draw")  # typed
def get_tree_draw(tree_id, request: Request, response: Response) -> Response:
    global GLOBAL_TREE_CACHE
    tree_data = GLOBAL_TREE_CACHE.trees.get(int(tree_id))
    if not tree_data or not tree_data.tree_node_tooltip_data:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )

    drawer: drawer_module.DrawerRectFaces | None = get_drawer(
        tree_id, dict(request.query_params)
    )
    if drawer is None:
        raise HTTPException(
            status_code=404,
            detail=f"Returned drawer has None value for tree ID: {tree_id}!",
        )
    try:
        drawed_graphics = list(drawer.draw())
        for idx, g in enumerate(drawed_graphics):
            if g[0] == "nodebox" and str(drawed_graphics[idx][2]).lower().startswith(
                "phy"
            ):
                node_id: str = drawed_graphics[idx][2]
                node_id_parts: list[str] = node_id.lower().replace("phy", "").split("_")
                protein_id: str = node_id_parts[0]
                drawed_graphics[idx][3] = {
                    "node_id": node_id,
                    **tree_data.tree_node_tooltip_data[int(protein_id)].model_dump(),
                }

        graphics: bytes = json.dumps(drawed_graphics).encode("utf8")
        if GLOBAL_TREE_CACHE.compress:  # type: ignore
            compressed_graphics: bytes = brotli.compress(graphics)
            response = Response(
                content=compressed_graphics, media_type="application/json"
            )
            response.headers["Content-Encoding"] = "br"
            return response
        return Response(content=graphics, media_type="application/json")
    except (AssertionError, SyntaxError) as e:
        raise HTTPException(status_code=400, detail=f"when drawing: {e}")


@router.get("/trees/{tree_id}/size")  # typed
def get_tree_size(tree_id: str) -> dict[str, float]:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    width, height = tree_data.tree[subtree].size  # type: ignore
    return {"width": width, "height": height}


@router.get("/trees/{tree_id}/collapse_size")  # typed
def get_trees_collapse(tree_id: str) -> int:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    if not tree_data or not tree_data.style:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )
    collapse_size: int = tree_data.style.collapse_size
    return collapse_size


@router.get("/trees/{tree_id}/properties")  # typed
def get_tree_properties(tree_id: str) -> list[str]:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    props: set[str] = set()
    for node in tree_data.tree[subtree].traverse():  # type: ignore
        props = node.props.keys()

    return list(props)


@router.get("/trees/{tree_id}/properties/{pname}")  # typed
def get_tree_properties_pname(tree_id: str, pname: str) -> dict[str, float] | None:
    global GLOBAL_TREE_CACHE
    return get_stats(tree_id, pname)


@router.get("/trees/{tree_id}/nodecount")  # typed
def get_tree_nodecount(tree_id: str) -> dict[str, int]:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)

    tnodes: int = 0
    tleaves: int = 0
    node: Tree_ete
    for node in tree_data.tree[subtree].traverse():  # type: ignore
        tnodes += 1
        if node.is_leaf:
            tleaves += 1

    return {"tnodes": tnodes, "tleaves": tleaves}


@router.get("/trees/{tree_id}/ultrametric")  # typed
def get_tree_ultrametric(tree_id: str) -> bool | None:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    if tree_data is None:
        raise ValueError(f"None value was returned for tree_id: {tree_id}")
    ultrametric: bool | None = tree_data.ultrametric
    return ultrametric


@router.put("/trees/{tree_id}/sort")  # typed
async def put_tree_sort(tree_id: str, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    body: dict = await request.json()

    node_id: str
    key_text: str
    reverse: bool
    node_id, key_text, reverse = body
    sort_subtree(tree_id, node_id, key_text, reverse)
    return {"message": "ok"}


@router.put("/trees/{tree_id}/set_outgroup")  # typed
async def put_tree_set_outgroup(tree_id: str, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    if not tree_data or not tree_data.ultrametric:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )
    elif subtree:
        raise HTTPException(
            status_code=400, detail="operation not allowed with subtree"
        )
    node_id: dict = await request.json()
    tree_data.tree.set_outgroup(tree_data.tree[node_id])  # type: ignore
    ops.update_sizes_all(tree_data.tree)
    return {"message": "ok"}


@router.put("/trees/{tree_id}/move")  # typed
async def put_tree_move(tree_id: str, request: Request) -> dict[str, str] | None:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    body: dict = await request.json()
    node_id: str = body[0]
    shift: str = body[1]
    try:
        ops.move(tree_data.tree[subtree][node_id], shift)  # type: ignore
        return {"message": "ok"}
    except AssertionError as e:
        raise HTTPException(status_code=400, detail=f"cannot move {node_id}: {e}")


@router.put("/trees/{tree_id}/remove")  # typed
async def put_tree_remove(tree_id: str, request: Request) -> dict[str, str] | None:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    if not tree_data or not tree_data.ultrametric:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )
    body: str = await request.json()
    node_id: str = body
    try:
        ops.remove(tree_data.tree[subtree][node_id])  # type: ignore
        ops.update_sizes_all(tree_data.tree)
    except AssertionError as e:
        raise HTTPException(status_code=400, detail=f"cannot move {node_id}: {e}")

    return {"message": "ok"}


@router.put("/trees/{tree_id}/rename")  # typed
async def put_tree_rename(tree_id: str, request: Request) -> dict[str, str] | None:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    node_id: str = ""
    body = await request.json()
    try:
        node_id = body[0]
        name: str = body[1]
        tree_data.tree[subtree][node_id].name = name  # type: ignore
    except AssertionError as e:
        raise HTTPException(status_code=400, detail=f"cannot rename {node_id}: {e}")
    return {"message": "ok"}


@router.put("/trees/{tree_id}/edit")  # typed
async def put_tree_edit(tree_id: str, request: Request) -> dict[str, str] | None:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    if not tree_data or not tree_data.tree:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )
    body = await request.json()
    node_id: str = body[0]
    content: str = body[1]
    try:
        node: Tree = tree_data.tree[subtree][node_id]  # type: ignore

        node.props = newick.get_props(content, is_leaf=True)
        ops.update_sizes_all(tree_data.tree)
        return {"message": "ok"}
    except (AssertionError, newick.NewickError) as e:
        raise HTTPException(status_code=400, detail=f"cannot edit {node_id}: {e}")


@router.put("/trees/{tree_id}/to_dendrogram")  # typing
async def put_tree_to_dendrogram(tree_id: str, request: Request) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    if not tree_data or not tree_data.tree:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )
    node_id: str = await request.json()
    ops.to_dendrogram(tree_data.tree[subtree][node_id])  # type: ignore
    ops.update_sizes_all(tree_data.tree)
    return {"message": "ok"}


@router.put("/trees/{tree_id}/to_ultrametric")  # typing
async def put_tree_to_ultrametric(
    tree_id: str, request: Request
) -> dict[str, str] | None:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    if not tree_data or not tree_data.tree:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )
    try:
        body: str = await request.json()
        node_id: str = body
        node: Tree = tree_data.tree[subtree][node_id]  # type: ignore
        ops.to_ultrametric(node)
        ops.update_sizes_all(tree_data.tree)
        return {"message": "ok"}
    except AssertionError as e:
        raise HTTPException(
            status_code=400,
            detail=f"cannot convert to ultrametric {tree_id}: {e}",
        )


@router.put("/trees/{tree_id}/update_props")  # typing
async def put_tree_update_props(
    tree_id: str, request: Request
) -> dict[str, str] | None:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    node: Tree = tree_data.tree[subtree]  # type: ignore
    body: dict = await request.json()
    try:
        update_node_props(node, body)
        return {"message": "ok"}
    except AssertionError as e:
        raise HTTPException(
            status_code=400,
            detail=f"cannot update props of {node.node_id}: {e}",
        )


@router.put("/trees/{tree_id}/update_nodestyle")  # typed
async def put_tree_update_nodestyle(
    tree_id: str, request: Request
) -> dict[str, str] | None:
    global GLOBAL_TREE_CACHE
    tree_data, subtree = touch_and_get(tree_id)
    node: Tree = tree_data.tree[subtree]  # type: ignore
    try:
        body: dict = await request.json()
        update_node_style(node, dict(body))
        tree_data.nodestyles[node] = body  # type: ignore
        return {"message": "ok"}
    except AssertionError as e:
        raise HTTPException(
            status_code=400,
            detail=f"cannot update style of {node.node_id}: {e}",
        )


@router.put("/trees/{tree_id}/reinitialize")  # typed
def put_tree_reinitialize(tree_id: str) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    tree_data, _ = touch_and_get(tree_id)
    if not tree_data or not tree_data.tree:
        raise HTTPException(
            status_code=404,
            detail=f"Tree data not found nor in the database nor in the runtime cache with ID: {tree_id}",
        )
    tree_data.initialized = False
    ops.update_sizes_all(tree_data.tree)
    return {"message": "ok"}


@router.put("/trees/{tree_id}/reload")  # typed
def put_tree_reload(tree_id: str) -> dict[str, str]:
    global GLOBAL_TREE_CACHE
    _, subtree = touch_and_get(tree_id)

    if subtree:
        raise HTTPException(
            status_code=400, detail="operation not allowed with subtree"
        )

    GLOBAL_TREE_CACHE.trees.pop(tree_id, None)  # type: ignore # avoid possible key-error
    return {"message": "ok"}
