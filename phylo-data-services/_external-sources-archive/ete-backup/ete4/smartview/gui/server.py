#!/usr/bin/env python3

"""
Keep the data of trees and present a REST api to talk
to the world.

REST call examples:
  GET    /trees       Get all trees
  GET    /trees/{id}  Get the tree information identified by "id"
  POST   /trees       Create a new tree
  PUT    /trees/{id}  Update the tree information identified by "id"
  DELETE /trees/{id}  Delete tree by "id"
"""

import os
import re
import platform
from subprocess import Popen, DEVNULL
from threading import Thread
import socket
from importlib import reload as module_reload
from math import pi, inf
from time import time, sleep
from datetime import datetime
from collections import defaultdict, namedtuple
from copy import copy, deepcopy
from dataclasses import dataclass
import gzip, bz2, zipfile, tarfile
import json
import _pickle as pickle
import shutil
import logging

import brotli

from bottle import (
    get,
    post,
    put,
    redirect,
    static_file,
    BaseRequest,
    request,
    response,
    error,
    abort,
    HTTPError,
    run,
)

BaseRequest.MEMFILE_MAX = 50 * 1024 * 1024  # maximum upload size (in bytes)

from ete4 import Tree
from ete4.parser import newick
from ete4.smartview import TreeStyle, layout_modules
from ete4.parser import ete_format, nexus
from ete4.core import operations as ops
from ete4.smartview.renderer import drawer as drawer_module
from ete4 import treematcher as tm


class GlobalStuff:
    pass  # class to store data


# Make sure we send the errors as json too.
@error(400)
@error(404)
def json_error(error):
    response.content_type = "application/json"
    return json.dumps({"message": error.body})


def req_json():
    """Return what request.json would return, but gracefully aborting."""
    try:
        return json.loads(request.body.read())
    except json.JSONDecodeError as e:
        abort(400, f"bad json content: {e}")


def nice_html(content, title="Tree Explorer"):
    return f"""
<!DOCTYPE html>
<html><head><title>{title}</title>
<link rel="icon" type="image/png" href="/static/icon.png">
<link rel="stylesheet" href="/static/upload.css"></head>
<body><div class="centered">{content}</div></body></html>"""


# call initialize() to fill it up
app = None
g_threads = {}


# Dataclass containing info specific to each tree
@dataclass
class TreeData:
    tree: Tree = None
    name: str = None
    style: TreeStyle = None
    nodestyles: dict = None
    include_props: list = None
    exclude_props: list = None
    layouts: list = None
    timer: float = None
    ultrametric: bool = False
    initialized: bool = False
    selected: dict = None
    active: namedtuple = None  # active nodes
    searches: dict = None


# Routes.


@get("/")
def callback():
    if app.trees:
        if len(app.trees) == 1:
            name = list(t.name for t in app.trees.values())[0]
            redirect(f"/static/gui.html?tree={name}")
        else:
            trees = "\n".join(
                '<li><a href="/static/gui.html?tree=' f'{t.name}">{t.name}</li>'
                for t in app.trees.values()
            )
            return nice_html(f"<h1>Loaded Trees</h1><ul>\n{trees}\n</ul>")
    else:
        return nice_html(
            """<h1>ETE</h1>
<p>No trees loaded.</p>
<p>See the <a href="/help">help page</a> for more information.</p>"""
        )


@get("/help")
def callback():
    return nice_html(
        """<h1>Help</h1>
You can go to the <a href="/static/upload.html">upload page</a>, see
a <a href="/">list of loaded trees</a>, or
<a href="http://etetoolkit.org/">consult the documentation</a>."""
    )


@get("/static/<path:path>")
def callback(path):
    DIR = os.path.dirname(os.path.abspath(__file__))
    return static_file(path, f"{DIR}/static")


@get("/drawers/<name>/<tree_id>")
def callback(name, tree_id):
    """Return type (rect/circ) and number of panels of the drawer."""
    try:
        tree_id, _ = get_tid(tree_id)

        # NOTE: Apparently we need to know the tree_id we are
        # referring to because it checks if there are aligned faces in
        # it to see if we are using a DrawerAlignX drawer (instead of
        # DrawerX).
        tree_layouts = sum(app.trees[int(tree_id)].layouts.values(), [])
        if name not in ["Rect", "Circ"] and any(
            getattr(ly, "aligned_faces", False) and ly.active for ly in tree_layouts
        ):
            name = "Align" + name
        # TODO: We probably want to get rid of all this.

        drawer_class = next(
            d
            for d in drawer_module.get_drawers()
            if d.__name__[len("Drawer") :] == name
        )
        return {"type": drawer_class.TYPE, "npanels": drawer_class.NPANELS}
    except StopIteration:
        abort(400, f"not a valid drawer: {name}")


@get("/layouts")
def callback():
    # Return dict that, for every layout module, has a dict with the
    # names of its layouts and whether they are active or not.
    app.trees.pop("default", None)  # FIXME: Why do we do this??

    return {
        "default": {
            layout.name: layout.active for layout in app.default_layouts if layout.name
        }
    }
    # The response will look like:
    # {
    #     "default": {
    #         "Branch length": true,
    #         "Branch support": true,
    #         "Leaf name": true,
    #         "Number of leaves": false
    #     }
    # }


@get("/layouts/list")
def callback():
    return {
        module: [[ly.name, ly.description] for ly in layouts if ly.name]
        for module, layouts in app.avail_layouts.items()
    }
    # The response will look like:
    # {"context_layouts": [["Genomic context", ""]],
    #  "domain_layouts":  [["Pfam domains", ""], ["Smart domains",""]],
    #  ...
    #  "staple_layouts": [["Barplot_None_None", ""]]}


@get("/layouts/<tree_id>")
def callback(tree_id):
    # Return dict that, for every layout module in the tree, has a dict
    # with the names of its layouts and whether they are active or not.
    tid, _ = get_tid(tree_id)
    tree_layouts = app.trees[tid].layouts

    layouts = {}
    for module, lys in tree_layouts.items():
        layouts[module] = {l.name: l.active for l in lys if l.name}

    return layouts
    # The response will look like:
    # {
    #     "default": {
    #         "Branch length": true,
    #         "Branch support": true,
    #         "Leaf name": true,
    #         "Number of leaves": false
    #     }
    # }


