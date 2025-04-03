import _pickle as pickle  # type: ignore
import bz2
from pprint import pprint
import gzip
import json
import os
import re
import shutil
import sys
import tarfile
import zipfile
from collections import defaultdict
from copy import copy
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime
from datetime import timedelta
from importlib import reload as module_reload
from io import BufferedReader
from math import inf
from math import pi
from pathlib import Path
from threading import Thread
from time import time
from types import CodeType
from typing import Any
from typing import Callable
from typing import List
from typing import Literal
from typing import NamedTuple
from typing import Optional

from ete4 import Tree  # type: ignore
from ete4 import treematcher as tm
from ete4.core import operations as ops  # type: ignore
from ete4.nexml._nexml import Trees  # type: ignore
from ete4.parser import ete_format  # type: ignore
from ete4.parser import newick  # type: ignore
from ete4.parser import nexus
from ete4.smartview import layout_modules  # type: ignore
from ete4.smartview import TreeStyle
from ete4.smartview.renderer import drawer as drawer_module  # type: ignore
from ete4.smartview.renderer.layouts.default_layouts import TreeLayout  # type: ignore
from fastapi import HTTPException
from fastapi import Request

from models.tree_node_tooltip_data_dao import TreeNodeTooltipData
from services.tree_view_data_service import GeneOrderTreeLayout, TreeViewData


@dataclass
class TreeData:
    tree: Optional[Tree] = None
    name: Optional[str] = None
    style: Optional[TreeStyle] = None
    nodestyles: Optional[dict] = None
    include_props: Optional[list] = None
    exclude_props: Optional[list] = None
    layouts: Optional[dict[str, list[TreeLayout]]] = None
    timer: Optional[float] = None
    ultrametric: Optional[bool] = False
    initialized: Optional[bool] = False
    selected: Optional[dict] = None
    active: Optional[NamedTuple] = None  # active nodes
    searches: Optional[dict] = None
    tree_node_tooltip_data: Optional[dict[int, TreeNodeTooltipData]] = None
    timestamp: Optional[datetime] = None


class GlobalTreeCache:
    def __init__(
        self,
        tree: Optional[Tree] = None,
        layouts: Optional[list] = None,
        include_props: Optional[list | str] = None,
        exclude_props: Optional[list | str] = None,
        safe_mode: bool = False,
        compress: bool = False,
    ) -> None:
        """Initialize the global object APP_GLOBAL."""
        self.default_layouts: list[TreeLayout]
        self.avail_layouts: dict[str, TreeLayout]

        self.default_layouts, self.avail_layouts = self.get_layouts(layouts)

        self.safe_mode: bool = safe_mode
        self.compress: bool = compress
        self.trees: dict[int, TreeData] = {}

    def remove_stale_tree_caches(self) -> None:
        keys_to_remove: list[int] = []
        for key, tree in self.trees.items():
            if tree.timestamp is None:
                raise ValueError("Cached tree hasn't got a timestamp!")
            tree_timestamp: datetime = tree.timestamp
            current_timestamp: datetime = datetime.now()
            timestamp_diff: timedelta = current_timestamp - tree_timestamp
            if timestamp_diff > timedelta(hours=1):
                keys_to_remove.append(key)

        for key in keys_to_remove:
            del self.trees[key]
            Path(f"/tmp/{key}.pickle").unlink()

    def get_layouts(
        self,
        layouts=None,
    ) -> tuple[list[dict], dict[str, Any]]:  # semi typed incomplete TODO
        layouts_from_module: dict = self.get_layouts_from_getters()
        default_layouts: list = layouts_from_module.pop("default_layouts")

        all_layouts: dict = {}
        idx: int

        layout: Any
        for idx, layout in enumerate(default_layouts + (layouts or [])):
            layout.module = "default"
            all_layouts[layout.name or idx] = layout

        return list(all_layouts.values()), layouts_from_module

    def get_layouts_from_getters(self) -> dict[str, dict]:  # typed
        """Return a dict {name: [layout1, ...]} for all layout submodules."""
        # The list contains, for every submodule of layout_modules, an
        # instance of all the LayoutX classes that the submodule contains.
        submodules: list = [
            getattr(layout_modules, module)
            for module in dir(layout_modules)
            if not module.startswith("__")
        ]

        all_layouts: dict = {}
        module: Callable
        for module in submodules:
            name: str = module.__name__.split(".")[-1]

            layouts: list[Any] = [
                getattr(module, getter)()
                for getter in dir(module)
                if getter.startswith("Layout")
            ]

            for layout in layouts:  # TODO: is this necessary? remove if not
                layout.module = name  # set for future reference

            all_layouts[name] = layouts

        return all_layouts

    def update_app_global_available_layouts(self) -> None:  # typed
        try:
            module_reload(layout_modules)
            self.avail_layouts = self.get_layouts_from_getters()
            self.avail_layouts.pop("default_layouts", None)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error while updating APP_GLOBAL layouts: {e}",
            )


GLOBAL_TREE_CACHE = GlobalTreeCache()
G_THREADS: dict[Any, Any] = {}


