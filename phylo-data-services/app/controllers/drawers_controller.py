#!/usr/bin/env python3
from typing import Final

from ete4.smartview.renderer import drawer as drawer_module  # type: ignore
from fastapi import APIRouter
from fastapi import HTTPException

from utils.tree_viewer import get_tid
from utils.tree_viewer import GLOBAL_TREE_CACHE

router = APIRouter()


@router.get("/drawers/{name}/{tree_id}")  # typed
def get_drawers_name_tree_id(
    name: str, tree_id: int | str
) -> dict[str, str | int] | None:
    """Return type (rect/circ) and number of panels of the drawer."""
    global GLOBAL_TREE_CACHE
    try:
        tid_subtree: tuple[int, list[int]] | None = get_tid(tree_id)
        if tid_subtree is not None:
            tree_id, _ = tid_subtree

        # NOTE: apparently we need to know the tree_id we are
        # referring to because it checks if there are aligned faces in
        # it to see if we are using a DrawerAlignX drawer (instead of
        # DrawerX).
        tree_layouts: list = sum(GLOBAL_TREE_CACHE.trees[int(tree_id)].layouts.values(), [])  # type: ignore
        if name not in ["Rect", "Circ"] and any(
            getattr(ly, "aligned_faces", False) and ly.active for ly in tree_layouts
        ):
            name = "Align" + name
        # TODO: We probably want to get rid of all this.
        drawer_class: Final = next(
            d
            for d in drawer_module.get_drawers()
            if d.__name__[len("Drawer") :] == name
        )
    except StopIteration:
        raise HTTPException(status_code=400, detail=f"not a valid drawer: {name}")
    return {"type": drawer_class.TYPE, "npanels": drawer_class.NPANELS}