@put("/layouts/update")
def callback():
    update_app_available_layouts()


@get("/trees")
def callback():
    if app.safe_mode:
        abort(404, "invalid path /trees in safe_mode mode")

    response.content_type = "application/json"
    return json.dumps(
        [{"id": tid, "name": tdata.name} for tid, tdata in app.trees.items()]
    )


def touch_and_get(tree_id):
    """Load tree, update its timer, and return the tree data object and subtree."""
    tid, subtree = get_tid(tree_id)
    load_tree(tree_id)  # load if it was not loaded in memory
    tree_data = app.trees[tid]
    tree_data.timer = time()  # update the tree's timer
    return tree_data, subtree


@get("/trees/<tree_id>")
def callback(tree_id):
    if app.safe_mode:
        abort(404, f"invalid path /trees/{tree_id} in safe_mode mode")

    tree_data, subtree = touch_and_get(tree_id)

    props = set()
    for node in tree_data.tree[subtree].traverse():
        props |= {k for k in node.props if not k.startswith("_")}

    return {"name": tree_data.name, "props": list(props)}


@get("/trees/<tree_id>/nodeinfo")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    return tree_data.tree[subtree].props


@get("/trees/<tree_id>/nodestyle")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    response.content_type = "application/json"
    return json.dumps(tree_data.tree[subtree].sm_style)


@get("/trees/<tree_id>/editable_props")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    return {
        k: v
        for k, v in tree_data.tree[subtree].props.items()
        if k not in ["tooltip", "hyperlink"] and type(v) in [int, float, str]
    }
    # TODO: Document what the hell is going on here.


@get("/trees/<tree_id>/name")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    response.content_type = "application/json"
    return json.dumps(tree_data.name)


@get("/trees/<tree_id>/newick")
def callback(tree_id):
    MAX_MB = 200
    response.content_type = "application/json"
    return json.dumps(get_newick(tree_id, MAX_MB))


@get("/trees/<tree_id>/seq")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    def fasta(node):
        name = node.name if node.name else ",".join(map(str, node.id))
        return ">" + name + "\n" + node.props["seq"]

    response.content_type = "application/json"
    return json.dumps(
        "\n".join(
            fasta(leaf)
            for leaf in tree_data.tree[subtree].leaves()
            if leaf.props.get("seq")
        )
    )


@get("/trees/<tree_id>/nseq")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    response.content_type = "application/json"
    return json.dumps(
        sum(1 for leaf in tree_data.tree[subtree].leaves() if leaf.props.get("seq"))
    )


@get("/trees/<tree_id>/all_selections")
def callback(tree_id):
    tree_data, _ = touch_and_get(tree_id)
    return {
        "selected": {
            name: {"nresults": len(results), "nparents": len(parents)}
            for name, (results, parents) in (tree_data.selected or {}).items()
        }
    }


@get("/trees/<tree_id>/selections")
def callback(tree_id):
    return {"selections": get_selections(tree_id)}


@get("/trees/<tree_id>/select")
def callback(tree_id):
    nresults, nparents = store_selection(tree_id, request.query)
    return {"message": "ok", "nresults": nresults, "nparents": nparents}


@get("/trees/<tree_id>/unselect")
def callback(tree_id):
    removed = unselect_node(tree_id, request.query)
    return {"message": "ok" if removed else "selection not found"}


@get("/trees/<tree_id>/remove_selection")
def callback(tree_id):
    removed = remove_selection(tree_id, request.query)
    return {"message": "ok" if removed else "selection not found"}


@get("/trees/<tree_id>/change_selection_name")
def callback(tree_id):
    change_selection_name(tree_id, request.query)
    return {"message": "ok"}


@get("/trees/<tree_id>/selection/info")
def callback(tree_id):
    tree_data, _ = touch_and_get(tree_id)
    return get_selection_info(tree_data, request.query)


@get("/trees/<tree_id>/search_to_selection")
def callback(tree_id):
    search_to_selection(tree_id, request.query)
    return {"message": "ok"}


@get("/trees/<tree_id>/prune_by_selection")
def callback(tree_id):
    prune_by_selection(tree_id, request.query)
    return {"message": "ok"}


@get("/trees/<tree_id>/active")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    node = tree_data.tree[subtree]

    response.content_type = "application/json"
    if get_active_clade(node, tree_data.active.clades.results):
        return json.dumps("active_clade")
    elif node in tree_data.active.nodes.results:
        return json.dumps("active_node")
    else:
        return json.dumps("")


@get("/trees/<tree_id>/activate_node")
def callback(tree_id):
    activate_node(tree_id)
    return {"message": "ok"}


@get("/trees/<tree_id>/deactivate_node")
def callback(tree_id):
    deactivate_node(tree_id)
    return {"message": "ok"}


@get("/trees/<tree_id>/activate_clade")
def callback(tree_id):
    activate_clade(tree_id)
    return {"message": "ok"}


@get("/trees/<tree_id>/deactivate_clade")
def callback(tree_id):
    deactivate_clade(tree_id)
    return {"message": "ok"}


@get("/trees/<tree_id>/store_active_nodes")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    nresults, nparents = store_active(tree_data, 0, request.query)
    return {"message": "ok", "nresults": nresults, "nparents": nparents}


@get("/trees/<tree_id>/store_active_clades")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    nresults, nparents = store_active(tree_data, 1, request.query)
    return {"message": "ok", "nresults": nresults, "nparents": nparents}


@get("/trees/<tree_id>/remove_active_nodes")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    remove_active(tree_data, 0)
    return {"message": "ok"}


@get("/trees/<tree_id>/remove_active_clades")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    remove_active(tree_data, 1)
    return {"message": "ok"}


@get("/trees/<tree_id>/all_active")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    return {
        "nodes": get_nodes_info(tree_data.active.nodes.results, ["*"]),
        "clades": get_nodes_info(tree_data.active.clades.results, ["*"]),
    }


@get("/trees/<tree_id>/all_active_leaves")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    active_leaves = set(n for n in tree_data.active.nodes.results if n.is_leaf)
    for n in tree_data.active.clades.results:
        active_leaves.update(set(n.leaves()))

    return get_nodes_info(active_leaves, ["*"])


