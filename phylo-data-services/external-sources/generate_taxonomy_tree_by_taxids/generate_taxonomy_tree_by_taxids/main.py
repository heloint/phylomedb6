from __future__ import annotations

import argparse
import os
import random
from dataclasses import dataclass
from pathlib import Path
from time import monotonic
from typing import Any
from typing import Iterable
from typing import Literal
from typing import TypedDict

from ete3 import AttrFace  # type: ignore
from ete3 import faces  # type: ignore
from ete3 import NCBITaxa  # type: ignore
from ete3 import NodeStyle  # type: ignore
from ete3 import TextFace  # type: ignore
from ete3 import Tree  # type: ignore
from ete3 import TreeNode  # type: ignore
from ete3 import TreeStyle  # type: ignore


@dataclass
class GenerateTaxonomyTreeByTaxidsArgs:
    taxonomy_ids: list[int]
    image_names_prefix: str
    output_directory_path: str
    add_titles: bool

    @classmethod
    def get_arguments(cls) -> GenerateTaxonomyTreeByTaxidsArgs:
        parser = argparse.ArgumentParser(
            description=(
                "Generate both circular and rectangular styled"
                " taxonomy tree images by the given taxonomy ids."
            )
        )
        parser.add_argument(
            "--taxonomy_ids",
            type=int,
            required=True,
            help="List of taxonomy IDs to generate the taxonomy tree.",
            nargs="+",
        )
        parser.add_argument(
            "--image_names_prefix",
            type=str,
            required=True,
            help="Name prefix for the generated output .png images.",
            default=f"{monotonic()}",
        )
        parser.add_argument(
            "--output_directory_path",
            type=str,
            required=True,
            help="The output directory path for the generated .png images.",
            default="./out",
        )
        parser.add_argument(
            "--add_titles",
            action='store_true',
        )
        return GenerateTaxonomyTreeByTaxidsArgs(**vars(parser.parse_args()))


class ClassLevelColorPair(TypedDict):
    hex_color: str
    class_level_name: str


class CustomTree(Tree):
    def _set_single_node_style(
        self, group: list[int], node_style: NodeStyle
    ) -> None:
        for leaf in self.iter_leaves():
            if leaf.name == str(group[0]):
                leaf.set_style(node_style)

    def set_colors_by_groups(
        self,
        leaf_names: list[str],
        formatted_taxa_groups: list[list[int]],
        colors: list[str],
    ) -> None:
        for color, group in zip(colors, formatted_taxa_groups):
            node_style = NodeStyle()
            node_style["bgcolor"] = color
            if len(group) == 1:
                self._set_single_node_style(group, node_style)
                continue
            leaves_only_from_originals: list[str] = [
                str(taxid) for taxid in group if str(taxid) in leaf_names
            ]
            common_ancestors: TreeNode | Any | None = self.get_common_ancestor(
                *leaves_only_from_originals
            )
            if not isinstance(common_ancestors, TreeNode):
                raise TypeError(
                    "Returned common_ancestors result"
                    " is not instance of the TreeNode class."
                )
            common_ancestors.set_style(node_style)

    def rename_leaves_for_taxa_names(self) -> None:
        ncbi = NCBITaxa()
        for leaf in self.iter_leaves():
            translation_res: dict[int, str] = ncbi.get_taxid_translator(
                [leaf.name]
            )
            taxa_name: str = translation_res[int(leaf.name)]
            leaf.name = taxa_name
            leaf.set_style

    def remove_intermediate_empty_single_nodes(self) -> None:
        for node in self.get_descendants():
            node_children = node.__dict__["_children"]
            is_empty_node_in_the_middle: bool = (
                len(node_children) == 1
                and node_children[0].name == ""
                and node.name == ""
            )
            is_last_empty_node_in_the_middle: bool = (
                node.name == ""
                and len(node_children) == 1
                and node_children[0].name != ""
            )
            if is_empty_node_in_the_middle or is_last_empty_node_in_the_middle:
                node.delete()


