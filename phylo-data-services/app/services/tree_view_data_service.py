#!/usr/bin/env python3
from __future__ import annotations

import sys
from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
from itertools import groupby
from typing import Callable, Optional
from typing import Iterable
from typing import Iterator
from typing import TypedDict
from uuid import uuid4

import mariadb  # type: ignore
from ete4 import Tree
from ete4.smartview import TreeStyle
from ete4.smartview import ArrowFace
from ete4.smartview import TreeLayout

from models.gene_neighbourhood_dao import GeneNeighbourhoodDAO
from models.homolog_dao import HomologDAO
from models.orthologs_dao import OrthologsDAO
from models.tree_node_tooltip_data_dao import TreeNodeTooltipData

ContigID = str
ProteinID = int
GeneID = int
MainContigGeneID = int
SeedGene = GeneNeighbourhoodDAO
MappedTreeTooltipData = dict[ProteinID, TreeNodeTooltipData]
HexColor = str


class CustomLayout:
    def set_tree_style(self, tree: Tree, style): ...

    def set_node_style(self, node: Tree) -> None: ...

    def get_protein_id_from_node_name(self, node_name: str) -> int:
        raise NotImplementedError  # Ensures a valid return for an int type


class GeneOrderTreeLayout(CustomLayout):
    def __init__(
        self,
        name,
        args: dict[ProteinID, list[GetFaceArgGene]],
        ts=None,
        ns=None,
        aligned_faces=False,
        active=True,
        legend=True,
    ):
        self.name = name
        self.active = active
        self.aligned_faces = aligned_faces
        self.description = ""
        self.legend = legend

        self.always_render = True

        self.ts = ts
        self.ns = ns
        self.args = args

    def set_tree_style(self, tree: Tree, style: TreeStyle):
        if self.aligned_faces:
            style.aligned_panel = True

        if self.ts:
            self.ts(style)

    def set_node_style(
        self,
        node: Tree,
    ):
        if not node.is_leaf:
            return
        node_protein_id: int = self.get_protein_id_from_node_name(node.name)
        neighbours: list[GetFaceArgGene] = self.args[node_protein_id]
        for column_idx, node_gene in enumerate(neighbours):
            node.add_face(node_gene.face, position="aligned", column=column_idx)

    def get_protein_id_from_node_name(self, node_name: str) -> int:
        """
        Extracts the protein ID from a node name.
        """
        protein_id_str = node_name.split("Phy")[1].split("_")[0]
        return int(protein_id_str)


class GeneRelationData(TypedDict):
    homologous_with: int | None
    orthologous_with: int | None
    assigned_color: str | None
    stroke_color: str | None
    stroke_width: str | None
    gene: GeneNeighbourhoodDAO


@dataclass
class GetFaceArgGene:
    gene_id: int
    start: int
    end: int
    face: ArrowFace


@dataclass
class Gene:
    gene_id: int | None
    external_gene_id: str
    contig_id: str
    gene_name: str
    source: str
    start: int
    end: int
    relative_contig_gene_order: int
    strand: str
    timestamp: datetime
    genome_id: int
    orthologs_with: GeneID | None = None
    homologs_with: GeneID | None = None


class TreeViewData(TypedDict):
    id: int
    name: str
    tree: Tree
    layouts: list[TreeLayout]
    include_props: Optional[list|str]
    exclude_props: Optional[list|str]
    tree_node_tooltip_data: MappedTreeTooltipData


TreeLayoutNSCallback = Callable[[dict[ProteinID, list[GetFaceArgGene]]], None]


class HomologyColorData(TypedDict):
    homologous: str
    orthologous: str


class FaceColorsAndStrokes(TypedDict):
    bg_color: HexColor
    stroke_color: HexColor
    stroke_width: str


