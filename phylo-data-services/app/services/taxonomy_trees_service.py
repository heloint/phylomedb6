#!/usr/bin/env python3

from __future__ import annotations
import os
import subprocess
from typing import Iterator

import mariadb  # type: ignore

from models.phylome_content_dao import PhylomeContentDAO
from utils.mariadb_connection import get_single_mariadb_connection


class TaxonomyTreesService:
    output_directory_path: str = os.path.join("./static", "taxonomy-trees")

    @classmethod
    def get_taxonomy_tree_images_by_phylome_id(
        cls, db_connection: mariadb.Connection, phylome_id: int, tree_style: str
    ) -> str:
        if tree_style not in ["circular", "rectangular"]:
            raise ValueError(
                f"Invalid tree_style argument in URL: {tree_style}. Must be 'circular' or 'rectangular'."
            )
        image_names_prefix: str = f"phylome_{phylome_id}"
        image_file_path: str = os.path.join(
            cls.output_directory_path, f"{image_names_prefix}_{tree_style}.png"
        )
        if os.path.exists(image_file_path) and os.path.isfile(image_file_path):
            return image_file_path

        db_results: Iterator[PhylomeContentDAO] = PhylomeContentDAO.get_by_phylome_id(
            db_connection, phylome_id
        )
        taxonomy_ids: list[int] = [entry.taxid for entry in db_results]
        cls._run_taxonomy_tree_generator(
            taxonomy_ids, cls.output_directory_path, image_names_prefix
        )
        return image_file_path

    @classmethod
    def generate_all_taxonomy_tree_images(cls) -> None:
        print("==> Starting to generate the taxonomy tree images.")
        db_connection: mariadb.Connection = get_single_mariadb_connection()
        cursor: mariadb.Cursor = db_connection.cursor()
        cursor.execute("SELECT phylome_id FROM phylomes")
        phylome_ids: list[int] = [row[0] for row in cursor]
        for phylome_id in phylome_ids:
            image_names_prefix: str = f"phylome_{phylome_id}"
            db_results: Iterator[PhylomeContentDAO] = (
                PhylomeContentDAO.get_by_phylome_id(db_connection, phylome_id)
            )
            taxonomy_ids: list[int] = [entry.taxid for entry in db_results]
            cls._run_taxonomy_tree_generator(
                taxonomy_ids, cls.output_directory_path, image_names_prefix
            )
        print("==> Finished to generate the taxonomy tree images.")

    @classmethod
    def _run_taxonomy_tree_generator(
        cls,
        taxonomy_ids: list[int],
        output_directory_path: str,
        image_names_prefix: str,
    ) -> None:
        formatted_taxids: str = " ".join(tuple(map(str, taxonomy_ids)))
        cmd: str = (
            "xvfb-run generate_taxonomy_tree_by_taxids "
            f"--taxonomy_ids {formatted_taxids} "
            f"--output_directory_path {output_directory_path} "
            f"--image_names_prefix {image_names_prefix}"
        )
        exit_code, output = subprocess.getstatusoutput(cmd)
        if exit_code != 0:
            raise ChildProcessError(output)