# Searches
@get("/trees/<tree_id>/searches")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    return {
        "searches": {
            text: {"nresults": len(results), "nparents": len(parents)}
            for text, (results, parents) in (tree_data.searches or {}).items()
        }
    }


@get("/trees/<tree_id>/search")
def callback(tree_id):
    nresults, nparents = store_search(tree_id, request.query)
    return {"message": "ok", "nresults": nresults, "nparents": nparents}


@get("/trees/<tree_id>/remove_search")
def callback(tree_id):
    removed = remove_search(tree_id, request.query)
    return {"message": "ok" if removed else "search not found"}


# Find
@get("/trees/<tree_id>/find")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    node = find_node(tree_data.tree, request.query)
    node_id = ",".join(map(str, node.id))
    return {"id": node_id}


@get("/trees/<tree_id>/draw")
def callback(tree_id):
    try:
        drawer = get_drawer(tree_id, request.query)

        graphics = json.dumps(list(drawer.draw())).encode("utf8")

        response.content_type = "application/json"
        if app.compress:
            response.add_header("Content-Encoding", "br")
            return brotli.compress(graphics)
        else:
            return graphics
    except (AssertionError, SyntaxError) as e:
        abort(400, f"when drawing: {e}")


@get("/trees/<tree_id>/size")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    width, height = tree_data.tree[subtree].size
    return {"width": width, "height": height}


@get("/trees/<tree_id>/collapse_size")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    response.content_type = "application/json"
    return json.dumps(tree_data.style.collapse_size)


@get("/trees/<tree_id>/properties")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    props = set()
    for node in tree_data.tree[subtree].traverse():
        props |= node.props.keys()

    response.content_type = "application/json"
    return json.dumps(list(props))


@get("/trees/<tree_id>/properties/<pname>")
def callback(tree_id, pname):
    return get_stats(tree_id, pname)


@get("/trees/<tree_id>/nodecount")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    tnodes = tleaves = 0
    for node in tree_data.tree[subtree].traverse():
        tnodes += 1
        if node.is_leaf:
            tleaves += 1

    return {"tnodes": tnodes, "tleaves": tleaves}


@get("/trees/<tree_id>/ultrametric")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    response.content_type = "application/json"
    return json.dumps(tree_data.ultrametric)


@post("/trees")
def callback():
    ids = add_trees_from_request()
    response.status = 201
    return {"message": "ok", "ids": ids}


@put("/trees/<tree_id>/sort")
def callback(tree_id):
    node_id, key_text, reverse = req_json()
    sort(tree_id, node_id, key_text, reverse)
    return {"message": "ok"}


@put("/trees/<tree_id>/set_outgroup")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    if subtree:
        abort(400, "operation not allowed with subtree")

    node_id = req_json()
    tree_data.tree.set_outgroup(tree_data.tree[node_id])
    ops.update_sizes_all(tree_data.tree)
    return {"message": "ok"}


@put("/trees/<tree_id>/move")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    try:
        node_id, shift = req_json()
        ops.move(tree_data.tree[subtree][node_id], shift)
        return {"message": "ok"}
    except AssertionError as e:
        abort(400, f"cannot move {node_id}: {e}")


@put("/trees/<tree_id>/remove")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    try:
        node_id = req_json()
        ops.remove(tree_data.tree[subtree][node_id])
        ops.update_sizes_all(tree_data.tree)
        return {"message": "ok"}
    except AssertionError as e:
        abort(400, f"cannot remove {node_id}: {e}")


@put("/trees/<tree_id>/rename")
def callback(tree_id):
    try:
        tree_data, subtree = touch_and_get(tree_id)
        node_id, name = req_json()
        tree_data.tree[subtree][node_id].name = name
        return {"message": "ok"}
    except AssertionError as e:
        abort(400, f"cannot rename {node_id}: {e}")


@put("/trees/<tree_id>/edit")
def callback(tree_id):
    try:
        tree_data, subtree = touch_and_get(tree_id)
        node_id, content = req_json()
        node = tree_data.tree[subtree][node_id]
        node.props = newick.get_props(content, is_leaf=True)
        ops.update_sizes_all(tree_data.tree)
        return {"message": "ok"}
    except (AssertionError, newick.NewickError) as e:
        abort(400, f"cannot edit {node_id}: {e}")


@put("/trees/<tree_id>/to_dendrogram")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)
    node_id = req_json()
    ops.to_dendrogram(tree_data.tree[subtree][node_id])
    ops.update_sizes_all(tree_data.tree)
    return {"message": "ok"}


@put("/trees/<tree_id>/to_ultrametric")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    try:
        node_id = req_json()
        ops.to_ultrametric(tree_data.tree[subtree][node_id])
        ops.update_sizes_all(tree_data.tree)
        return {"message": "ok"}
    except AssertionError as e:
        abort(400, f"cannot convert to ultrametric {tree_id}: {e}")


@put("/trees/<tree_id>/update_props")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    try:
        node = tree_data.tree[subtree]
        update_node_props(node, req_json())
        return {"message": "ok"}
    except AssertionError as e:
        abort(400, f"cannot update props of {node_id}: {e}")


@put("/trees/<tree_id>/update_nodestyle")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    try:
        node = tree_data.tree[subtree]
        update_node_style(node, req_json().copy())
        tree_data.nodestyles[node] = req_json().copy()
        return {"message": "ok"}
    except AssertionError as e:
        abort(400, f"cannot update style of {node_id}: {e}")


@put("/trees/<tree_id>/reinitialize")
def callback(tree_id):
    tree_data, subtree = touch_and_get(tree_id)

    tree_data.initialized = False

    ops.update_sizes_all(tree_data.tree)

    return {"message": "ok"}


@put("/trees/<tree_id>/reload")
def callback(tree_id):
    _, subtree = touch_and_get(tree_id)

    if subtree:
        abort(400, "operation not allowed with subtree")

    app.trees.pop(tree_id, None)  # avoid possible key-error
    return {"message": "ok"}


# Auxiliary functions.