def initialize_tree_style(tree_data: TreeData) -> None:  # typed
    global GLOBAL_TREE_CACHE
    # Save aligned_grid_dxs to add them later.
    if tree_data.style is not None:
        aligned_grid_dxs = deepcopy(tree_data.style.aligned_grid_dxs)

    tree_data.style = TreeStyle()
    if tree_data.style is not None:
        tree_data.style.aligned_grid_dxs = aligned_grid_dxs

    # Layout pre-render
    tree: Tree = tree_data.tree
    style: TreeStyle = tree_data.style
    if tree_data.layouts:
        for layouts in tree_data.layouts.values():
            if layouts is not None:
                for layout in layouts:
                    if layout.active:
                        layout.set_tree_style(tree, style)
                        # A terrible way of saying something that should be like:
                        #   tree_data.style.update(layout.tree_style)
        else:
            return None
    tree_data.initialized = True


def load_tree(tree_id: str | int | None) -> Tree:  # typed
    global GLOBAL_TREE_CACHE
    "Add tree to APP_GLOBAL.trees and initialize it if not there, and return it"
    try:
        tid_subtree: tuple[int, list[int]] | None = get_tid(tree_id)
        if tid_subtree is not None:
            tid: int
            subtree: list[int]

            tid, subtree = tid_subtree
        if tid in GLOBAL_TREE_CACHE.trees:
            tree_data: Tree = GLOBAL_TREE_CACHE.trees[tid]

            # Reinitialize if layouts have to be reapplied
            if not tree_data.initialized:
                initialize_tree_style(tree_data)

                for node in tree_data.tree[subtree].traverse():
                    node.is_initialized = False
                    node._smfaces = None
                    node._collapsed_faces = None
                    node._sm_style = None
                for node, args in tree_data.nodestyles.items():
                    update_node_style(node, args.copy())
            tree: Tree = tree_data.tree[subtree]
            return tree
        else:
            tree_data = GLOBAL_TREE_CACHE.trees[tid] = retrieve_tree_data(tid)  # type: ignore

            if tree_data.ultrametric:
                ultrametric = tree_data.tree.to_ultrametric()
                ops.update_sizes_all(tree_data.tree)

            initialize_tree_style(tree_data)

            tree = tree_data.tree[subtree]
            return tree

    except (AssertionError, IndexError):
        raise HTTPException(status_code=404, detail=f"unknown tree id {tree_id}")


# Loads tree from a newick file
def load_tree_from_newick(tid: int, nw: str) -> Tree:  # typed
    global GLOBAL_TREE_CACHE
    """Load tree into memory from newick"""
    t: Tree = Tree(nw)

    ops.update_sizes_all(t)

    return t


# Retrive layouts and return a dict
def retrieve_layouts(
    layouts: dict | list[TreeLayout | GeneOrderTreeLayout] | None,
) -> dict[str, list[TreeLayout]]:
    global GLOBAL_TREE_CACHE
    tree_layouts: defaultdict[str, list[TreeLayout]] = defaultdict(list)
    tree_layouts_dict: dict[str, list[TreeLayout]]
    if type(layouts) == list and all(
        map(lambda x: isinstance(x, (TreeLayout, GeneOrderTreeLayout)), layouts)
    ):
        tree_layouts_dict = {layout.name: [layout] for layout in layouts}
        tree_layouts_dict["default"] = []

        # Add default layouts
        tree_layouts_dict["default"] = deepcopy(GLOBAL_TREE_CACHE.default_layouts)
        return tree_layouts_dict

    layouts = layouts or []
    for ly in layouts:
        if not isinstance(ly, str):
            continue
        name_split: list[str] = ly.split(":")
        key: str | None = None
        ly_name: str | None = None
        active: bool | None = None
        if len(name_split) not in (2, 3):
            continue

        if len(name_split) == 2:
            key, ly_name = name_split
            active = None

        elif len(name_split) == 3:
            key, ly_name, active_value = name_split
            active = True if active_value == "on" else False

        if key is None:
            raise ValueError("Tree layout key could not be assigned!")

        avail: list = deepcopy(GLOBAL_TREE_CACHE.avail_layouts.get(key, []))
        if ly_name == "*":
            if active is not None:
                for ly in avail:
                    ly.active = active

            tree_layouts[key] = avail
        else:
            match: Any | None = next((ly for ly in avail if ly.name == ly_name), None)
            if match:
                if active is not None:
                    match.active = active
                tree_layouts[key].append(match)

    # Add default layouts
    tree_layouts["default"] = deepcopy(GLOBAL_TREE_CACHE.default_layouts)  # type: ignore
    tree_layouts_dict = dict(tree_layouts)
    return tree_layouts_dict


# Retrive the tree data with given tid
def retrieve_tree_data(tid: int) -> TreeData:  # Typed
    """Retrieve and return tree data from file.
    It retrieves all that from a previously saved pickle file in /tmp."""
    global GLOBAL_TREE_CACHE
    # Called when tree has been deleted from memory.
    tree_data: TreeData
    try:
        tree_data = pickle.load(open(f"/tmp/{tid}.pickle", "rb"))
    except (FileNotFoundError, EOFError, pickle.UnpicklingError) as e:
        print(
            f"Tree {tid} cannot be recovered from disk. Loading placeholder.",
            file=sys.stderr,
        )

        print(str(e), file=sys.stderr)
        tree_data = TreeData()
        tree_data.name = "Placeholder tree"
        tree_data.tree = Tree("(could,not,load,tree);")
        ops.update_sizes_all(tree_data.tree)

    tree_data.style = copy_style(TreeStyle())
    tree_data.layouts = retrieve_layouts(tree_data.layouts)

    tree_data.active = drawer_module.get_empty_active()
    tree_data.timer = time()  # to track if it is active

    return tree_data


