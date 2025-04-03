import os
import shutil
from concurrent.futures import ProcessPoolExecutor
from itertools import islice
from pathlib import Path
from subprocess import getstatusoutput
from typing import Iterator
from typing import TypedDict
from uuid import UUID
from uuid import uuid4

import mariadb  # type: ignore
from utils.cluster_operations import ClusterOperations
from utils.debug import timing
from utils.mariadb_connection import get_single_mariadb_connection


class GetBlastDBCmdArgs(TypedDict):
    blast_db_base_directory: str
    genome_id: int


class GenomeSequence(TypedDict):
    genome_id: int
    protein_id: int
    sequence: str


class BlastDBService:

    @classmethod
    @timing
    def generate_blast_databases_for_genomes(
        cls,
    ) -> None:
        print("==> Starting to generate the blast databases.")
        connection = get_single_mariadb_connection()
        cursor = connection.cursor()
        query: str = "SELECT genome_id FROM genomes"
        cursor.execute(query)
        genome_ids: list[int] = [row[0] for row in cursor]

        tmp_blast_db_base_directory: str = "/tmp/tmp_blast_dbs"
        Path(tmp_blast_db_base_directory).mkdir(parents=True, exist_ok=True)

        for id in genome_ids:
            genome_blast_db_dir = os.path.join(tmp_blast_db_base_directory, str(id))
            if os.path.exists(genome_blast_db_dir) and not os.path.isdir(
                genome_blast_db_dir
            ):
                raise FileNotFoundError(f"{genome_blast_db_dir} is not a directory!")
            elif (
                os.path.exists(genome_blast_db_dir)
                and len(os.listdir(genome_blast_db_dir)) > 0
            ):
                cls._check_blast_db_directory_health(genome_blast_db_dir)

        genome_sequence_entries: Iterator[GenomeSequence] = cls.yield_genome_sequences(
            connection
        )
        output_fasta_paths: set[str] = cls.write_genome_sequences(
            genome_sequence_entries, tmp_blast_db_base_directory
        )
        connection.close()

        with ProcessPoolExecutor(max_workers=4) as executor:
            tuple(executor.map(cls.run_makeblastdb_on_genome_fasta, output_fasta_paths))

        blastp_binary_source_path: str = "/usr/bin/blastp"
        os.chmod(blastp_binary_source_path, 0o777)
        shutil.copy(blastp_binary_source_path, tmp_blast_db_base_directory)

        # Here we want to make sure that we have the trailing "/" character in the end of the paths.
        # Internally ClusterOperations uses rsync for the remote transfers,
        # and in this case we want to copy the contents inside the tmp directory into the remote directory.
        # E.G.: /tmp/tmp_blast_dbs + / AND /gpfs/projects/bsc40/project/pipelines/phylomedb6-reconstruction/blast_dbs + /
        ClusterOperations.copy_to_remote(
            f'{tmp_blast_db_base_directory.rstrip("/")}/',
            f'{os.environ["CLUSTER_BLAST_DB_PATH"].rstrip("/")}/',
        )
        shutil.rmtree(tmp_blast_db_base_directory)
        print("==> Finished to generate the blast databases.")

    @classmethod
    def _check_blast_db_directory_health(cls, blast_db_directory_path: str) -> None:
        extensions_to_check: tuple[str, ...] = (
            ".fasta",
            ".pdb",
            ".phr",
            ".pin",
            ".pjs",
            ".pot",
            ".psq",
            ".ptf",
            ".pto",
        )
        correct_files: list[str] = []
        directory_contents: list[str] = os.listdir(blast_db_directory_path)
        directory_contents_absolute_paths = [
            os.path.join(blast_db_directory_path, content)
            for content in directory_contents
        ]
        for content in directory_contents_absolute_paths:
            if content.endswith(extensions_to_check) and os.path.isfile(content):
                correct_files.append(content)
        if len(correct_files) != len(extensions_to_check):
            # TODO: Handle here the incorrect
            raise ValueError(
                f"Length of found correct files does not match with "
                "the number of extensions to check! "
                f"LENGTH DIFF: correct_files: {len(correct_files)};"
                f" extensions_to_check: {len(extensions_to_check)}"
            )

    @classmethod
    def yield_genome_sequences(
        cls,
        connection: mariadb.Connection,
    ) -> Iterator[GenomeSequence]:
        cursor = connection.cursor(dictionary=True)
        query: str = """\
            SELECT
                genomes.genome_id,
                protein_sequences.protein_id,
                protein_sequences.sequence
            FROM protein_sequences
            JOIN proteins
            ON (protein_sequences.protein_id = proteins.protein_id)
            JOIN genes
            ON(proteins.gene_id = genes.gene_id)
            JOIN genomes
            ON (genes.genome_id = genomes.genome_id)
            ORDER BY genomes.genome_id;

    """
        cursor.execute(query)
        yield from cursor

    @classmethod
    def write_genome_sequences(
        cls,
        genome_sequence_entries: Iterator[GenomeSequence],
        blast_db_base_directory: str,
        batch_size: int = 20,
    ) -> set[str]:
        output_file_paths: set[str] = set()
        file_handlers = {}

        for entry in genome_sequence_entries:
            genome_id = entry["genome_id"]
            genome_blast_db_dir = os.path.join(blast_db_base_directory, str(genome_id))

            if os.path.exists(genome_blast_db_dir) and not os.path.isdir(
                genome_blast_db_dir
            ):
                raise FileNotFoundError(f"{genome_blast_db_dir} is not a directory!")

            os.makedirs(genome_blast_db_dir, exist_ok=True)

            output_file_path = os.path.join(
                genome_blast_db_dir, f"genome_{genome_id}_sequences.fasta"
            )
            output_file_paths.add(output_file_path)

            if output_file_path not in file_handlers:
                file_handlers[output_file_path] = open(output_file_path, "w")

        try:
            while True:
                batch = list(islice(genome_sequence_entries, batch_size))
                if not batch:
                    break

                # Write batch entries
                for entry in batch:
                    genome_id = entry["genome_id"]
                    output_file_path = os.path.join(
                        blast_db_base_directory,
                        str(genome_id),
                        f"genome_{genome_id}_sequences.fasta",
                    )

                    fasta_entry = (
                        f'>genome_{genome_id};protein_{entry["protein_id"]}\n'
                        f'{entry["sequence"]}\n\n'
                    )
                    file_handlers[output_file_path].write(fasta_entry)
        finally:
            for file in file_handlers.values():
                file.close()

        return output_file_paths

    @classmethod
    def run_makeblastdb_on_genome_fasta(cls, genome_fasta_path: str) -> None:
        uuid: UUID = uuid4()
        if (
            not os.path.isfile(genome_fasta_path)
            or not os.path.getsize(genome_fasta_path) > 0
        ):
            return

        exit_code, output = getstatusoutput(
            f"makeblastdb -in {genome_fasta_path} -dbtype 'prot' -title {uuid}"
        )
        if exit_code != 0:
            raise ChildProcessError(output)