def initialize_tree_style(tree_data):
    # Save aligned_grid_dxs to add them later.
    aligned_grid_dxs = deepcopy(tree_data.style.aligned_grid_dxs)

    tree_data.style = TreeStyle()
    tree_data.style.aligned_grid_dxs = aligned_grid_dxs

    # Layout pre-render
    for layouts in tree_data.layouts.values():
        for layout in layouts:
            if layout.active:
                layout.set_tree_style(tree_data.tree, tree_data.style)
                # A terrible way of saying something that should be like:
                #   tree_data.style.update(layout.tree_style)

    tree_data.initialized = True


def load_tree(tree_id):
    "Add tree to app.trees and initialize it if not there, and return it"
    try:
        tid, subtree = get_tid(tree_id)

        if tid in app.trees:
            tree_data = app.trees[tid]

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

            return tree_data.tree[subtree]
        else:
            tree_data = app.trees[tid] = retrieve_tree_data(tid)

            if tree_data.ultrametric:
                tree_data.tree.to_ultrametric()
                ops.update_sizes_all(tree_data.tree)

            initialize_tree_style(tree_data)

            return tree_data.tree[subtree]

    except (AssertionError, IndexError):
        abort(404, f"unknown tree id {tree_id}")


def load_tree_from_newick(tid, nw):
    """Load tree into memory from newick"""
    t = Tree(nw)

    ops.update_sizes_all(t)

    return t


def retrieve_layouts(layouts):
    layouts = layouts or []
    tree_layouts = defaultdict(list)

    for ly in layouts:
        name_split = ly.split(":")

        if len(name_split) not in (2, 3):
            continue

        if len(name_split) == 2:
            key, ly_name = name_split
            active = None

        elif len(name_split) == 3:
            key, ly_name, active = name_split
            active = True if active == "on" else False

        avail = deepcopy(app.avail_layouts.get(key, []))
        if ly_name == "*":
            if active is not None:
                for ly in avail:
                    ly.active = active

            tree_layouts[key] = avail
        else:
            match = next((ly for ly in avail if ly.name == ly_name), None)
            if match:
                if active is not None:
                    match.active = active
                tree_layouts[key].append(match)

    # Add default layouts
    tree_layouts["default"] = deepcopy(app.default_layouts)

    return dict(tree_layouts)


def retrieve_tree_data(tid):
    """Retrieve and return tree data from file.

    It retrieves all that from a previously saved pickle file in /tmp."""
    # Called when tree has been deleted from memory.
    try:
        tree_data = pickle.load(open(f"/tmp/{tid}.pickle", "rb"))
    except (FileNotFoundError, EOFError, pickle.UnpicklingError) as e:
        print(f"Tree {tid} cannot be recovered from disk. Loading placeholder.")
        tree_data = TreeData()
        tree_data.name = "Placeholder tree"
        tree_data.tree = Tree("(could,not,load,tree);")
        ops.update_sizes_all(tree_data.tree)

    tree_data.style = copy_style(TreeStyle())
    tree_data.layouts = retrieve_layouts(tree_data.layouts)
    tree_data.active = drawer_module.get_empty_active()
    tree_data.timer = time()  # to track if it is active

    return tree_data