def get_drawer(tree_id: int, args: dict):
    "Return the drawer initialized as specified in the args"
    global GLOBAL_TREE_CACHE
    valid_keys: list[str] = [
        "x",
        "y",
        "w",
        "h",
        "panel",
        "zx",
        "zy",
        "za",
        "drawer",
        "min_size",
        "layouts",
        "ultrametric",
        "collapsed_ids",
        "rmin",
        "amin",
        "amax",
    ]

    try:
        assert all(k in valid_keys for k in args.keys()), "invalid keys"

        get: Callable[[Any, int | float], float] = lambda x, default: float(
            args.get(x, default)
        )  # shortcut

        viewport: list[float] | None = (
            [get(k, 0) for k in ["x", "y", "w", "h"]]
            if all(k in args for k in ["x", "y", "w", "h"])
            else None
        )
        assert viewport is None or (
            viewport[2] > 0 and viewport[3] > 0
        ), "invalid viewport"  # width and height must be > 0

        panel: float = get("panel", 0)

        zoom: tuple[float, float, float] = (
            get("zx", 1),
            get("zy", 1),
            get("za", 1),
        )
        assert zoom[0] > 0 and zoom[1] > 0 and zoom[2] > 0, "zoom must be > 0"

        load_tree(tree_id)  # in case it went out of memory
        tid_subtree: tuple[int, list[int]] | None = get_tid(tree_id)
        tid: int | None = None
        if tid_subtree is not None:
            tid, _ = tid_subtree

        if tid is None:
            raise ValueError(f"tid remained with value `None` after reevaulation.")

        tree_data: TreeData = GLOBAL_TREE_CACHE.trees[tid]  # type: ignore
        active_layouts: dict | None = args.get("layouts")
        if active_layouts is not None:
            update_layouts(active_layouts, tid)
        layouts: set[drawer_module.DrawerRectFaces] | None = None
        if tree_data.layouts is not None:
            if isinstance(tree_data.layouts, dict):
                layouts = set(
                    ly for ly in sum(tree_data.layouts.values(), []) if ly.active
                )
            elif isinstance(tree_data.layouts, list):
                layouts = set(
                    ly for ly in tree_data.layouts if ly.active  # type: ignore
                )
            else:
                raise ValueError(
                    f"The `layouts` attribute in the tree_data object is neither a dictionary neither a list."
                )

        if layouts is None:
            raise ValueError(
                f"layouts stayed with value `None` even after reevaulation!"
            )

        drawer_name: str = args.get("drawer", "RectFaces")
        # Automatically provide aligned drawer when necessary
        if drawer_name not in ["Rect", "Circ"] and any(
            getattr(ly, "aligned_faces", False) for ly in layouts
        ):
            align: str = "Align"
            drawer_name = align + drawer_name
        drawer_class: drawer_module.DrawerRectFaces | None = next(
            (
                d
                for d in drawer_module.get_drawers()
                if d.__name__[len("Drawer") :] == drawer_name
            ),
            None,
        )
        if drawer_class is not None:
            drawer_class.COLLAPSE_SIZE = get("min_size", 6)
            assert drawer_class.COLLAPSE_SIZE > 0, "min_size must be > 0"

        limits: tuple[float, Literal[0], float, float] | None = (
            None
            if not drawer_name.startswith("Circ")
            else (
                get("rmin", 0),
                0,
                get("amin", -180) * pi / 180,
                get("amax", 180) * pi / 180,
            )
        )

        collapsed_ids: set[tuple[int, ...]] = set(
            tuple(int(i) for i in node_id.split(",") if i != "")
            for node_id in json.loads(args.get("collapsed_ids", "[]"))
        )

        ultrametric: bool = args.get("ultrametric") == "1"  # asked for ultrametric?

        if ultrametric and not tree_data.ultrametric:  # change to on
            if tree_data.tree is not None:
                tree_data.tree.to_ultrametric()
            ops.update_sizes_all(tree_data.tree)
            initialize_tree_style(tree_data)
            tree_data.ultrametric = ultrametric
        elif not ultrametric and tree_data.ultrametric:  # change to off
            GLOBAL_TREE_CACHE.trees.pop(tid, None)  # type: ignore # delete from memory
            # Forces it to be reloaded from disk next time it is accessed.

        active: drawer_module.TreeActive | None | NamedTuple = tree_data.active
        selected: dict | None = tree_data.selected
        searches: dict | None = tree_data.searches

        drawer_class = drawer_class(
            load_tree(tree_id),
            viewport,
            panel,
            zoom,
            limits,
            collapsed_ids,
            active,
            selected,
            searches,
            layouts,
            tree_data.style,
            tree_data.include_props,
            tree_data.exclude_props,
        )  # type: ignore

        return drawer_class
    # bypass errors for now...
    except StopIteration:
        raise HTTPException(
            status_code=400, detail=f"not a valid drawer: {drawer_name}"
        )

    except (ValueError, AssertionError) as e:
        raise HTTPException(status_code=400, detail=str(e))


def get_newick(tree_id: int | str, max_mb: int | float) -> str:
    global GLOBAL_TREE_CACHE
    "Return the newick representation of the given tree"
    nw: Tree = load_tree(tree_id)

    if nw != None:
        nw = nw.write()

    size_mb: int | float = len(nw) / 1e6
    if size_mb > max_mb:
        raise HTTPException(
            status_code=400, detail="newick too big (%.3g MB)" % size_mb
        )

    return nw


