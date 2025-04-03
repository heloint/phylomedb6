#!/usr/bin/env python3

import shutil
import binascii
from concurrent.futures import ThreadPoolExecutor
import os
import tarfile
from typing import Generator, Iterable, TypedDict
import zlib
import mariadb

from models.alignment_dao import AlignmentDAO  # type: ignore



class GetAlignmentsFastaOutputData(TypedDict):
    output_file_name: str
    output_file_path: str


class WriteAlignmentsArgs(TypedDict):
    alignment_string: str
    output_file_path: str


class AlignmentsDownloadService:
    @classmethod
    def get_alignments_fasta_by_phylome_id(
            cls, db_connection: mariadb.Connection, phylome_id: int, downloads_base_directory: str
    ) -> GetAlignmentsFastaOutputData:
        phylome_id_padded: str = f"{phylome_id:04d}"
        output_file_name: str = f"Phylome_{phylome_id_padded}_alignments.tar.gz"
        output_file_path: str = os.path.join(downloads_base_directory, output_file_name)
        if os.path.isfile(output_file_path):
            return {
                "output_file_name": output_file_name,
                "output_file_path": output_file_path,
            }
        alignments: Generator[AlignmentDAO, None, None] = (
            AlignmentDAO.get_alignment_by_phylome_id(db_connection, phylome_id)
        )
        output_directory_name: str = f"Phylome_{phylome_id_padded}_alignments"
        path_to_output_directory: str = os.path.join(
            downloads_base_directory, output_directory_name
        )
        os.makedirs(path_to_output_directory, exist_ok=True)
        write_alignments_args: Iterable[WriteAlignmentsArgs] = (
            cls._compose_alignment_output_file_arguments(
                path_to_output_directory, phylome_id_padded, alignments
            )
        )
        with ThreadPoolExecutor(max_workers=4) as executor:
            _ = tuple(executor.map(cls.write_alignment_file, write_alignments_args))
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
    def _compose_alignment_output_file_arguments(
        cls,
        output_directory_path: str,
        phylome_id_padded: str,
        alignments: Iterable[AlignmentDAO],
    ) -> Iterable[WriteAlignmentsArgs]:
        for alignment in alignments:
            alignment_decompress: bytes = cls._decompress_db_blob(alignment.alignment)
            alignment_string: str = alignment_decompress.decode()
            output_file_name: str = (
                f"Phylome_{phylome_id_padded}_{alignment.seed_protein_id}_{alignment.alignment_type}.fasta"
            )
            output_file_path: str = os.path.join(
                output_directory_path, output_file_name
            )
            yield {
                "alignment_string": alignment_string,
                "output_file_path": output_file_path,
            }

    @classmethod
    def _decompress_db_blob(cls, blob: bytes) -> bytes:
        decompressor = zlib.decompressobj()
        unhexed_blob: bytes = binascii.unhexlify(blob)
        decompressed_blob: bytes = decompressor.decompress(unhexed_blob)
        return decompressed_blob

    @classmethod
    def write_alignment_file(cls, args: WriteAlignmentsArgs) -> None:
        with open(args["output_file_path"], "w") as file:
            file.write(args["alignment_string"])

    @classmethod
    def _create_tar_from_files(
        cls, output_tar_path: str, output_directory_path: str, file_paths: Iterable[str]
    ) -> None:
        tar: tarfile.TarFile = tarfile.open(output_tar_path, "w:gz")
        for file in file_paths:
            file_path: str = os.path.join(output_directory_path, file)
            tar.add(file_path, arcname=file)
        tar.close()
