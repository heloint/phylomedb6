from __future__ import annotations

import sys
from datetime import datetime
from typing import Optional

import mariadb  # type: ignore
from models.utils import generate_instances_from_cursor
from pydantic import BaseModel


class PhyloExplorerHeatmapDAO(BaseModel, validate_assignment=True):
    taxid: int
    species_name: str

    @classmethod
    def all_species_heatmap(
        cls, connection: mariadb.Connection
    ) -> list[PhyloExplorerHeatmapDAO]:
        """
        Retrieves all species available for the heatmap.
        """
        cursor: mariadb.Cursor = connection.cursor()
        query: str = """
            SELECT
                DISTINCT(genomes.taxid) , species.name
            FROM
                phylome_contents
            INNER JOIN
                phylomes
            ON
              phylome_contents.phylome_id = phylomes.phylome_id
            INNER JOIN
                genomes
            ON
                phylome_contents.genome_id = genomes.genome_id
            INNER JOIN
                species
            ON
            genomes.taxid = species.taxid
            WHERE
                phylomes.is_public = 1
            ORDER BY
            genomes.taxid
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(query)
                results = generate_instances_from_cursor(cls, cursor)
                return list(results)
        except mariadb.Error as e:
            print(f"Error: {e}", file=sys.stderr)
            return []

    @classmethod
    def get_heatmap_input(
        cls,
        connection: mariadb.Connection,
        param_search_taxids: list[int],
    ) -> (
        tuple[tuple[str, int, int, int]] | None
    ):  # Use ... for variable length tuples
        """
        Retrieves heatmap input based on the provided tax IDs.
        Returns a tuple of tuples with the following structure:
        (phylome_name: str, phylome_id: int, seed_genome_id: int, taxid: int).
        """
        # taxid_list : list[str] = param_search_taxids.split(",")
        placeholders: str = ", ".join(["?"] * len(param_search_taxids))

        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""
        SELECT
            phylomes.name ,
            phylomes.phylome_id,
            phylomes.seed_genome_id,
            genomes.taxid
        FROM
            phylomes
        INNER JOIN
            phylome_contents
        ON
            phylomes.phylome_id = phylome_contents.phylome_id
        INNER JOIN
            genomes
        ON
            phylome_contents.genome_id = genomes.genome_id
        WHERE
            phylomes.is_public = 1
        AND
            genomes.taxid IN ({placeholders})
        ORDER BY
            phylomes.phylome_id;
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, (param_search_taxids))
                results = (
                    cursor.fetchall()
                )  # Fetch all results as a list of tuples

                # Convert list of tuples to a tuple of tuples
                return tuple(results)  # Return as a tuple
        except mariadb.Error as e:
            print(f"Error: {e}", file=sys.stderr)
            return None

    @classmethod
    def get_reduced_heatmap_input(
        cls,
        connection: mariadb.Connection,
        param_search_taxids: list[int],
    ) -> (
        tuple[tuple[str, int, int, int]] | None
    ):  # Change the return type to a tuple of tuples
        """
        Retrieves reduced heatmap input based on the provided tax IDs.
        Returns a tuple of tuples with the following structure:
        (phylome_name: str, phylome_id: int, seed_taxid: int, taxid: int).
        """
        placeholders: str = ", ".join(["?"] * len(param_search_taxids))

        cursor: mariadb.Cursor = connection.cursor()
        query: str = f"""
            SELECT
                phylomes.name,
                phylomes.phylome_id,
                phylomes.seed_genome_id,
                genomes.taxid
            FROM
                phylomes
            INNER JOIN
                phylome_contents
            ON
                phylomes.phylome_id = phylome_contents.phylome_id
            INNER JOIN
                genomes
            ON
                phylome_contents.genome_id = genomes.genome_id
            WHERE
                phylomes.is_public = 1
            AND
                phylomes.phylome_id IN ({placeholders})
            ORDER BY
                phylomes.phylome_id
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, param_search_taxids)
                results = (
                    cursor.fetchall()
                )  # Fetch all results as a list of tuples

            # Convert the list of tuples to a tuple of tuples
            return tuple(results)  # Return as a tuple of tuples
        except mariadb.Error as e:
            print(f"Error: {e}", file=sys.stderr)
            return None

    @classmethod
    def get_heatmap_search_result(
        cls,
        connection: mariadb.Connection,
        param_search_taxids: list[int],
    ) -> list[tuple[int, str, str, Optional[str], datetime]]:
        """
        Retrieves heatmap search results based on the provided tax IDs.
        Returns a list of tuples with the following structure:
        (phylome_id: int, phylome_name: str, species_name: str, comments: Optional[str], phylome_timestamp: datetime).
        """
        placeholders: str = ", ".join(["?"] * len(param_search_taxids))
        taxid_list_length: int = len(param_search_taxids)
        query: str = f"""
        SELECT
            phylomes.phylome_id, phylomes.name, species.name, phylomes.comments, phylomes.timestamp
        FROM
            species
        INNER JOIN
            genomes
        ON
            genomes.taxid = species.taxid
        INNER JOIN
            phylome_contents
        ON
            genomes.genome_id = phylome_contents.genome_id
        INNER JOIN
            phylomes
        ON
            phylome_contents.phylome_id = phylomes.phylome_id
        WHERE
            phylomes.is_public=1
        AND
            phylomes.phylome_id
        IN
            (SELECT phylome_id FROM phylome_contents
        WHERE
            species.taxid IN ({placeholders})
        GROUP BY
            phylome_id
        HAVING
            COUNT(DISTINCT species.taxid) >= {taxid_list_length}
            )
        ORDER BY
            phylomes.phylome_id;
"""
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, (param_search_taxids))
                results = (
                    cursor.fetchall()
                )  # Fetch all results as a list of tuples
                return results
        except mariadb.Error as e:
            print(f"Error: {e}", file=sys.stderr)
            return []