# Remove search
def remove_search(tid: int, args: dict) -> tuple:  # typed
    "Remove search"
    global GLOBAL_TREE_CACHE
    if "text" not in args:
        raise HTTPException(status_code=400, detail="Missing search text")

    searches: dict = GLOBAL_TREE_CACHE.trees[int(tid)].searches  # type: ignore
    text: str = args.pop("text").strip()
    search: tuple = searches.pop(text, None)

    return search


# Store search
def store_search(tree_id: str, args: dict) -> tuple:  # Typed
    global GLOBAL_TREE_CACHE
    "Store the results and parents of a search and return their numbers"
    if "text" not in args:
        raise HTTPException(status_code=400, detail="missing search text")

    text: str = args.pop("text").strip()

    func: Optional[Callable] = get_search_function(text)

    try:
        load_tree_v: Tree = load_tree(tree_id)

        if load_tree_v is not None:
            results: set = set(
                node for node in load_tree_v.traverse() if func(node)  # type: ignore
            )

        if len(results) == 0:
            return 0, 0

        parents: defaultdict[str, int] = get_parents(results)
        tid_subtree: tuple[int, list[int]] | None = get_tid(tree_id)
        tid: int
        if tid_subtree is not None:
            tid, _ = tid_subtree

        GLOBAL_TREE_CACHE.trees[tid].searches[text] = (results, parents)  # type: ignore
        len_parents_results: tuple[int, int] = len(results), len(parents)
        return len_parents_results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"evaluating expression: {e}")


def find_node(tree: Tree, args: dict) -> Tree | None:
    global GLOBAL_TREE_CACHE
    if "text" not in args:
        raise HTTPException(status_code=400, detail="missing search text")

    text: str = args.pop("text").strip()
    func: Optional[Callable] = get_search_function(text)

    if func is not None:
        return next((node for node in tree.traverse() if func(node)), None)
    return None


def get_selections(tree_id: int | str | None) -> list[str | int] | None:
    global GLOBAL_TREE_CACHE
    tid: int
    subtree: list[int]

    tid_subtree: tuple | None = get_tid(tree_id)
    if tid_subtree is None:
        return None

    tid, subtree = tid_subtree
    tree_data: TreeData = GLOBAL_TREE_CACHE.trees[tid]
    if tree_data.tree is None:
        return None

    node: Tree = tree_data.tree[subtree]
    if tree_data.selected is None:
        return None

    selection_result: list[str | int] = [
        name for name, (results, _) in tree_data.selected.items() if node in results
    ]

    return selection_result


def update_node_props(node: Tree, args: dict) -> None:  # Typed
    global GLOBAL_TREE_CACHE
    prop: dict
    value: dict
    for prop, value in node.props.items():
        newvalue: dict = args.pop(prop, "").strip()
        if newvalue:
            try:  # convert to proper type
                newvalue = type(value)(newvalue)
            except:
                raise HTTPException(
                    status_code=400,
                    detail=f"property {prop} should be of type {type(value)}",
                )
            node.add_prop(prop, newvalue)


# Update node style
def update_node_style(node: Tree, args: dict) -> None:  # typed
    global GLOBAL_TREE_CACHE
    newstyle: dict = {}
    for prop, value in dict(node.sm_style).items():
        newvalue: str | int = args.pop(prop, "").strip()
        if newvalue:
            try:  # convert to proper type
                newvalue = type(value)(newvalue)
            except:
                raise HTTPException(
                    status_code=400,
                    detail=f"property {prop} should be of type {type(value)}",
                )

            else:
                newstyle[prop] = newvalue

    extend_to_descendants: list = args.pop("extend_to_descendants", None)
    if extend_to_descendants:
        nodes: list[Tree] = node.traverse()
    else:
        nodes = [node]

    for node in nodes:
        for key, value in newstyle.items():
            node.sm_style[key] = value


# Get nodes info
def get_nodes_info(
    nodes: set, props: list
) -> list[dict[str, int]] | dict[str, list]:  # typed
    global GLOBAL_TREE_CACHE
    no_props: bool = len(props) == 1 and props[0] == ""
    node_ids: list
    if "id" in props or no_props or "*" in props:
        node_ids = [",".join(map(str, node.id)) for node in nodes]
    if no_props:
        return node_ids

    nodes_info: list[dict] = []
    for idx, node in enumerate(nodes):
        if props[0] == "*":
            node_id: str | int = node_ids[idx]
            nodes_info.append({"id": node_id})
        else:
            node_p: dict[str, str] = {p: node.props.get(p) for p in props}
            if "id" in props:
                node_p["id"] = node_ids[idx]
            nodes_info.append(node_p)

    return nodes_info


# Get selections info
def get_selection_info(
    tree_data, args
) -> list[dict[str, int]] | dict[str, list]:  # typed
    global GLOBAL_TREE_CACHE
    "Get selection info from their nodes"
    if "text" not in args:
        raise HTTPException(status_code=400, detail="missing selection text")

    name: str = args.pop("text").strip()
    nodes: set = tree_data.selected.get(name, [[]])[0]

    props: list[str] = args.pop("props", "").strip().split(",")
    return get_nodes_info(nodes, props)


