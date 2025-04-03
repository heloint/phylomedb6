#!/usr/bin/env python3

import os
import mariadb  # type: ignore
from typing import TypedDict, Generator

from models.protein_sequence_dao import ProteinSequence



class GetProteomeFastaData(TypedDict):
    output_file_name: str
    output_file_path: str


class ProteomeDownloadService:
    @classmethod
    def get_proteome_fasta_by_genome_id(
            cls, db_connection: mariadb.Connection, genome_id: int, downloads_base_directory: str
    ) -> GetProteomeFastaData:
        output_file_name: str = f"Proteins_of_genome_{genome_id}.fasta"
        output_file_path: str = os.path.join(downloads_base_directory, output_file_name)
        if os.path.isfile(output_file_path):
            return {
                "output_file_name": output_file_name,
                "output_file_path": output_file_path,
            }
        sequences: Generator[ProteinSequence, None, None] = (
            ProteinSequence.get_sequences_by_genome_id(db_connection, genome_id)
        )
        written_sequence_count: int = cls._create_sequences_fasta_file(
            output_file_path, sequences
        )
        if written_sequence_count < 1:
            raise ValueError(
                f"No protein sequences found for the genome ID {genome_id}"
            )
        return {
            "output_file_name": output_file_name,
            "output_file_path": output_file_path,
        }

    @classmethod
    def _create_sequences_fasta_file(
        cls, path_to_output_file: str, sequences: Generator[ProteinSequence, None, None]
    ) -> int:
        sequence_count: int = 0
        with open(path_to_output_file, "w") as file:
            for sequencia in sequences:
                sequence_count += 1
                header = f">Phy{sequencia.protein_id}_{sequencia.taxid};{sequencia.description}\n"
                file.write(header)
                sequence = sequencia.sequence.upper()
                for i in range(0, len(sequence), 70):
                    file.write(sequence[i : i + 70] + "\n")
                file.write("\n")
        return sequence_count