def get_taxa_tree_by_taxids(taxids: Iterable[int]) -> str:
    ncbi = NCBITaxa()
    topology = ncbi.get_topology(taxids, collapse_subspecies=False)
    newick = topology.write(format=0)
    return newick


def _get_random_rgb_color_part() -> int:
    return random.randint(160, 255)


def _generate_unique_hex_colors(n: int) -> list[str]:
    colors: set[str] = set()
    while len(colors) < n:
        rgb_color_part_1: int = _get_random_rgb_color_part()
        rgb_color_part_2: int = _get_random_rgb_color_part()
        rgb_color_part_3: int = _get_random_rgb_color_part()
        hex_color: str = (
            f"#{rgb_color_part_1:02x}"
            f"{rgb_color_part_2:02x}"
            f"{rgb_color_part_3:02x}"
        )
        colors.add(hex_color)
    return list(colors)


def _get_class_taxa_groups(
    taxonomy_ids: Iterable[int],
) -> dict[int, list[int]]:
    taxonomy_levels: tuple[str, ...] = (
        "domain",  # Broadest level
        "kingdom",
        "phylum",
        "class",
        "order",
        "family",
        "genus",
        "species",  # Most specific level
    )
    target_taxa_level_idx: int = taxonomy_levels.index("class")
    ncbi = NCBITaxa()

    class_tax_levels_mapping: dict[int, list[int]] = {}
    for taxid in taxonomy_ids:
        lineage = ncbi.get_lineage(taxid)
        if not lineage:
            raise ValueError(f"Could not get lineage for taxid: {taxid}")
        class_level_taxid: int = lineage[target_taxa_level_idx]
        class_tax_levels_mapping.setdefault(class_level_taxid, [])
        class_tax_levels_mapping[class_level_taxid].append(taxid)
    return class_tax_levels_mapping


def get_legend_textface_box_for_color(color: str) -> TextFace:
    textface_box = TextFace("   ", fsize=16)
    textface_box.margin_top = 6
    textface_box.margin_right = 6
    textface_box.margin_left = 6
    textface_box.margin_bottom = 6
    textface_box.opacity = 1  # from 0 to 1
    textface_box.inner_border.width = 1  # type: ignore
    textface_box.border.width = 0  # type: ignore
    textface_box.border.color = "White"  # type: ignore
    textface_box.background.color = "#FFFFFF"  # type: ignore
    textface_box.inner_background.color = color  # type: ignore
    return textface_box


def add_legend_pair_face_to_tree_style(
    ts: TreeStyle, color: str, title: str
) -> None:
    color_box: TextFace = get_legend_textface_box_for_color(color)
    ts.legend.add_face(color_box, column=0)

    legend_box = TextFace(f"  {title}", fsize=20)
    ts.legend.add_face(legend_box, column=1)


def add_titles_to_tree_style(
    tree_style: TreeStyle, title: str, subtitle: str | None
) -> None:
    title_textface_box = TextFace(
        title,
        fsize=24,
    )
    title_textface_box.margin_top = 10
    title_textface_box.margin_right = 10
    title_textface_box.margin_left = 10
    title_textface_box.margin_bottom = 10

    subtitle_textface_box = TextFace(
        subtitle,
        fsize=20,
    )
    subtitle_textface_box.margin_top = 10
    subtitle_textface_box.margin_right = 10
    subtitle_textface_box.margin_left = 10
    subtitle_textface_box.margin_bottom = 10

    tree_style.title.add_face(
        title_textface_box,
        column=0,
    )
    tree_style.title.add_face(
        subtitle_textface_box,
        column=0,
    )


def _layout(node: CustomTree) -> None:
    if node.is_leaf():
        N = AttrFace("name", fsize=18, fstyle="italic")
        faces.add_face_to_node(N, node, 0, aligned=True, position="aligned")