# remove selection
def remove_selection(tid, args) -> tuple:  # typed
    global GLOBAL_TREE_CACHE
    "Remove selection"
    if "text" not in args:
        raise HTTPException(status_code=400, detail="missing selection text")

    name: str = args.pop("text").strip()
    selected: tuple = GLOBAL_TREE_CACHE.trees[int(tid)].selected.pop(name, None)  # type: ignore
    return selected


# change selection name
def change_selection_name(tid: int, args: dict) -> None:  # typed
    global GLOBAL_TREE_CACHE
    if "name" not in args or "newname" not in args:
        raise HTTPException(status_code=400, detail="missing renaming parameters")

    name: str = args.pop("name").strip()
    selected: dict = GLOBAL_TREE_CACHE.trees[int(tid)].selected  # type: ignore

    if name not in selected.keys():
        raise HTTPException(status_code=400, detail=f"selection {name} does not exist")

    new_name: str = args.pop("newname").strip()
    selected[new_name] = selected[name]
    selected.pop(name)


# Unselect node
def unselect_node(tree_id, args) -> bool:  # Typed
    global GLOBAL_TREE_CACHE
    tree_data: Tree
    subtree: List[int] | None
    tid_subtree: tuple | None = get_tid(tree_id)
    if tid_subtree is not None:
        tid, subtree = tid_subtree
    tree_data = GLOBAL_TREE_CACHE.trees[tid]  # type: ignore
    node: Tree = tree_data.tree[subtree]
    name: str = args.pop("text", "").strip()
    selections: dict
    if name in tree_data.selected.keys():
        selections = {name: tree_data.selected[name]}
    else:
        selections = dict(tree_data.selected)  # copy all

    removed: bool = False
    for name, (results, parents) in selections.items():
        nresults: int = len(results)
        results.discard(node)
        if len(results) == 0:
            removed = True
            tree_data.selected.pop(name)
        elif nresults > len(results):
            removed = True
            parents = get_parents(results)
            tree_data.selected[name] = (results, parents)

    return removed


# Search to selection
def search_to_selection(tid: int, args: dict) -> None:  # Typed
    global GLOBAL_TREE_CACHE
    "Store search as selection"
    if "text" not in args:
        raise HTTPException(status_code=400, detail="missing selection text")

    text: str = args.copy().pop("text").strip()
    selected: dict = GLOBAL_TREE_CACHE.trees[int(tid)].selected  # type: ignore

    if text in selected.keys():
        raise HTTPException(status_code=400, detail="selection already exists")

    search: tuple = remove_search(tid, args)
    selected[text] = search


# Prune by selection
def prune_by_selection(tid: int, args: dict) -> None:  # typed
    global GLOBAL_TREE_CACHE
    "Prune tree by keeping selections identified by their names"

    if "names" not in args:
        raise HTTPException(status_code=400, detail="missing selection names")

    names: set = set(args.pop("names").strip().split(","))
    tree_data: Tree = GLOBAL_TREE_CACHE.trees[int(tid)]  # type: ignore

    selected: set = set()
    name: str
    for name, (results, _) in tree_data.selected.items():
        if name in names:
            selected.update(results)

    if len(selected) == 0:
        raise HTTPException(status_code=400, detail="selection does not exist")

    tree_data.tree.prune(selected)

    ops.update_sizes_all(tree_data.tree)

    tree_data.initialized = False


# Update selection
def update_selection(
    tree_data: Trees, name: str, results: set, parents: dict
) -> tuple[int, int]:  # typed buy pending to review TODO
    global GLOBAL_TREE_CACHE
    keys: list = tree_data.selected.keys()
    if name in keys:
        all_parents: dict
        all_results: dict
        all_results, all_parents = tree_data.selected[name]
        all_results.update(results)
        for p, v in parents.items():  # update parents defaultdict
            all_parents[p] += v
        tree_data.selected[name] = (all_results, all_parents)
    else:
        tree_data.selected[name] = (results, parents)

    results, parents = tree_data.selected[name]
    number_results: int = len(results)
    number_parents: int = len(parents)
    return number_results, number_parents


# Get parents
def get_parents(
    results: set | list, count_leaves=False
) -> defaultdict[str, int]:  # typed
    global GLOBAL_TREE_CACHE
    "Return a set of parents given a set of results"
    parents: defaultdict = defaultdict(lambda: 0)

    for node in results:
        if count_leaves:
            nleaves: int = len(node)
        else:
            nleaves = 1
        parent: Any = node.up
        while parent:
            parents[parent] += nleaves
            parent = parent.up
    return parents


# Store selection
def store_selection(tree_id: str, args: dict) -> tuple[int, int]:  # typed
    global GLOBAL_TREE_CACHE
    "Store the results and parents of a selection and return their numbers"
    if "text" not in args:
        raise HTTPException(status_code=400, detail="missing selection text")
    tree_data: Tree
    subtree: list[int] | None
    tid_subtree: tuple | None = get_tid(tree_id)
    if tid_subtree is not None:
        tid, subtree = tid_subtree
    tree_data = GLOBAL_TREE_CACHE.trees[tid]  # type: ignore
    node: Tree = tree_data.tree[subtree]

    parents = get_parents([node])

    name = args.pop("text").strip()
    return update_selection(tree_data, name, set([node]), parents)


