#!/usr/bin/env python3
from concurrent.futures import ThreadPoolExecutor
import os
import shutil
import tarfile
import mariadb  # type: ignore
from typing import TypedDict, Iterable, Generator

from models.tree_dao import TreeDAO


class WriteNewickFileArgs(TypedDict):
    newick_content: str
    output_file_name: str


class GetTreesNewickData(TypedDict):
    output_file_name: str
    output_file_path: str


class TreesDownloadService:
    @classmethod
    def get_trees_newick_by_phylome_id(
        cls,
        db_connection: mariadb.Connection,
        phylome_id: int,
        downloads_base_directory: str,
    ) -> GetTreesNewickData:
        phylome_id_padded: str = f"{phylome_id:04d}"
        output_file_name: str = f"Phylome_{phylome_id_padded}_trees.tar.gz"
        output_file_path: str = os.path.join(downloads_base_directory, output_file_name)
        if os.path.isfile(output_file_path):
            return {
                "output_file_name": output_file_name,
                "output_file_path": output_file_path,
            }
        trees: Generator[TreeDAO, None, None] = TreeDAO.get_tree_by_phylome_id(
            db_connection, phylome_id
        )
        output_directory_name: str = f"Phylome_{phylome_id_padded}_trees"
        path_to_output_directory: str = os.path.join(
            downloads_base_directory, output_directory_name
        )
        os.makedirs(path_to_output_directory, exist_ok=True)

        newick_output_file_args: Iterable[WriteNewickFileArgs] = (
            cls.compose_newick_output_file_arguments(
                path_to_output_directory, phylome_id_padded, trees
            )
        )
        with ThreadPoolExecutor(max_workers=4) as executor:
            _ = tuple(executor.map(cls._write_newick_file, newick_output_file_args))

        files_in_directory: list[str] = os.listdir(path_to_output_directory)
        if len(files_in_directory) > 0:
            cls._create_tar_from_files(
                output_file_path,
                path_to_output_directory,
                files_in_directory,
            )
            shutil.rmtree(path_to_output_directory)

        return {
            "output_file_name": output_file_name,
            "output_file_path": output_file_path,
        }

    @classmethod
    def compose_newick_output_file_arguments(
        cls,
        output_directory_path: str,
        phylome_id_padded: str,
        trees: Iterable[TreeDAO],
    ) -> Iterable[WriteNewickFileArgs]:
        for tree in trees:
            output_file_name: str = (
                f"Phylome_{phylome_id_padded}_{tree.seed_protein_id}.nw"
            )
            path_to_output_file: str = os.path.join(
                output_directory_path, output_file_name
            )
            yield {
                "newick_content": tree.newick,
                "output_file_name": path_to_output_file,
            }

    @classmethod
    def _write_newick_file(cls, args: WriteNewickFileArgs) -> None:
        with open(args["output_file_name"], "w") as file:
            file.write(args["newick_content"])

    @classmethod
    def _create_tar_from_files(
        cls, output_tar_path: str, output_directory_path: str, file_paths: Iterable[str]
    ) -> None:
        tar: tarfile.TarFile = tarfile.open(output_tar_path, "w:gz")
        for file in file_paths:
            file_path: str = os.path.join(output_directory_path, file)
            tar.add(file_path, arcname=file)
        tar.close()