def get_drawer(tree_id, args):
    "Return the drawer initialized as specified in the args"
    valid_keys = [
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

        get = lambda x, default: float(args.get(x, default))  # shortcut

        viewport = (
            [get(k, 0) for k in ["x", "y", "w", "h"]]
            if all(k in args for k in ["x", "y", "w", "h"])
            else None
        )
        assert viewport is None or (
            viewport[2] > 0 and viewport[3] > 0
        ), "invalid viewport"  # width and height must be > 0

        panel = get("panel", 0)

        zoom = (get("zx", 1), get("zy", 1), get("za", 1))
        assert zoom[0] > 0 and zoom[1] > 0 and zoom[2] > 0, "zoom must be > 0"

        load_tree(tree_id)  # in case it went out of memory
        tid, _ = get_tid(tree_id)
        tree_data = app.trees[tid]

        active_layouts = args.get("layouts")
        if active_layouts != None:
            update_layouts(active_layouts, tid)

        layouts = set(ly for ly in sum(tree_data.layouts.values(), []) if ly.active)

        drawer_name = args.get("drawer", "RectFaces")
        # Automatically provide aligned drawer when necessary
        if drawer_name not in ["Rect", "Circ"] and any(
            getattr(ly, "aligned_faces", False) for ly in layouts
        ):
            drawer_name = "Align" + drawer_name
        drawer_class = next(
            (
                d
                for d in drawer_module.get_drawers()
                if d.__name__[len("Drawer") :] == drawer_name
            ),
            None,
        )

        drawer_class.COLLAPSE_SIZE = get("min_size", 6)
        assert drawer_class.COLLAPSE_SIZE > 0, "min_size must be > 0"

        limits = (
            None
            if not drawer_name.startswith("Circ")
            else (
                get("rmin", 0),
                0,
                get("amin", -180) * pi / 180,
                get("amax", 180) * pi / 180,
            )
        )

        collapsed_ids = set(
            tuple(int(i) for i in node_id.split(",") if i != "")
            for node_id in json.loads(args.get("collapsed_ids", "[]"))
        )

        ultrametric = args.get("ultrametric") == "1"  # asked for ultrametric?
        if ultrametric and not tree_data.ultrametric:  # change to on
            tree_data.tree.to_ultrametric()
            ops.update_sizes_all(tree_data.tree)
            initialize_tree_style(tree_data)
            tree_data.ultrametric = ultrametric
        elif not ultrametric and tree_data.ultrametric:  # change to off
            app.trees.pop(tid, None)  # delete from memory
            # Forces it to be reloaded from disk next time it is accessed.

        active = tree_data.active
        selected = tree_data.selected
        searches = tree_data.searches

        return drawer_class(
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
        )
    # bypass errors for now...
    except StopIteration as error:
        abort(400, f"not a valid drawer: {drawer_name}")
    except (ValueError, AssertionError) as e:
        abort(400, str(e))


def get_newick(tree_id, max_mb):
    "Return the newick representation of the given tree"

    nw = load_tree(tree_id).write()

    size_mb = len(nw) / 1e6
    if size_mb > max_mb:
        abort(400, "newick too big (%.3g MB)" % size_mb)

    return nw


def remove_search(tid, args):
    "Remove search"
    if "text" not in args:
        abort(400, "missing search text")

    searches = app.trees[int(tid)].searches
    text = args.pop("text").strip()
    return searches.pop(text, None)


def store_search(tree_id, args):
    "Store the results and parents of a search and return their numbers"
    if "text" not in args:
        abort(400, "missing search text")

    text = args.pop("text").strip()
    func = get_search_function(text)

    try:
        results = set(node for node in load_tree(tree_id).traverse() if func(node))

        if len(results) == 0:
            return 0, 0

        parents = get_parents(results)

        tid, _ = get_tid(tree_id)
        app.trees[tid].searches[text] = (results, parents)

        return len(results), len(parents)
    except Exception as e:
        abort(400, f"evaluating expression: {e}")


def find_node(tree, args):
    if "text" not in args:
        abort(400, "missing search text")

    text = args.pop("text").strip()
    func = get_search_function(text)

    try:
        return next((node for node in tree.traverse() if func(node)), None)

    except Exception as e:
        abort(400, f"evaluating expression: {e}")


def get_selections(tree_id):
    tid, subtree = get_tid(tree_id)
    tree_data = app.trees[tid]
    node = tree_data.tree[subtree]
    return [
        name for name, (results, _) in tree_data.selected.items() if node in results
    ]


def update_node_props(node, args):
    for prop, value in node.props.items():
        newvalue = args.pop(prop, "").strip()
        if newvalue:
            try:  # convert to proper type
                newvalue = type(value)(newvalue)
            except:
                abort(400, f"property {prop} should be of type {type(value)}")
            node.add_prop(prop, newvalue)


def update_node_style(node, args):
    newstyle = {}
    for prop, value in dict(node.sm_style).items():
        newvalue = args.pop(prop, "").strip()
        if newvalue:
            try:  # convert to proper type
                newvalue = type(value)(newvalue)
            except:
                abort(400, f"property {prop} should be of type {type(value)}")
            else:
                newstyle[prop] = newvalue

    extend_to_descendants = args.pop("extend_to_descendants", None)
    if extend_to_descendants:
        nodes = node.traverse()
    else:
        nodes = [node]

    for node in nodes:
        for key, value in newstyle.items():
            node.sm_style[key] = value


def get_nodes_info(nodes, props):
    no_props = len(props) == 1 and props[0] == ""

    if "id" in props or no_props or "*" in props:
        node_ids = [",".join(map(str, node.id)) for node in nodes]
    if no_props:
        return node_ids

    nodes_info = []
    for idx, node in enumerate(nodes):
        if props[0] == "*":
            node_id = node_ids[idx]
            nodes_info.append({"id": node_id})
        else:
            node_p = {p: node.props.get(p) for p in props}
            if "id" in props:
                node_p["id"] = node_ids[idx]
            nodes_info.append(node_p)

    return nodes_info


def get_selection_info(tree_data, args):
    "Get selection info from their nodes"
    if "text" not in args:
        abort(400, "missing selection text")
    name = args.pop("text").strip()
    nodes = tree_data.selected.get(name, [[]])[0]

    props = args.pop("props", "").strip().split(",")
    return get_nodes_info(nodes, props)


def remove_selection(tid, args):
    "Remove selection"
    if "text" not in args:
        abort(400, "missing selection text")
    name = args.pop("text").strip()
    return app.trees[int(tid)].selected.pop(name, None)


def change_selection_name(tid, args):
    if "name" not in args or "newname" not in args:
        abort(400, "missing renaming parameters")

    name = args.pop("name").strip()
    selected = app.trees[int(tid)].selected

    if name not in selected.keys():
        abort(400, f"selection {name} does not exist")

    new_name = args.pop("newname").strip()
    selected[new_name] = selected[name]
    selected.pop(name)


def unselect_node(tree_id, args):
    tid, subtree = get_tid(tree_id)
    tree_data = app.trees[tid]
    node = tree_data.tree[subtree]
    name = args.pop("text", "").strip()

    if name in tree_data.selected.keys():
        selections = {name: tree_data.selected[name]}
    else:
        selections = dict(tree_data.selected)  # copy all

    removed = False
    for name, (results, parents) in selections.items():
        nresults = len(results)
        results.discard(node)
        if len(results) == 0:
            removed = True
            tree_data.selected.pop(name)
        elif nresults > len(results):
            removed = True
            parents = get_parents(results)
            tree_data.selected[name] = (results, parents)

    return removed


def search_to_selection(tid, args):
    "Store search as selection"
    if "text" not in args:
        abort(400, "missing selection text")

    text = args.copy().pop("text").strip()
    selected = app.trees[int(tid)].selected

    if text in selected.keys():
        abort(400, "selection already exists")

    search = remove_search(tid, args)
    selected[text] = search


def prune_by_selection(tid, args):
    "Prune tree by keeping selections identified by their names"

    if "names" not in args:
        abort(400, "missing selection names")

    names = set(args.pop("names").strip().split(","))
    tree_data = app.trees[int(tid)]

    selected = set()
    for name, (results, _) in tree_data.selected.items():
        if name in names:
            selected.update(results)

    if len(selected) == 0:
        abort(400, "selection does not exist")

    tree_data.tree.prune(selected)

    ops.update_sizes_all(tree_data.tree)

    tree_data.initialized = False


def update_selection(tree_data, name, results, parents):
    if name in tree_data.selected.keys():
        all_results, all_parents = tree_data.selected[name]
        all_results.update(results)
        for p, v in parents.items():  # update parents defaultdict
            all_parents[p] += v
        tree_data.selected[name] = (all_results, all_parents)
    else:
        tree_data.selected[name] = (results, parents)

    results, parents = tree_data.selected[name]
    return len(results), len(parents)


def get_parents(results, count_leaves=False):
    "Return a set of parents given a set of results"
    parents = defaultdict(lambda: 0)
    for node in results:
        if count_leaves:
            nleaves = len(node)
        else:
            nleaves = 1
        parent = node.up
        while parent:
            parents[parent] += nleaves
            parent = parent.up
    return parents


def store_selection(tree_id, args):
    "Store the results and parents of a selection and return their numbers"
    if "text" not in args:
        abort(400, "missing selection text")

    tid, subtree = get_tid(tree_id)
    tree_data = app.trees[tid]
    node = tree_data.tree[subtree]

    parents = get_parents([node])

    name = args.pop("text").strip()
    return update_selection(tree_data, name, set([node]), parents)


def activate_node(tree_id):
    tid, subtree = get_tid(tree_id)
    tree_data = app.trees[int(tid)]
    node = tree_data.tree[subtree]
    tree_data.active.nodes.results.add(node)
    tree_data.active.nodes.parents.clear()
    tree_data.active.nodes.parents.update(get_parents(tree_data.active.nodes.results))


def deactivate_node(tree_id):
    tid, subtree = get_tid(tree_id)
    tree_data = app.trees[tid]
    node = tree_data.tree[subtree]
    tree_data.active.nodes.results.discard(node)
    tree_data.active.nodes.parents.clear()
    tree_data.active.nodes.parents.update(get_parents(tree_data.active.nodes.results))


def get_active_clade(node, active):
    if node in active:
        return node
    parent = node.up
    while parent:
        if parent in active:
            return parent
        else:
            parent = parent.up
    return None


def get_active_clades(results, parents):
    active = set()
    for node in results:
        parent = node.up
        current_active = node
        while parent:
            if parents.get(parent, 0) == len(parent):
                current_active = parent
                parent = parent.up
            else:
                active.add(current_active)
                break
    # Case where active clade is root
    if len(active) == 0 and len(parents.keys()) == 1:
        root = list(parents.keys())[0]
        if root.dist > 0:
            active.add(root)
        else:
            active.update(root.children)
    return active


def activate_clade(tree_id):
    tid, subtree = get_tid(tree_id)
    tree_data = app.trees[int(tid)]
    node = tree_data.tree[subtree]
    tree_data.active.clades.results.add(node)
    for n in node.descendants():
        tree_data.active.clades.results.discard(n)
    results = tree_data.active.clades.results
    parents = get_parents(results, count_leaves=True)
    active_parents = get_active_clades(results, parents)
    tree_data.active.clades.results.clear()
    tree_data.active.clades.parents.clear()
    tree_data.active.clades.results.update(active_parents)
    tree_data.active.clades.parents.update(
        get_parents(active_parents, count_leaves=True)
    )


def remove_active_clade(node, active):
    active_parent = get_active_clade(node, active)
    active.discard(active_parent)

    if node == active_parent:
        return

    while node.up:
        parent = node.up
        active.update(parent.children)
        active.discard(node)
        node = parent
        if node == active_parent:
            return


def deactivate_clade(tree_id):
    tid, subtree = get_tid(tree_id)
    tree_data = app.trees[int(tid)]
    node = tree_data.tree[subtree]
    remove_active_clade(node, tree_data.active.clades.results)
    tree_data.active.clades.parents.clear()
    tree_data.active.clades.parents.update(get_parents(tree_data.active.clades.results))


def store_active(tree_data, idx, args):
    if "text" not in args:
        abort(400, "missing selection text")

    name = args.pop("text").strip()
    results = copy(tree_data.active[idx].results)
    if idx == 0:  # active.nodes
        parents = copy(tree_data.active[idx].parents)
    else:  # active.clades
        parents = get_parents(results)

    remove_active(tree_data, idx)

    return update_selection(tree_data, name, results, parents)


def remove_active(tree_data, idx):
    tree_data.active[idx].parents.clear()
    tree_data.active[idx].results.clear()


def get_search_function(text):
    "Return a function of a node that returns True for the searched nodes"
    if text.startswith("/"):
        return get_command_search(text)  # command-based search
    elif text == text.lower():  # case-insensitive search
        return lambda node: text in node.props.get("name", "").lower()
    else:  # case-sensitive search
        return lambda node: text in node.props.get("name", "")


def get_command_search(text):
    "Return the appropriate node search function according to the command"
    parts = text.split(None, 1)
    if parts[0] not in ["/r", "/e", "/t"]:
        abort(400, "invalid command %r" % parts[0])
    if len(parts) != 2:
        abort(400, "missing argument to command %r" % parts[0])

    command, arg = parts
    if command == "/r":  # regex search
        return lambda node: re.search(arg, node.props.get("name", ""))
    elif command == "/e":  # eval expression
        return get_eval_search(arg)
    elif command == "/t":  # topological search
        return get_topological_search(arg)
    else:
        abort(400, "invalid command %r" % command)


def get_eval_search(expression):
    "Return a function of a node that evaluates the given expression"
    try:
        code = compile(expression, "<string>", "eval")
    except SyntaxError as e:
        abort(400, f"compiling expression: {e}")

    return lambda node: safer_eval(
        code,
        {
            "node": node,
            "parent": node.up,
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


def safer_eval(code, context):
    "Return a safer version of eval(code, context)"
    for name in code.co_names:
        if name not in context:
            abort(400, "invalid use of %r during evaluation" % name)
    return eval(code, {"__builtins__": {}}, context)


def get_topological_search(pattern):
    "Return a function of a node that sees if it matches the given pattern"
    try:
        tree_pattern = tm.TreePattern(pattern)
    except newick.NewickError as e:
        abort(400, "invalid pattern %r: %s" % (pattern, e))

    return lambda node: tm.match(tree_pattern, node)


def get_stats(tree_id, pname):
    "Return some statistics about the given property pname"
    pmin, pmax = inf, -inf
    n, pmean, pmean2 = 0, 0, 0
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
        abort(400, f"when reading property {pname}: {e}")


def sort(tree_id, node_id, key_text, reverse):
    "Sort the (sub)tree corresponding to tree_id and node_id"
    t = load_tree(tree_id)

    try:
        code = compile(key_text, "<string>", "eval")
    except SyntaxError as e:
        abort(400, f"compiling expression: {e}")

    def key(node):
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


def add_trees_from_request():
    """Add trees to app.trees and return a dict of {name: id}."""
    try:
        if request.content_type.startswith("application/json"):
            trees = [req_json()]  # we have only one tree
            parser = newick.PARSER_DEFAULT
        else:
            trees = get_trees_from_form()
            parser = get_parser(request.forms.get("internal", "name"))

        for tree in trees:
            add_tree(tree)

        return {tree["name"]: tree["id"] for tree in trees}
        # TODO: tree ids are already equal to their names, so in the future
        # we could remove the need to send back their "ids".
    except (newick.NewickError, ValueError) as e:
        abort(400, f"malformed tree - {e}")


def get_parser(internal):
    """Return parser given the internal nodes main property interpretation."""
    p = {"name": newick.NAME, "support": newick.SUPPORT}[internal]  # (()p:d);
    return dict(newick.PARSER_DEFAULT, internal=[p, newick.DIST])


def get_trees_from_form():
    """Return list of dicts with tree info read from a form in the request."""
    if "trees" in request.files:
        try:
            fu = request.files["trees"]  # bottle FileUpload object
            return get_trees_from_file(fu.filename, fu.file)
        except (gzip.BadGzipFile, UnicodeDecodeError) as e:
            abort(400, f"when reading {fupload.filename}: {e}")
    else:
        return [
            {
                "name": request.forms["name"],
                "newick": request.forms["newick"],
                "id": request.forms.get("id"),
                "b64pickle": request.forms.get("b64pickle"),
                "description": request.forms.get("description", ""),
                "layouts": request.forms.get("layouts", []),
                "include_props": request.forms.get("include_props", None),
                "exclude_props": request.forms.get("exclude_props", None),
            }
        ]


def get_trees_from_file(filename, fileobject=None):
    """Return list of {'name': ..., 'newick': ...} extracted from file."""
    fileobject = fileobject or open(filename, "rb")

    trees = []

    def extend(btext, fname):
        name = os.path.splitext(os.path.basename(fname))[0]  # /d/n.e -> n
        trees.extend(get_trees_from_nexus_or_newick(btext, name))

    if filename.endswith(".zip"):
        zf = zipfile.ZipFile(fileobject)
        for fname in zf.namelist():
            extend(zf.read(fname), fname)
    elif filename.endswith(".tar"):
        tf = tarfile.TarFile(fileobj=fileobject)
        for fname in tf.getnames():
            extend(tf.extractfile(fname).read(), fname)
    elif filename.endswith(".tar.gz") or filename.endswith(".tgz"):
        tf = tarfile.TarFile(fileobj=gzip.GzipFile(fileobj=fileobject))
        for fname in tf.getnames():
            extend(tf.extractfile(fname).read(), fname)
    elif filename.endswith(".gz"):
        extend(gzip.GzipFile(fileobj=fileobject).read(), filename)
    elif filename.endswith(".bz2"):
        extend(bz2.BZ2File(fileobject).read(), filename)
    else:
        extend(fileobject.read(), filename)

    return trees


def get_trees_from_nexus_or_newick(btext, name_newick):
    """Return list of {'name': ..., 'newick': ...} extracted from btext."""
    text = btext.decode("utf8").strip()

    try:  # we first try to read it as a nexus file
        trees = nexus.get_trees(text)
        return [{"name": name, "newick": nw} for name, nw in trees.items()]
    except nexus.NexusError:  # if it isn't, we assume the text is a newick
        return [{"name": name_newick, "newick": text}]  # only one tree!


def add_tree(data):
    "Add tree with given data and return its id"
    tid = int(data["id"])
    name = data["name"]
    nw = data.get("newick")
    bpickle = data.get("b64pickle")
    layouts = data.get("layouts", [])
    if type(layouts) == str:
        layouts = layouts.split(",")
    include_props = data.get("include_props")
    if type(include_props) == str:
        include_props = include_props.split(",")
    exclude_props = data.get("exclude_props")
    if type(exclude_props) == str:
        exclude_props = exclude_props.split(",")

    del_tree(tid)  # delete if there is a tree with same id

    if nw is not None:
        tree = load_tree_from_newick(tid, nw)
    elif bpickle is not None:
        tree = ete_format.loads(bpickle, unpack=True)
        ops.update_sizes_all(tree)
    else:
        tree = data.get("tree")
        if not tree:
            abort(400, "Either Newick or Tree object has to be provided.")

    # TODO: Do we need to do this? (Maybe for the trees uploaded with a POST)
    # ops.update_sizes_all(t)

    # Initialize the tree_data.
    tree_data = app.trees[tid] = TreeData()
    tree_data.name = name
    tree_data.style = copy_style(TreeStyle())
    tree_data.nodestyles = {}
    tree_data.include_props = include_props
    tree_data.exclude_props = exclude_props
    tree_data.layouts = retrieve_layouts(layouts)
    tree_data.timer = time()
    tree_data.searches = {}
    tree_data.selected = {}
    tree_data.active = drawer_module.get_empty_active()
    tree_data.tree = tree

    def write_tree_data():
        """Write tree data as a temporary pickle file."""
        data = deepcopy(tree_data)
        data.style = None  # since it can't be pickled
        data.layouts = layouts  # same
        data.active = None  # same
        try:
            pickle.dump(data, open(f"/tmp/{tid}.pickle", "wb"))
        except (pickle.PicklingError, PermissionError) as e:
            print(f"Tree {tid} not saved to file.")
            # So changing to ultrametric and back will not work,
            # because it is done by re-reading from the dumped file.

    thr_write = Thread(daemon=True, target=write_tree_data)  # so we are not delayed
    thr_write.start()  # by big trees

    return tid


def update_app_available_layouts():
    try:
        module_reload(layout_modules)
        app.avail_layouts = get_layouts_from_getters()
        app.avail_layouts.pop("default_layouts", None)
    except Exception as e:
        abort(400, f"Error while updating app layouts: {e}")


def get_layouts_from_getters():
    """Return a dict {name: [layout1, ...]} for all layout submodules."""
    # The list contains, for every submodule of layout_modules, an
    # instance of all the LayoutX classes that the submodule contains.
    submodules = [
        getattr(layout_modules, module)
        for module in dir(layout_modules)
        if not module.startswith("__")
    ]

    all_layouts = {}
    for module in submodules:
        name = module.__name__.split(".")[-1]

        layouts = [
            getattr(module, getter)()
            for getter in dir(module)
            if getter.startswith("Layout")
        ]

        for layout in layouts:  # TODO: is this necessary? remove if not
            layout.module = name  # set for future reference

        all_layouts[name] = layouts

    return all_layouts


# Layout related functions
def get_layouts(layouts=None):
    # Get layouts from their getters in layouts module:
    # smartview/redender/layouts
    layouts_from_module = get_layouts_from_getters()

    # Get default layouts
    default_layouts = layouts_from_module.pop("default_layouts")

    all_layouts = {}
    for idx, layout in enumerate(default_layouts + (layouts or [])):
        layout.module = "default"
        all_layouts[layout.name or idx] = layout

    return list(all_layouts.values()), layouts_from_module


def update_layouts(active_layouts, tid):
    """Update app layouts based on front end status"""
    tree_data = app.trees[int(tid)]
    reinit_trees = False
    for module, layouts in tree_data.layouts.items():
        for layout in layouts:
            if not layout.always_render:
                name = f"{module}:{layout.name}"
                new_status = name in active_layouts
                if layout.active != new_status:
                    reinit_trees = True
                    layout.active = new_status

    if reinit_trees:
        if app.safe_mode:
            tree_data.initialized = False
        else:
            for tree_data in app.trees.values():
                tree_data.initialized = False


def get_tid(tree_id):
    """Return the tree id and the subtree id, with the appropriate types."""
    # Example: '3342,1,0,1,1' -> (3342, [1, 0, 1, 1])
    try:
        if type(tree_id) == int:
            return tree_id, []
        else:
            tid, *subtree = tree_id.split(",")
            return int(tid), [int(n) for n in subtree]
    except ValueError:
        abort(404, f"invalid tree id {tree_id}")


def del_tree(tid):
    "Delete a tree and everywhere where it appears referenced"
    shutil.rmtree(f"/tmp/{tid}.pickle", ignore_errors=True)
    app.trees.pop(tid, None)


def copy_style(tree_style):
    def add_faces_to_header(header, facecontainer):
        for column, face_list in facecontainer.items():
            for face in face_list:
                header.add_face(face, column=column)

    header = deepcopy(dict(tree_style.aligned_panel_header))
    footer = deepcopy(dict(tree_style.aligned_panel_footer))

    ts = deepcopy(tree_style)
    add_faces_to_header(ts.aligned_panel_header, header)
    add_faces_to_header(ts.aligned_panel_footer, footer)

    return ts


# App initialization.


def initialize(
    tree=None,
    layouts=None,
    include_props=None,
    exclude_props=None,
    safe_mode=False,
    compress=False,
):
    """Initialize the global object app."""
    app = GlobalStuff()

    app.safe_mode = safe_mode

    app.compress = compress

    # App associated layouts
    # Layouts will be accessible for each tree independently
    app.default_layouts, app.avail_layouts = get_layouts(layouts)

    # Dict containing TreeData dataclasses with tree info
    app.trees = {}

    thread_maintenance = Thread(daemon=True, target=maintenance, args=(app,))
    thread_maintenance.start()
    g_threads["maintenance"] = thread_maintenance

    return app


def run_smartview(
    tree=None,
    name=None,
    layouts=[],
    include_props=None,
    exclude_props=None,
    safe_mode=False,
    host="localhost",
    port=None,
    quiet=True,
    compress=False,
    keep_server=False,
    open_browser=True,
):
    global app

    # If we try to show a tree that we already have, do not initialize again.
    if app:
        for tid, tree_data in app.trees.items():
            if tree_data.tree is tree:
                app.default_layouts, app.avail_layouts = get_layouts(layouts)
                tree_data.layouts = retrieve_layouts([])
                tree_data.initialized = False

                if open_browser:
                    _, listening_port = g_threads["webserver"]
                    open_browser_window(host, listening_port)

                # All this is kind of a hack.
                return

    # Set tree_name to None if no tree was provided
    # Generate tree_name if none was provided
    name = name or (make_name() if tree else None)

    app = initialize(
        name,
        layouts,
        include_props=include_props,
        exclude_props=exclude_props,
        safe_mode=safe_mode,
        compress=compress,
    )

    # TODO: Create app.recent_trees with paths to recently viewed trees

    if tree:
        ops.update_sizes_all(tree)

        tree_data = {
            "id": 0,  # id to be replaced by actual hash
            "name": name,
            "tree": tree,
            "layouts": [],
            "include_props": include_props,
            "exclude_props": exclude_props,
        }
        tid = add_tree(tree_data)
        print(f"Added tree {name} with id {tid}.")

    if "webserver" not in g_threads:
        port = port or get_next_available_port()
        assert port, "could not find any port available"

        thread_webserver = Thread(
            daemon=not keep_server,  # the server persists if it's not a daemon
            target=run,
            kwargs={"quiet": quiet, "host": host, "port": port},
        )

        thread_webserver.start()

        g_threads["webserver"] = (thread_webserver, port)

    if open_browser:
        _, listening_port = g_threads["webserver"]
        open_browser_window(host, listening_port)


def get_next_available_port(host="localhost", port_min=5000, port_max=6000):
    """Return the next available port where we can put a server socket."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    for port in range(port_min, port_max):
        try:
            sock.bind((host, port))  # try to bind to the specified port
            sock.close()
            return port
        except socket.error:
            pass


def maintenance(app, check_interval=60, max_time=30 * 60):
    """Perform maintenance tasks every check_interval seconds."""
    while True:
        # Remove trees that haven't been accessed in max_time.
        tids = list(app.trees.keys())
        for tid in tids:
            inactivity_time = time() - app.trees[tid].timer
            if inactivity_time > max_time:
                app.trees.pop(tid)  # delete from memory
                # Will be reloaded from disk next time it is accessed.

        sleep(check_interval)


def make_name():
    """Return a unique tree name like 'tree-<number>'."""
    if app:
        tnames = [
            t.name
            for t in app.trees.values()
            if t.name.startswith("tree-") and t.name[len("tree-") :].isdecimal()
        ]
    else:
        tnames = []
    n = max((int(name[len("tree-") :]) for name in tnames), default=0) + 1
    return f"tree-{n}"


def open_browser_window(host, port):
    """Try to open a browser window in a different process."""
    try:
        system = platform.system()

        host = host if host != "localhost" or system != "Darwin" else "127.0.0.1"

        command = {"Linux": "xdg-open", "Darwin": "open"}[system]

        Popen([command, f"http://{host}:{port}"], stdout=DEVNULL, stderr=DEVNULL)
    except (KeyError, FileNotFoundError) as e:
        print(f"Explorer available at http://{host}:{port}")


if __name__ == "__main__":
    run_smartview(safe_mode=True)