# Activate node
def activate_node(tree_id: str) -> None:  # typed
    global GLOBAL_TREE_CACHE
    tree_data: Tree
    subtree: list[int] | None
    tid_subtree: tuple | None = get_tid(tree_id)
    if tid_subtree is not None:
        tid, subtree = tid_subtree
    tree_data = GLOBAL_TREE_CACHE.trees[int(tid)]  # type: ignore
    node: Tree = tree_data.tree[subtree]
    tree_data.active.nodes.results.add(node)
    tree_data.active.nodes.parents.clear()
    tree_data.active.nodes.parents.update(get_parents(tree_data.active.nodes.results))


# Deactivate node
def deactivate_node(tree_id: Tree) -> None:  # typed
    global GLOBAL_TREE_CACHE
    tree_data: Tree
    subtree: list[int] | None
    tid_subtree: tuple | None = get_tid(tree_id)
    if tid_subtree is not None:
        tid, subtree = tid_subtree
    tree_data = GLOBAL_TREE_CACHE.trees[tid]  # type: ignore
    node = tree_data.tree[subtree]
    tree_data.active.nodes.results.discard(node)
    tree_data.active.nodes.parents.clear()
    tree_data.active.nodes.parents.update(get_parents(tree_data.active.nodes.results))


# Get active clade
def get_active_clade(node: Tree, active: set) -> Tree | None:  # typed
    global GLOBAL_TREE_CACHE
    if node in active:
        return node
    parent: Tree = node.up
    while parent:
        if parent in active:
            return parent
        else:
            parent = parent.up
    return None


# Get active clades return a set
def get_active_clades(
    results: set[Tree], parents: dict
) -> set[Tree]:  # typed but pending return
    global GLOBAL_TREE_CACHE
    active: set[Tree] = set()
    for node in results:
        parent: Tree = node.up
        current_active: Tree = node
        while parent:
            if parents.get(parent, 0) == len(parent):
                current_active = parent
                parent = parent.up
            else:
                active.add(current_active)
                break
    # Case where active clade is root
    if len(active) == 0 and len(parents.keys()) == 1:
        root: Tree = list(parents.keys())[0]
        if root.dist > 0:
            active.add(root)
        else:
            active.update(root.children)
    return active


# Activate clade
def activate_clade(tree_id: str) -> None:  # typed
    global GLOBAL_TREE_CACHE
    tree_data: Tree
    subtree: list[int] | None
    tid_subtree: tuple | None = get_tid(tree_id)
    if tid_subtree is not None:
        tid, subtree = tid_subtree
    tree_data = GLOBAL_TREE_CACHE.trees[int(tid)]  # type: ignore
    node: Tree = tree_data.tree[subtree]
    tree_data.active.clades.results.add(node)
    n: Tree
    for n in node.descendants():
        tree_data.active.clades.results.discard(n)
    results: set[Tree] = tree_data.active.clades.results
    parents: defaultdict[str, int] = get_parents(results, count_leaves=True)
    active_parents: set[Tree] = get_active_clades(results, parents)
    tree_data.active.clades.results.clear()
    tree_data.active.clades.parents.clear()
    tree_data.active.clades.results.update(active_parents)
    tree_data.active.clades.parents.update(
        get_parents(active_parents, count_leaves=True)
    )


# Remove active clade
def remove_active_clade(node: Tree, active: set[Tree]) -> None:
    global GLOBAL_TREE_CACHE
    active_parent: Tree | None = get_active_clade(node, active)
    active.discard(active_parent)

    if node == active_parent:
        return

    while node.up:
        parent: Tree = node.up
        active.update(parent.children)
        active.discard(node)
        node = parent
        if node == active_parent:
            return


# Deactivate clade
def deactivate_clade(tree_id: Tree) -> None:  # typed
    global GLOBAL_TREE_CACHE
    tree_data: Tree
    subtree: list[int] | None
    tid_subtree: tuple | None = get_tid(tree_id)
    if tid_subtree is not None:
        tid, subtree = tid_subtree
    tree_data = GLOBAL_TREE_CACHE.trees[int(tid)]  # type: ignore
    node: Tree = tree_data.tree[subtree]
    remove_active_clade(node, tree_data.active.clades.results)
    tree_data.active.clades.parents.clear()
    tree_data.active.clades.parents.update(get_parents(tree_data.active.clades.results))


# Store active
def store_active(tree_data: Tree, idx: int, args: dict) -> tuple[int, int]:
    global GLOBAL_TREE_CACHE
    if "text" not in args:
        raise HTTPException(status_code=400, detail="missing selection text")
    name: str = args.pop("text").strip()
    results: set[Tree] = copy(tree_data.active[idx].results)
    if idx == 0:  # active.nodes
        parents: defaultdict[str, int] = copy(tree_data.active[idx].parents)
    else:  # active.clades
        parents = get_parents(results)
    remove_active(tree_data, idx)
    return update_selection(tree_data, name, results, parents)


def remove_active(tree_data: Tree, idx: int) -> None:  # typed
    global GLOBAL_TREE_CACHE
    tree_data.active[idx].parents.clear()
    tree_data.active[idx].results.clear()


def get_search_function(
    text: str,
) -> Optional[Callable]:
    global GLOBAL_TREE_CACHE
    "Return a function of a node that returns True for the searched nodes"
    if text.startswith("/"):
        return get_command_search(text)  # command-based search
    elif text == text.lower():  # case-insensitive search
        return lambda node: text in node.props.get("name", "").lower()
    else:  # case-sensitive search
        return lambda node: text in node.props.get("name", "")