class TreeViewDataService:
    none_gene_color: HexColor = "#d1d5db"  # gray-300

    seed_gene_color: HexColor = "#b91c1c"  # red-700
    default_seed_stroke_color: HexColor = seed_gene_color
    default_seed_stroke_width: str = "7px"

    default_stroke_color: str = ""
    default_stroke_width: str = "0.5px"

    homologous_stroke_color: str = ""
    homologous_stroke_width: str = "3.5px"

    orthologous_stroke_color: HexColor = "#000000"  # orange-900
    orthologous_stroke_width: str = "3.5px"

    homology_colors: tuple[HexColor, ...] = (
        "#4ade80",  # green-400
        "#60a5fa",  # blue-400
        "#facc15",  # yellow-400
        "#22d3ee",  # cyan-400
        "#8b5cf6",  # violet-500
        "#f472b6",  # pink-400
        "#f97316",  # orange-500
    )

    @classmethod
    @lru_cache(maxsize=None)
    def generate_data_from_tree(
        cls,
        db_connection: mariadb.Connection,
        tree_id: int,
        phylome_id: int,
        tree_seed_protein_id: int,
        tree_newick: str,
    ) -> TreeViewData:
        uuid4_int_id: int = uuid4().int >> 64
        tree_name: str = f"tree-{uuid4_int_id}"

        tree = Tree(tree_newick)
        if not tree:
            raise ValueError

        neighbourhoods: list[GeneNeighbourhoodDAO] = list(
            GeneNeighbourhoodDAO.get_by_tree_id(db_connection, tree_id)
        )

        grouped_genes_by_contig: dict[MainContigGeneID, list[GeneNeighbourhoodDAO]] = {
            main_contig_gene_id: list(genes)
            for main_contig_gene_id, genes in groupby(
                sorted(neighbourhoods, key=lambda gene: gene.main_contig_gene_id),
                key=lambda gene: gene.main_contig_gene_id,
            )
        }
        seed_gene, seed_neighbourhood = cls._pop_seed_neighbourhood(
            tree_seed_protein_id, neighbourhoods
        )

        seed_gene_ids: list[int] = [gene.gene_id for gene in seed_neighbourhood]
        target_gene_ids: list[int] = [
            gene.gene_id for gene in neighbourhoods if gene.gene_id not in seed_gene_ids
        ]

        homologous_genes = tuple(
            HomologDAO.get_homologs_for_seed_genes(
                db_connection, seed_gene_ids, target_gene_ids, phylome_id
            )
        )
        orthologous_genes = tuple(
            OrthologsDAO.get_orthologs_for_seed_genes(
                db_connection, seed_gene_ids, target_gene_ids, phylome_id
            )
        )
        homolog_target_to_seed_map: dict[GeneID, GeneID] = {
            gene.homolog_gene_id: gene.seed_gene_id for gene in homologous_genes
        }
        ortholog_target_to_seed_map: dict[GeneID, GeneID] = {
            gene.ortholog_gene_id: gene.seed_gene_id for gene in orthologous_genes
        }
        leaf_protein_ids: set[ProteinID] = set(
            map(
                lambda node: cls.get_protein_id_from_node_name(node.name), tree.leaves()
            )
        )
        relationship_map: dict[ProteinID, dict[GeneID, GeneRelationData]] = (
            cls.get_gene_order_homology_relationship_map(
                leaf_protein_ids,
                seed_gene,
                grouped_genes_by_contig,
                neighbourhoods,
                homolog_target_to_seed_map,
                ortholog_target_to_seed_map,
            )
        )
        tree_node_tooltip_data: Iterator[TreeNodeTooltipData] = (
            TreeNodeTooltipData.get_by_tree_id(db_connection, tree_id)
        )
        mapped_tree_node_tooltip_data: dict[ProteinID, TreeNodeTooltipData] = {
            data.protein_id: data for data in tree_node_tooltip_data
        }
        gene_order_tree_layout = cls.generate_gene_order_tree_layout(
            tree, relationship_map
        )
        tree_view_data: TreeViewData = {
            "id": uuid4_int_id,
            "name": tree_name,
            "tree": tree,
            "layouts": [gene_order_tree_layout],
            "include_props": None,
            "exclude_props": None,
            "tree_node_tooltip_data": mapped_tree_node_tooltip_data,
        }
        return tree_view_data

    @classmethod
    def _pop_seed_neighbourhood(
        cls, seed_protein_id: ProteinID, neighbourhoods: list[GeneNeighbourhoodDAO]
    ) -> tuple[SeedGene, list[GeneNeighbourhoodDAO]]:
        seed_gene_neighbour_index_to_pop: int | None = next(
            (
                index
                for index, obj in enumerate(neighbourhoods)
                if obj.protein_id == seed_protein_id
            ),
            None,
        )
        if seed_gene_neighbour_index_to_pop is None:
            raise ValueError
        seed_gene: GeneNeighbourhoodDAO = neighbourhoods.pop(
            seed_gene_neighbour_index_to_pop
        )
        seed_neighbour_genes: list[GeneNeighbourhoodDAO] = [seed_gene]
        for gene in neighbourhoods:
            if gene.main_contig_gene_id == seed_gene.main_contig_gene_id:
                seed_neighbour_genes.append(gene)
        return seed_gene, seed_neighbour_genes

    @classmethod
    def get_protein_id_from_node_name(cls, node_name: str) -> int:
        """
        Extracts the protein ID from a node name.
        """
        protein_id_str = node_name.split("Phy")[1].split("_")[0]
        return int(protein_id_str)

    @classmethod
    def _get_colors_and_strokes(
        cls,
        seed_gene_id: GeneID,
        seed_neighbour_assigned_colors: dict[GeneID, str],
        neighbour_gene_id: GeneID,
        homologous_neighbour_gene_id: GeneID | None,
        orthologous_neighbour_gene_id: GeneID | None,
    ) -> FaceColorsAndStrokes:
        relation_color: str = cls.none_gene_color
        base_color: str | None = None
        if homologous_neighbour_gene_id is not None:
            base_color = seed_neighbour_assigned_colors.get(
                homologous_neighbour_gene_id
            )

        if neighbour_gene_id == seed_gene_id:
            relation_color = cls.seed_gene_color
        elif base_color is not None:
            relation_color = base_color

        relation_stroke_color = cls.default_stroke_color
        relation_stroke_width = cls.default_stroke_width
        if orthologous_neighbour_gene_id is not None:
            relation_stroke_color = cls.orthologous_stroke_color
            relation_stroke_width = cls.orthologous_stroke_width
        elif homologous_neighbour_gene_id is not None:
            relation_stroke_color = cls.homologous_stroke_color
            relation_stroke_width = cls.homologous_stroke_width

        data: FaceColorsAndStrokes = {
            "bg_color": relation_color,
            "stroke_color": relation_stroke_color,
            "stroke_width": relation_stroke_width,
        }
        return data

    @classmethod
    def get_gene_order_homology_relationship_map(
        cls,
        leaf_protein_ids: Iterable[ProteinID],
        seed_gene: GeneNeighbourhoodDAO,
        grouped_genes_by_contig: dict[MainContigGeneID, list[GeneNeighbourhoodDAO]],
        target_neighbourhoods: Iterable[GeneNeighbourhoodDAO],
        homolog_target_to_seed_map: dict[GeneID, GeneID],
        ortholog_target_to_seed_map: dict[GeneID, GeneID],
    ) -> dict[ProteinID, dict[GeneID, GeneRelationData]]:
        seed_contig_genes: list[GeneNeighbourhoodDAO] = grouped_genes_by_contig[
            seed_gene.main_contig_gene_id
        ]
        seed_neighbour_assigned_colors: dict[GeneID, str] = (
            cls._get_seed_neighbour_assigned_colors(
                seed_gene_id=seed_gene.gene_id,
                seed_contig_genes=seed_contig_genes,
            )
        )
        relationship_map: dict[ProteinID, dict[GeneID, GeneRelationData]] = (
            cls._init_relationship_map_with_seed_neighbours(
                seed_gene, seed_contig_genes
            )
        )

        for target_protein_id in leaf_protein_ids:
            for gene in target_neighbourhoods:
                leaf_gene_id: GeneID = gene.gene_id
                gene_protein_id: ProteinID = gene.protein_id
                main_contig_gene_id: MainContigGeneID = gene.main_contig_gene_id
                if target_protein_id != gene_protein_id:
                    continue

                if leaf_gene_id in relationship_map[seed_gene.protein_id]:
                    relationship_map.setdefault(
                        target_protein_id,
                        {
                            leaf_gene_id: relationship_map[seed_gene.protein_id][
                                leaf_gene_id
                            ]
                        },
                    )
                else:
                    homologous_seed_neighbour_gene_id: GeneID | None = (
                        homolog_target_to_seed_map.get(leaf_gene_id, None)
                    )
                    orthologous_seed_neighbour_gene_id: GeneID | None = (
                        ortholog_target_to_seed_map.get(leaf_gene_id, None)
                    )

                    leaf_gene_color_data = cls._get_colors_and_strokes(
                        seed_gene_id=seed_gene.gene_id,
                        seed_neighbour_assigned_colors=seed_neighbour_assigned_colors,
                        neighbour_gene_id=leaf_gene_id,
                        homologous_neighbour_gene_id=homologous_seed_neighbour_gene_id,
                        orthologous_neighbour_gene_id=orthologous_seed_neighbour_gene_id,
                    )

                    relationship_map.setdefault(
                        target_protein_id,
                        {
                            leaf_gene_id: {
                                "homologous_with": homologous_seed_neighbour_gene_id,
                                "orthologous_with": orthologous_seed_neighbour_gene_id,
                                "assigned_color": leaf_gene_color_data["bg_color"],
                                "stroke_color": leaf_gene_color_data["stroke_color"],
                                "stroke_width": leaf_gene_color_data["stroke_width"],
                                "gene": gene,
                            }
                        },
                    )
                for leaf_neighbour_gene in grouped_genes_by_contig[main_contig_gene_id]:
                    leaf_neighbour_gene_id = leaf_neighbour_gene.gene_id

                    if leaf_neighbour_gene_id in relationship_map[seed_gene.protein_id]:
                        relationship_map[target_protein_id][leaf_neighbour_gene_id] = (
                            relationship_map[seed_gene.protein_id][
                                leaf_neighbour_gene_id
                            ]
                        )
                    else:
                        leaf_neighbour_homolog_gene_id: GeneID | None = (
                            homolog_target_to_seed_map.get(leaf_neighbour_gene_id, None)
                        )
                        leaf_neighbour_ortholog_gene_id: GeneID | None = (
                            ortholog_target_to_seed_map.get(
                                leaf_neighbour_gene_id, None
                            )
                        )

                        leaf_neighbour_gene_color_data = cls._get_colors_and_strokes(
                            seed_gene_id=seed_gene.gene_id,
                            seed_neighbour_assigned_colors=seed_neighbour_assigned_colors,
                            neighbour_gene_id=leaf_neighbour_gene_id,
                            homologous_neighbour_gene_id=leaf_neighbour_homolog_gene_id,
                            orthologous_neighbour_gene_id=leaf_neighbour_ortholog_gene_id,
                        )

                        relationship_map[target_protein_id][leaf_neighbour_gene_id] = {
                            "homologous_with": leaf_neighbour_homolog_gene_id,
                            "orthologous_with": leaf_neighbour_ortholog_gene_id,
                            "assigned_color": leaf_neighbour_gene_color_data[
                                "bg_color"
                            ],
                            "stroke_color": leaf_neighbour_gene_color_data[
                                "stroke_color"
                            ],
                            "stroke_width": leaf_neighbour_gene_color_data[
                                "stroke_width"
                            ],
                            "gene": leaf_neighbour_gene,
                        }
        return relationship_map

    @classmethod
    def generate_gene_order_tree_layout(
        cls,
        tree: Tree,
        relationship_map: dict[ProteinID, dict[GeneID, GeneRelationData]],
    ) -> CustomLayout:
        get_face_args: dict[ProteinID, list[GetFaceArgGene]] = {}

        for node in tree.traverse():
            if not node.is_leaf:
                continue

            current_protein_id: int = cls.get_protein_id_from_node_name(node.name)
            get_face_args.setdefault(current_protein_id, [])

            gene_neighbourhood: dict[GeneID, GeneRelationData] = relationship_map[
                current_protein_id
            ]
            total_gene_data_size: int = cls._calculate_total_gene_data_size(
                gene_neighbourhood
            )

            for gene_id, gene_relation_data in gene_neighbourhood.items():
                neighbour_gene = gene_relation_data["gene"]
                homologs_with_gene_id = gene_relation_data["homologous_with"]
                orthologs_with_gene_id = gene_relation_data["orthologous_with"]
                cls._check_and_set_strand(neighbour_gene)
                tooltip: str = cls._generate_tooltip_data_html(
                    neighbour_gene, homologs_with_gene_id, orthologs_with_gene_id
                )
                orientation = "right" if neighbour_gene.strand != "-" else "left"
                selected_color = gene_relation_data["assigned_color"]
                selected_stroke_color = gene_relation_data["stroke_color"]
                selected_stroke_width = gene_relation_data["stroke_width"]
                face = ArrowFace(
                    width=cls._scale_radius(
                        total_gene_data_size, neighbour_gene.end - neighbour_gene.start
                    ),
                    height=15,
                    orientation=orientation,
                    color=selected_color,
                    stroke_color=selected_stroke_color,
                    stroke_width=selected_stroke_width,
                    tooltip=tooltip,
                    name="ArrowFace",
                    padding_x=2,
                    padding_y=2,
                )
                get_face_args[current_protein_id].append(
                    GetFaceArgGene(
                        gene_id=gene_id,
                        face=face,
                        start=neighbour_gene.start,
                        end=neighbour_gene.end,
                    )
                )

            # Postprocess sort the neighbourhood.
            get_face_args[current_protein_id].sort(key=lambda x: (x.start, x.end))

        layout = GeneOrderTreeLayout(
            name="MyTreeLayout",
            args=get_face_args,
            aligned_faces=True,
        )
        return layout

    @classmethod
    def _scale_radius(
        cls, protein_size: int, gene_size: int, min_size: int = 9, max_size: int = 40
    ) -> int:
        """
        Scales the size of the gene in relation to the size of the protein,
        and returns a value between min_size and max_size based on the percentage
        that the gene size represents in relation to the protein size.
        """
        percentage = (gene_size / protein_size) * 100
        scaled_value = (percentage / 100) * (max_size - min_size) + min_size
        return round(scaled_value)

    @classmethod
    def _check_and_set_strand(cls, gene: GeneNeighbourhoodDAO) -> None:
        """
        This function checks the 'strand' attribute of a gene object.
        If the strand is "?", it changes it to "+" and prints a warning.
        """
        if gene.strand == "?":
            print(
                "[WARNING] The strand wasn't defined in the annotation source. Using '+' as default.",
                file=sys.stderr,
            )
            gene.strand = "+"

    @classmethod
    def _generate_tooltip_data_html(
        cls,
        data: GeneNeighbourhoodDAO,
        homologs_with_gene_id: int | None,
        orthologs_with_gene_id: int | None,
    ) -> str:
        """
        Generate tooltip data in a html format
        """
        tooltip: str = f"""
        <div>
            <ul>
                <li style='margin-left: 10px;'><strong>Gene ID:</strong> {data.gene_id}</li>
                <li style='margin-left: 10px;'><strong>External Gene ID:</strong> {data.external_gene_id}</li>
                <li style='margin-left: 10px;'><strong>Contig ID:</strong> {data.contig_id}</li>
                <li style='margin-left: 10px;'><strong>Gene Name:</strong> {data.gene_name}</li>
                <li style='margin-left: 10px;'><strong>Source:</strong> {data.source}</li>
                <li style='margin-left: 10px;'><strong>Start:</strong> {data.start}</li>
                <li style='margin-left: 10px;'><strong>End:</strong> {data.end}</li>
                <li style='margin-left: 10px;'><strong>Relative Contig Gene Order:</strong> {data.relative_contig_gene_order}</li>
                <li style='margin-left: 10px;'><strong>Strand:</strong> {data.strand}</li>
                <li style='margin-left: 10px;'><strong>Timestamp:</strong> {data.timestamp}</li>
                <li style='margin-left: 10px;'><strong>Genome ID:</strong> {data.genome_id}</li>
                <li style='margin-left: 10px;'><strong>Orthologous with:</strong> {orthologs_with_gene_id}</li>
                <li style='margin-left: 10px;'><strong>Homologous with:</strong> {homologs_with_gene_id}</li>
            </ul>
        </div>
                """
        return tooltip

    @classmethod
    def _calculate_total_gene_data_size(
        cls, gene_data: dict[GeneID, GeneRelationData]
    ) -> int:
        """
        Sums up the size (end - start) of each gene in the test_data list,
        representing the total size occupied by the genes individually.
        """
        gene_sizes: Iterable[int] = (
            gene_relation_data["gene"].end - gene_relation_data["gene"].start
            for _, gene_relation_data in gene_data.items()
        )
        total_size = sum(gene_sizes)
        return total_size

    @classmethod
    def _get_seed_neighbour_assigned_colors(
        cls, seed_gene_id: GeneID, seed_contig_genes: list[GeneNeighbourhoodDAO]
    ) -> dict[GeneID, HexColor]:
        seed_neighbour_assigned_colors: dict[GeneID, str] = {}
        seed_neighbour_assigned_colors[seed_gene_id] = cls.seed_gene_color
        for color_idx, seed_neighbour_gene in enumerate(seed_contig_genes):
            if seed_neighbour_gene.gene_id == seed_gene_id:
                seed_neighbour_assigned_colors[seed_gene_id] = cls.seed_gene_color
                continue
            relation_color: str = cls.homology_colors[color_idx]
            seed_neighbour_assigned_colors[seed_neighbour_gene.gene_id] = relation_color
        return seed_neighbour_assigned_colors

    @classmethod
    def _init_relationship_map_with_seed_neighbours(
        cls,
        seed_gene: GeneNeighbourhoodDAO,
        seed_contig_genes: list[GeneNeighbourhoodDAO],
    ) -> dict[ProteinID, dict[GeneID, GeneRelationData]]:
        # First, add seed protein data and the rest of the genes from the seed's neighbourhood.
        relationship_map: dict[ProteinID, dict[GeneID, GeneRelationData]] = {
            seed_gene.protein_id: {
                seed_gene.gene_id: {
                    "homologous_with": None,
                    "orthologous_with": None,
                    "assigned_color": cls.seed_gene_color,
                    "stroke_color": cls.default_seed_stroke_color,
                    "stroke_width": cls.default_seed_stroke_width,
                    "gene": seed_gene,
                }
            },
        }

        for color_idx, seed_neighbour_gene in enumerate(seed_contig_genes):
            if seed_neighbour_gene.gene_id == seed_gene.gene_id:
                continue
            relationship_map[seed_gene.protein_id].setdefault(
                seed_neighbour_gene.gene_id,
                {
                    "homologous_with": None,
                    "orthologous_with": None,
                    "assigned_color": cls.homology_colors[color_idx],
                    "stroke_color": cls.default_stroke_color,
                    "stroke_width": cls.default_stroke_width,
                    "gene": seed_neighbour_gene,
                },
            )
        return relationship_map
