#!/usr/bin/env python3
from fastapi import APIRouter

from utils.tree_viewer import get_tid
from utils.tree_viewer import GLOBAL_TREE_CACHE

router = APIRouter()


@router.get("/layouts")  # typed
def app_get_layouts() -> dict[str, dict[str, bool]]:
    global GLOBAL_TREE_CACHE
    # Return dict that, for every layout module, has a dict with the
    # names of its layouts and whether they are active or not.
    layouts: dict[str, dict[str, bool]] = {
        "default": {
            layout.name: layout.active
            for layout in GLOBAL_TREE_CACHE.default_layouts  # type: ignore
            if layout.name
        }
    }

    return layouts


@router.get("/layouts/list")
def get_layouts_list() -> dict[str, list[list[str]]]:
    global GLOBAL_TREE_CACHE
    layouts_list: dict[str, list[list[str]]] = {
        module: [[ly.name, ly.description] for ly in layouts if ly.name]  # type: ignore
        for module, layouts in GLOBAL_TREE_CACHE.avail_layouts.items()  # type: ignore
    }
    return layouts_list


@router.get("/layouts/{tree_id}")  # typed
def get_layouts_tree_id(tree_id: str) -> dict[str, dict[str, bool]]:
    global GLOBAL_TREE_CACHE
    # Return dict that, for every layout module in the tree, has a dict
    # with the names of its layouts and whether they are active or not.
    result: tuple[int, list[int]] | None = get_tid(tree_id)
    if result is None:
        raise ValueError(f"Could not get TID for tree_id: {tree_id}")
    cache_tree_id, _ = result
    tree_layouts: dict
    tree_layouts = GLOBAL_TREE_CACHE.trees[cache_tree_id].layouts  # type: ignore

    layouts: dict[str, dict[str, bool]] = {}
    for module, lys in tree_layouts.items():
        layouts[module] = {l.name: l.active for l in lys if l.name}

    return layouts


@router.put("/layouts/update")
def put_layouts_update() -> None:
    global GLOBAL_TREE_CACHE
    GLOBAL_TREE_CACHE.update_app_global_available_layouts()