def get_command_search(
    text: str,
) -> Optional[Callable]:
    global GLOBAL_TREE_CACHE
    "Return the apropiate node search function according to the command"
    parts: list = text.split(None, 1)

    if parts[0] not in ["/r", "/e", "/t"]:
        raise HTTPException(status_code=400, detail="invalid command %r" % parts[0])

    if len(parts) != 2:
        raise HTTPException(
            status_code=400, detail="missing argument to command %r" % parts[0]
        )
    command: str
    arg: str
    command, arg = parts
    if command == "/r":  # regex search
        return lambda node: re.search(arg, node.props.get("name", ""))
    elif command == "/e":  # eval expression
        return get_eval_search(arg)  # TODO this function dont work
    elif command == "/t":  # topological search
        return get_topological_search_callback(arg)
    else:
        raise HTTPException(status_code=400, detail="invalid command %r" % command)


def get_eval_search(expression: str) -> Optional[Callable]:
    """Return a function of a node that evaluates the given expression"""
    global GLOBAL_TREE_CACHE
    try:
        code: CodeType = compile(expression, "<string>", "eval")

    except SyntaxError as e:
        raise HTTPException(status_code=400, detail=f"compiling expression: {e}")

    return lambda node: safer_eval(
        code,
        {
            "node": node,
            "parent": node.parent,
            "up": node.up,
            "name": node.name,
            "is_leaf": node.is_leaf,
            "length": node.dist,
            "dist": node.dist,
            "d": node.dist,
            "props": node.props,
            "p": node.props,
            "get": dict.get,
            "children": node.children,
            "ch": node.children,
            "size": node.size,
            "dx": node.size[0],
            "dy": node.size[1],
            "regex": re.search,
            "startswith": str.startswith,
            "endswith": str.endswith,
            "upper": str.upper,
            "lower": str.lower,
            "split": str.split,
            "any": any,
            "all": all,
            "len": len,
            "sum": sum,
            "abs": abs,
            "float": float,
            "pi": pi,
        },
    )


def safer_eval(code: CodeType, context: dict) -> Optional[Callable]:
    global GLOBAL_TREE_CACHE
    "Return a safer version of eval(code, context)"

    name: str
    for name in code.co_names:
        if name not in context:
            raise HTTPException(
                status_code=400,
                detail="invalid use of %r during evaluation" % name,
            )

    return eval(code, {"__builtins__": {}}, context)


def get_topological_search_callback(
    pattern,
) -> Optional[Callable]:
    global GLOBAL_TREE_CACHE
    "Return a function of a node that sees if it matches the given pattern"
    try:
        tree_pattern: Tree = tm.TreePattern(pattern)
    except newick.NewickError as e:
        raise HTTPException(
            status_code=400, detail="invalid pattern %r: %s" % (pattern, e)
        )

    return lambda node: tm.match(tree_pattern, node)


def get_stats(tree_id: str, pname: str) -> dict[str, float]:
    global GLOBAL_TREE_CACHE
    "Return some statistics about the given property pname"
    pmin: float
    pmax: float
    n: float
    pmean: float
    pmean2: float
    value: float
    pmin, pmax = inf, -inf
    n, pmean, pmean2 = 0, 0, 0
    node: Tree
    try:
        for node in load_tree(tree_id):
            if pname in node.props:
                value = float(node.props[pname])
                pmin, pmax = min(pmin, value), max(pmax, value)
                pmean = (n * pmean + value) / (n + 1)
                pmean2 = (n * pmean2 + value * value) / (n + 1)
                n += 1
        assert n > 0, "no node has the given property"
        return {
            "n": n,
            "min": pmin,
            "max": pmax,
            "mean": pmean,
            "var": pmean2 - pmean * pmean,
        }
    except (ValueError, AssertionError) as e:
        raise HTTPException(
            status_code=400, detail=f"when reading property {pname}: {e}"
        )


def sort_subtree(tree_id: str, node_id: str, key_text: str, reverse: bool) -> None:
    """Sort the (sub)tree corresponding to tree_id and node_id"""
    global GLOBAL_TREE_CACHE
    t: Tree = load_tree(tree_id)
    try:
        code: CodeType = compile(key_text, "<string>", "eval")
    except SyntaxError as e:
        raise HTTPException(status_code=400, detail=f"compiling expression: {e}")

    def key(node) -> Any:
        global GLOBAL_TREE_CACHE
        return safer_eval(
            code,
            {
                "node": node,
                "name": node.name,
                "is_leaf": node.is_leaf,
                "length": node.dist,
                "dist": node.dist,
                "d": node.dist,
                "size": node.size,
                "dx": node.size[0],
                "dy": node.size[1],
                "children": node.children,
                "ch": node.children,
                "len": len,
                "sum": sum,
                "abs": abs,
            },
        )

    ops.sort(t[node_id], key, reverse)


# Get trees from nexus or newick
def get_trees_from_nexus_or_newick(
    btext: bytes, name_newick: str
) -> list[dict[str, str | int]]:  # typed
    global GLOBAL_TREE_CACHE
    """Return list of {'name': ..., 'newick': ...} extracted from btext."""
    text: str = btext.decode("utf8").strip()

    try:  # we first try to read it as a nexus file
        trees: Tree = nexus.get_trees(text)
        return [{"name": name, "newick": nw} for name, nw in trees.items()]
    except nexus.NexusError:  # if it isn't, we assume the text is a newick
        return [{"name": name_newick, "newick": text}]  # only one tree!