def _get_default_tree_style(
    legend_labels: list[ClassLevelColorPair],
    add_titles: bool,
    mode: Literal["circular", "rectangular"] = "circular",
) -> TreeStyle:
    ts = TreeStyle()
    ts.layout_fn = _layout
    ts.mode = "c"
    ts.margin_top = 30
    ts.margin_bottom = 30
    ts.margin_left = 30
    ts.margin_right = 30
    if mode == "rectangular":
        ts.mode = "r"
    ts.scale = 20  # type: ignore
    ts.show_scale = False
    ts.arc_span = 360
    ts.legend_position = 3
    ts.guiding_lines_type = 0
    ts.root_opening_factor = 1
    ts.optimal_scale_level = "full"
    ts.show_leaf_name = False
    ts.draw_guiding_lines = True
    ts.allow_face_overlap = True

    if add_titles:
        add_titles_to_tree_style(
            ts,
            "Species content mapped to the NCBI taxonomy tree",
            f"({mode} representation, grouped on class level)",
        )

    for legend in legend_labels:
        add_legend_pair_face_to_tree_style(
            ts, legend["hex_color"], legend["class_level_name"]
        )

    return ts


def _get_taxa_tree_newick(taxonomy_ids: list[int]) -> str:
    ncbi = NCBITaxa()
    topology = ncbi.get_topology(taxonomy_ids, intermediate_nodes=True)
    newick = topology.write(format=9)
    return newick


def _create_image_file(
    tree: Tree,
    default_tree_style: TreeStyle,
    output_directory: str = "./out",
    output_filename: str = f"{monotonic()}.png",
) -> None:
    Path(output_directory).mkdir(exist_ok=True, parents=True)
    tree.render(
        os.path.join(output_directory, output_filename),
        w=1000,
        tree_style=default_tree_style,
    )


def _get_legend_labels(
    taxa_groups: dict[int, list[int]], colors: list[str]
) -> list[ClassLevelColorPair]:
    ncbi = NCBITaxa()
    labels: list[ClassLevelColorPair] = []
    for color, class_level_taxid in zip(colors, taxa_groups.keys()):
        taxa_name_res: dict[int, str] = ncbi.get_taxid_translator(
            taxids=[class_level_taxid]
        )
        taxa_name: str = taxa_name_res[class_level_taxid]
        labels.append({"hex_color": color, "class_level_name": taxa_name})
    return labels


def main() -> int:
    args = GenerateTaxonomyTreeByTaxidsArgs.get_arguments()
    newick: str = _get_taxa_tree_newick(args.taxonomy_ids)
    tree: CustomTree = CustomTree(newick)

    leaf_names: list[str] = [leaf.name for leaf in tree.get_leaves()]
    taxa_groups: dict[int, list[int]] = _get_class_taxa_groups(
        args.taxonomy_ids
    )
    formatted_taxa_groups: list[list[int]] = list(taxa_groups.values())
    tree.remove_intermediate_empty_single_nodes()

    colors: list[str] = _generate_unique_hex_colors(len(formatted_taxa_groups))
    tree.set_colors_by_groups(leaf_names, formatted_taxa_groups, colors)
    tree.rename_leaves_for_taxa_names()

    legend_labels: list[ClassLevelColorPair] = _get_legend_labels(
        taxa_groups, colors
    )
    circular_tree_style = _get_default_tree_style(
        legend_labels, add_titles=args.add_titles, mode="circular"
    )
    _create_image_file(
        tree,
        circular_tree_style,
        output_directory=args.output_directory_path,
        output_filename=f"{args.image_names_prefix}_circular.png",
    )

    rectangular_tree_style = _get_default_tree_style(
        legend_labels, add_titles=args.add_titles, mode="rectangular"
    )
    _create_image_file(
        tree,
        rectangular_tree_style,
        output_directory=args.output_directory_path,
        output_filename=f"{args.image_names_prefix}_rectangular.png",
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
