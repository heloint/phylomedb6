#!/usr/bin/env python3

from __future__ import annotations

import sys
import os
import json
import sqlite3
from itertools import chain
from itertools import islice
from math import ceil
from typing import Any
from typing import Dict
from typing import Generator
from typing import Iterable
from typing import List
from typing import Tuple

from ete3 import NCBITaxa  # type: ignore
from typing import TypedDict


class PhylomeData(TypedDict):
    phylome: str
    id: int
    seed: int
    species: List[int]
    presence_percentages: List[float]


RecursiveHierarchicalTree = Dict[Any, Dict[Any, Any]]


class PhyloExplorerHeatmapJSONService:
    def __init__(
        self,
        query_result: Tuple[Tuple[str, int, int, int]],
        queried_tax_ids: List[int],
    ):

        self.queried_tax_ids: List[int] = list(map(int, queried_tax_ids))

        self.query_result: Tuple[Tuple[str, int, int, int]] = query_result

        try:
            self.species_presence_percentages: Dict[int, Dict[int, float]] = (
                self.get_species_presence_percentages(
                    os.environ["PHYLO_EXPLORER_SQLITE_DB_PATH"]
                )
            )

            self.grouped_data: List[PhylomeData] = self.group_data(
                self.query_result, self.species_presence_percentages
            )
            (self.grouped_data, self.all_species) = self.restrict_grouped_data(
                self.grouped_data, self.queried_tax_ids
            )  # type:ignore

            self.lineages: List[List[int]] = self.get_lineages(self.all_species)

            self.raw_tree: RecursiveHierarchicalTree = self.get_raw_taxa_tree(
                self.lineages, self.all_species
            )
            self.formatted_tree: RecursiveHierarchicalTree = self.format_tree(
                self.raw_tree, self.all_species
            )[0]

            ordered_species_generator: Generator[int, None, None] = self.order_species(
                self.raw_tree, self.all_species
            )

            self.ordered_species: List[int] = list(ordered_species_generator)  # type: ignore

            (
                self.ordered_grouped_data,
                self.column_labels,
                self.column_ids,
            ) = self.order_phylomes(
                self.grouped_data, self.ordered_species, self.queried_tax_ids
            )

            self.distance_matrix: List[List[float]] = self.create_distance_matrix(
                self.ordered_grouped_data, self.ordered_species
            )

            self.json_output: object = self.prepare_json_output(
                self.distance_matrix,
                self.formatted_tree,
                self.ordered_species,  # type: ignore
                self.column_labels,
                self.column_ids,
            )

            self.pretty_json_output: object = self.prepare_pretty_json_output(
                self.distance_matrix,
                self.formatted_tree,
                self.ordered_species,  # type: ignore
                self.column_labels,
                self.column_ids,
            )

            self.divided_json: object = self.divide_json(self.json_output)

        # If IndexError occurs it usually means, that during
        # "self.restrict_grouped_data" method could not find any phylomes with
        # the combination of the given species.
        except IndexError as e:
            error_message = "Could not find any phylomes for the given combinations of taxonomy IDs. Try again with other combination."
            print(str(e), file=sys.stderr)
            print(error_message, file=sys.stderr)
            self.divided_json = json.dumps({"error": error_message})

        except sqlite3.OperationalError as sqlErr:
            error_message = (
                "An issue has occured with our service. Please, visit back later."
            )
            print(sqlErr, file=sys.stderr)
            self.divided_json = json.dumps({"error": error_message})

    def get_species_presence_percentages(
        self, db_path: str
    ) -> Dict[int, Dict[int, float]]:
        """This cluster heatmap script should have a SQLite3 database in the
        same directory as this script. We use the content of that database file
        to create the heatmap matrix. This function returns the presence
        percentages for each species in each phylomes."""

        conn: sqlite3.Connection = sqlite3.connect(db_path)
        cur: sqlite3.Cursor = conn.cursor()
        cur.execute(f"SELECT phylome_id, taxid, ocurrence_percentage FROM phylome_data")

        species_presence_percentages: Dict[int, Dict[int, float]] = {}

        for row in cur.fetchall():
            phylome_id, taxid, cooccurrence_percentage = row

            if phylome_id not in species_presence_percentages.keys():
                species_presence_percentages.setdefault(phylome_id, {})

            species_presence_percentages[phylome_id][taxid] = cooccurrence_percentage

        return species_presence_percentages

    def group_data(
        self,
        query_result: Tuple[Tuple[str, int, int, int]],
        species_presence_percentages: Dict[int, Dict[int, float]],
    ) -> List[PhylomeData]:
        """Groups the received SQL query result: Tuple[Tuple[str, int, int, int]],
        then organizes them into various variables and a grouped dictionary
        for further uses.
        """

        grouped_data: List[PhylomeData] = []

        for phylome_name, phylome_id, seed_taxid, taxid in query_result:

            if (
                not grouped_data
                or grouped_data
                and grouped_data[-1]["phylome"] != phylome_name
            ):

                tmp_dict: PhylomeData = {
                    "phylome": phylome_name,
                    "id": phylome_id,
                    "seed": seed_taxid,
                    "species": [],
                    "presence_percentages": [],
                }
                grouped_data.append(tmp_dict)

            if grouped_data[-1]["phylome"] == phylome_name:
                grouped_data[-1]["species"].append(taxid)

        # Seed distances
        # =====================================================
        for dictionary in grouped_data:
            species: List[int] = dictionary["species"]  # type:ignore
            phylome_id = dictionary["id"]

            # NEW COLOR SCALING IMPLEMENT HERE!
            # ======================================================
            result: list[float] = []
            for taxid in species:
                if taxid == dictionary["seed"]:

                    # Given -1, because that's for sure won't occur as a
                    # percentage value neither by accident in the
                    # "species_occurences".
                    result += (-1,)

                elif (
                    phylome_id in species_presence_percentages.keys()
                    and taxid in species_presence_percentages[phylome_id]
                ):
                    result += (species_presence_percentages[phylome_id][taxid],)

                else:
                    result += (0,)

            dictionary["presence_percentages"] = result
            # ======================================================
        return grouped_data

    def restrict_grouped_data(
        self, grouped_data: List[PhylomeData], queried_tax_ids: List[int]
    ) -> Tuple[List[PhylomeData], List[int]]:
        """Restrict the results to only those phylomes
        which are contains all of the "queried_tax_ids".
        """

        grouped_data = grouped_data

        new_grouped_data: List[PhylomeData] = []
        for dictionary in grouped_data:
            if (
                all(int(item) in dictionary["species"] for item in queried_tax_ids)
                == True
            ):
                new_grouped_data += [dictionary]

        all_species: List[int] = list(
            set(
                chain.from_iterable(
                    [dictionary["species"] for dictionary in new_grouped_data]
                )
            )
        )

        return new_grouped_data, all_species

    def get_lineages(self, all_species: List[int]) -> List[List[int]]:
        """From the list of all species present in the resulted phylomes,
        create a list[list[int]] formated lineages.
        """
        ncbi = NCBITaxa()

        lineages: list = []

        for taxid in all_species:

            try:
                curr_lineage: list = ncbi.get_lineage(taxid)

                # Avoid ETE3 to mutate the input taxids.
                # ======================================
                if taxid != curr_lineage[-1]:
                    curr_lineage[-1] = taxid
                # ======================================

                lineages += [curr_lineage]
            except ValueError:
                continue

        if isinstance(lineages[0], dict):
            lineage_list: list = []
            for dictionary in lineages:
                lineage: list = list(dictionary.values())
                lineage_list += [lineage]

            return lineage_list

        return sorted(lineages, key=len)

    def get_raw_taxa_tree(
        self, lineages: List[List[int]], all_species: List[int]
    ) -> RecursiveHierarchicalTree:
        """Creates a clustered Dict[str, Dict[Any, Any]],
        which represent a raw taxa tree from the lineages.
        """

        raw_tree: Dict[int, Dict[Any, Any]] = {}
        for keys in lineages:
            tmp: Dict[int, Dict[Any, Any]] = raw_tree

            for key in keys:
                try:
                    default = "" if key in all_species else {}

                    if default == {}:
                        tmp = tmp.setdefault(key, default)  # type: ignore
                    else:
                        tmp[key] = ""  # type: ignore

                except AttributeError:
                    continue

        return raw_tree

    # FORMAT THE RAW TREE BASE
    # ===========================================================================================
    def format_tree(
        self, raw_tree: Dict, all_species: List
    ) -> List[RecursiveHierarchicalTree]:
        """Formats the resulted raw tree from as it can be further processed,
        then displayed by the javascript d3.js library."""

        formatted_tree: List[RecursiveHierarchicalTree] = []
        if isinstance(raw_tree, dict):
            for key, value in raw_tree.items():
                if key in all_species:
                    temp_by_name: Dict[str, List[str]] = {"name": [key]}

                else:
                    temp_by_name = {"name": ["node"]}

                if value:
                    temp_by_name["children"] = self.format_tree(value, all_species)  # type: ignore

                formatted_tree.append(temp_by_name)  # type: ignore

        return formatted_tree

    def order_species(
        self, raw_tree: Dict[Any, Dict[Any, Any]], all_species: List[int]
    ) -> Generator[int, None, None]:
        """Recursively parses the "raw_tree" and returns an iterator with
        the species of "all_species" in the same order in which they occur in
        the tax. tree."""

        for key, value in raw_tree.items():
            if type(value) is dict:
                yield from self.order_species(value, all_species)
            else:
                if key in all_species:
                    yield key

    def order_phylomes(
        self,
        grouped_data: List[PhylomeData],
        ordered_species: List[int],
        queried_species: List[int],
    ) -> Tuple[List[PhylomeData], List[str], List[int]]:
        """Reorders the List[PhylomeData] in two different parts. First by
        those phylomes which have one of the "queried_tax_ids", then when that
        sorting is exhausted, it orders by the average "presence_percentages"
        between the queried_tax_ids."""

        # Order queried_species by the taxonomy tree's order
        ordered_queried_species: List[int] = [
            tree_species
            for tree_species in ordered_species
            if tree_species in queried_species
        ]

        # Mask to get the average of percentage values of the queried_species for
        # each phylome.
        percentage_avg_mask = lambda x: (
            sum(
                [
                    x["presence_percentages"][x["species"].index(taxid)]
                    for taxid in x["species"]
                    if taxid in queried_species
                ]
            )
            / len(queried_species)
        )

        # Part 1: Get the phylomes which have the seeds in the queried_species.
        # This part pops the dictionaries from the array, so in the next part it is
        # easier to sort the rest of the phylomes by the average percentage values.
        seed_equals_queried: List[PhylomeData] = []

        for taxid in ordered_queried_species:
            for idx, phylome in enumerate(grouped_data):

                if phylome["seed"] == taxid:
                    seed_equals_queried.append(phylome)

        # Part 2: Order the rest of the grouped_data

        rest_of_phylomes = [
            phylome for phylome in grouped_data if phylome not in seed_equals_queried
        ]
        # Order the rest of the phylomes by the "percentage_avg_mask".
        # ordered_rest_of_phylomes = sorted(grouped_data,
        #                                   key=percentage_avg_mask, reverse=True)

        ordered_rest_of_phylomes = sorted(
            rest_of_phylomes, key=percentage_avg_mask, reverse=True
        )

        # ordered_rest_of_phylomes = grouped_data

        # Merge the two lists of phylomes.
        ordered_grouped_data = seed_equals_queried + ordered_rest_of_phylomes

        column_labels: List[str] = [
            dictionary["phylome"] for dictionary in ordered_grouped_data
        ]
        column_ids: List[int] = [
            dictionary["id"] for dictionary in ordered_grouped_data
        ]

        return ordered_grouped_data, column_labels, column_ids

    def create_distance_matrix(
        self,
        grouped_data: List[PhylomeData],
        ordered_species: list,
    ) -> List[List[float]]:
        """Arranges the distance values calculated from the seed taxid index
        into a matrix with filled gaps, so the format matches with the corresponding
        javascript d3.js library.
        """

        distance_matrix: List[List[float]] = []

        for phylome in grouped_data:
            phylome_species: List[int] = phylome["species"]
            phylome_distances: List[float] = phylome["presence_percentages"]
            counter: int = 0

            for i, taxid in enumerate(ordered_species):

                if i > len(distance_matrix) - 1:
                    distance_matrix.append([])
                if taxid in phylome_species:

                    distance_matrix[i].append(
                        phylome_distances[phylome_species.index(taxid)]
                    )
                    counter += 1
                else:
                    distance_matrix[i] += (0,)

        return distance_matrix

    def prepare_json_output(
        self,
        distance_matrix: List[List[float]],
        formatted_tree: Dict[Any, Dict[Any, Any]],
        ordered_species: List[int],
        column_labels: List[str],
        column_ids: List[int],
    ) -> object:
        """Joins the needed datas into a dictionary, then converts it into json."""

        # Translates the list of taxonomy IDs into taxonomy names
        # ==========================================================
        ncbi: NCBITaxa = NCBITaxa()
        ordered_species_by_name: List[str] = []
        for taxid in ordered_species:
            translate_result = list(ncbi.get_taxid_translator([taxid]).values())[0]
            ordered_species_by_name += (translate_result,)
        # ==========================================================

        output_dict: dict = {
            "matrix": distance_matrix,
            "dendrogram_tree": formatted_tree,
            "rowLabelJSON": ordered_species_by_name,
            "rowLabelIDJSON": ordered_species,
            "colJSON": column_labels,
            "colIDJSON": column_ids,
        }

        output_json: object = json.dumps(output_dict)

        return output_json

    def prepare_pretty_json_output(
        self,
        distance_matrix: List[List[float]],
        formatted_tree: Dict[Any, Dict[Any, Any]],
        ordered_species: List[int],
        column_labels: List[str],
        column_ids: List[int],
    ) -> object:
        """Joins the needed datas into a dictionary, then converts it into json."""

        # Translates the list of taxonomy IDs into taxonomy names
        # ==========================================================
        ncbi: NCBITaxa = NCBITaxa()
        ordered_species_by_name: List[str] = []
        for taxid in ordered_species:
            translate_result = list(ncbi.get_taxid_translator([taxid]).values())[0]
            ordered_species_by_name += (translate_result,)
        # ==========================================================

        output_dict: dict = {
            "matrix": distance_matrix,
            "dendrogram_tree": formatted_tree,
            "rowLabelJSON": ordered_species_by_name,
            "rowLabelIDJSON": ordered_species,
            "colJSON": column_labels,
            "colIDJSON": column_ids,
        }

        output_json: object = json.dumps(output_dict, indent=4)

        return output_json

    def save_json(self, path: str) -> None:
        "Writes the json output to file."

        with open(path, "w", encoding="utf-8") as file:
            file.write(str(self.json_output))

    def get_chunk_sizes(self, max_chunk_size: int, input_ls: list[Any]) -> list[int]:
        "Calculates each tab what length needs to have"

        chunk_sizes: list[int] = []
        for i in range(0, len(input_ls), max_chunk_size):
            current_length: int = len(input_ls[i : i + max_chunk_size])

            if current_length == max_chunk_size:
                chunk_sizes += (current_length,)
            elif current_length < max_chunk_size and current_length <= ceil(
                max_chunk_size * 0.10
            ):

                if len(chunk_sizes) == 0:
                    chunk_sizes += [current_length]
                else:
                    chunk_sizes[-1] += current_length
            else:
                chunk_sizes += (current_length,)

        return chunk_sizes

    def divide_ls(self, input_ls: list[Any], chunk_sizes: list[int]) -> list[list[Any]]:
        """Divides the list[Any] to list[list[Any]]
        where the size of each list[Any] corresponds
        to the given sizes in the chunk_sizes: list[int]."""

        iter_ls: Iterable = iter(input_ls)
        split_ls: list[list[Any]] = [list(islice(iter_ls, i)) for i in chunk_sizes]

        return split_ls

    def divide_json(self, json_output: object) -> object:
        """Divides the json into various proportional chunks
        if the number of columns exceeds 100 cells.
        This function is used to create the necessary format
        for the heatmap "pages" / "panels" to be further processed."""

        json_dict: dict = json.loads(json_output)  # type: ignore

        matrix_horizontal_length: int = len(json_dict["matrix"][0])
        column_number: int = len(json_dict["colIDJSON"])

        if matrix_horizontal_length != column_number:
            raise ValueError(
                "The matrix horizontal length must be equal to the number of columns."
            )

        chunk_sizes = self.get_chunk_sizes(100, json_dict["matrix"][0])
        optimal_chunks_num: int = len(chunk_sizes)

        # Initialize the new dictionary for the chunks
        divided_dict: dict = {}
        for i in range(1, optimal_chunks_num + 1):
            divided_dict.setdefault(f"matrix_{i}", [])
            divided_dict.setdefault(f"colJSON_{i}", [])
            divided_dict.setdefault(f"colIDJSON_{i}", [])

        # Split the rows of the matrix and fetch them to the new dictionary
        # ==========================================================
        for row in json_dict["matrix"]:
            new_row = self.divide_ls(row, chunk_sizes)

            for i in range(optimal_chunks_num):
                divided_dict[f"matrix_{i + 1}"] += [new_row[i]]

        # ==========================================================

        # Split the 'colJSON' and 'colIDJSON' arrays of the json
        # and fetch them to the new dictionary.
        # ==========================================================
        column_label_chunks = self.divide_ls(json_dict["colJSON"], chunk_sizes)

        column_id_chunks = self.divide_ls(json_dict["colIDJSON"], chunk_sizes)

        for i in range(optimal_chunks_num):
            divided_dict[f"colJSON_{i + 1}"] += column_label_chunks[i]
            divided_dict[f"colIDJSON_{i + 1}"] += column_id_chunks[i]
        # ==========================================================

        # Fetch the rest of the json, which are not needed to be process.
        # ============================================================
        divided_dict["dendrogram_tree"] = json_dict["dendrogram_tree"]
        divided_dict["rowLabelJSON"] = json_dict["rowLabelJSON"]
        divided_dict["rowLabelIDJSON"] = json_dict["rowLabelIDJSON"]
        # ============================================================

        return json.dumps(divided_dict, indent=4)

    @classmethod
    def object_to_dict(cls, obj: object) -> dict:
        """
        Parse obj --> Dict
        """
        return json.loads(obj.__str__())