def add_tree(data: TreeViewData) -> int:
    global GLOBAL_TREE_CACHE
    "Add tree with given data and return its id"

    tid: int = int(data["id"])
    name: str = data["name"]
    nw: str | None = data.get("newick")  # type: ignore
    bpickle: str | None = data.get("b64pickle")  # type: ignore
    layouts_to_include: list[TreeLayout] | str = data.get("layouts", [])
    default_layouts = retrieve_layouts([])
    default_layouts["default"].extend(layouts_to_include)

    include_props: list[str] = []
    props_to_include: list[str] | str | None = data.get("include_props")
    if type(props_to_include) == str:
        include_props = props_to_include.split(",")

    exclude_props: Optional[list[str] | str] = data.get("exclude_props")
    if type(exclude_props) == str:
        exclude_props = exclude_props.split(",")

    del_tree(tid)  # delete if there is a tree with same id

    if nw is not None:
        tree: Tree = load_tree_from_newick(tid, nw)
    elif bpickle is not None:
        tree = ete_format.loads(bpickle, unpack=True)
        ops.update_sizes_all(tree)
    else:
        tree = data.get("tree")
        if not tree:
            raise HTTPException(
                status_code=400,
                detail="Either Newick or Tree object has to be provided.",
            )

    # TODO: Do we need to do this? (Maybe for the trees uploaded with a POST)
    # ops.update_sizes_all(t)
    # Initialize the tree_data.
    GLOBAL_TREE_CACHE.trees[tid] = TreeData(
        name=name,
        style=copy_style(TreeStyle()),
        nodestyles={},
        include_props=include_props,
        exclude_props=exclude_props,  # type: ignore
        layouts=default_layouts,
        timer=time(),
        searches={},
        selected={},
        active=drawer_module.get_empty_active(),
        tree=tree,
        tree_node_tooltip_data=data["tree_node_tooltip_data"],
        timestamp=datetime.now(),
    )  # type: ignore

    def write_tree_data() -> None:  # typed
        global GLOBAL_TREE_CACHE

        """Write tree data as a temporary pickle file."""
        data: TreeData = deepcopy(GLOBAL_TREE_CACHE.trees[tid])
        data.style = None  # since it can't be pickled
        data.layouts = layouts_to_include  # type: ignore
        data.active = None  # same
        try:
            pickle.dump(data, open(f"/tmp/{tid}.pickle", "wb"))
        except (pickle.PicklingError, PermissionError) as e:
            print(f"Tree {tid} not saved to file. ERROR: {e}", file=sys.stderr)
            # So changing to ultrametric and back will not work,
            # because it is done by re-reading from the dumped file.

    thr_write: Thread = Thread(
        daemon=True, target=write_tree_data
    )  # so we are not delayed
    thr_write.start()  # by big trees
    return tid


def update_layouts(active_layouts: dict, tid: int) -> None:
    global GLOBAL_TREE_CACHE
    """Update APP_GLOBAL layouts based on front end status"""
    tree_data: Tree = GLOBAL_TREE_CACHE.trees[int(tid)]
    reinit_trees: bool = False
    module: str
    layouts: dict
    for module, layouts in tree_data.layouts.items():
        for layout in layouts:
            if not layout.always_render:
                name: str = f"{module}:{layout.name}"
                new_status: bool = name in active_layouts
                if layout.active != new_status:
                    reinit_trees = True
                    layout.active = new_status

    if reinit_trees:
        if GLOBAL_TREE_CACHE.safe_mode:
            tree_data.initialized = False
        else:
            for tree_data in GLOBAL_TREE_CACHE.trees.values():
                tree_data.initialized = False


def get_tid(tree_id: str | int | None) -> tuple[int, list[int]] | None:
    global GLOBAL_TREE_CACHE
    """
    Return the tree id and the subtree id, with the apropiate types.
    Example: '3342,1,0,1,1' -> (3342, [1, 0, 1, 1])
    """
    try:
        if type(tree_id) == int:
            return tree_id, []
        if isinstance(tree_id, str):
            tid: str
            subtree: list[str]
            tid, *subtree = tree_id.split(",")
            return int(tid), [int(n) for n in subtree]
        return None
    except ValueError:
        raise HTTPException(status_code=400, detail=f"invalid tree id {tree_id}")


def del_tree(tid: int) -> None:
    global GLOBAL_TREE_CACHE
    "Delete a tree and everywhere where it appears referenced"
    shutil.rmtree(f"/tmp/{tid}.pickle", ignore_errors=True)
    GLOBAL_TREE_CACHE.trees.pop(tid, None)


# Copy style
def copy_style(tree_style: TreeStyle) -> TreeStyle:
    global GLOBAL_TREE_CACHE

    def add_faces_to_header(header, facecontainer):
        global GLOBAL_TREE_CACHE
        for column, face_list in facecontainer.items():
            for face in face_list:
                header.add_face(face, column=column)

    header: dict = deepcopy(dict(tree_style.aligned_panel_header))
    footer: dict = deepcopy(dict(tree_style.aligned_panel_footer))

    ts: TreeStyle = deepcopy(tree_style)
    add_faces_to_header(ts.aligned_panel_header, header)
    add_faces_to_header(ts.aligned_panel_footer, footer)

    return ts
