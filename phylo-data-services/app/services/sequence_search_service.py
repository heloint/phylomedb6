#!/usr/bin/env python3
from __future__ import annotations

import re
import uuid
from typing import Iterator, TypedDict

import mariadb  # type: ignore
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from utils.cluster_operations import ClusterOperations

from models.sequence_search_dao import SequenceSearchDAO


class SequenceSearchSubmitResult(BaseModel):
    submitted_job_id: int
    directory_uuid: str


class BlastResultDetails(TypedDict):
    similarity_percentage: float
    e_value: str
    bitscore: float


class SequenceBlastResults(BaseModel):
    protein_id: int
    external_protein_id: str
    external_genome_id: str
    taxonomy_id: int
    species_name: str
    description: str
    similarity_percentage: float
    e_value: str
    bitscore: float


class SequenceSearchService:
    @staticmethod
    def submit_blast_protein_search(
        ssh_working_directory: str,
        query_sequence: str,
    ) -> SequenceSearchSubmitResult:
        uuid_val: str = str(uuid.uuid4())
        output_dir: str = f"{ssh_working_directory}/query_jobs/{uuid_val}"
        sbatch_file_path: str = f"{output_dir}/query_job.sh"
        query_fasta_path: str = f"{output_dir}/query_seq.fasta"
        cmds_file_path: str = f"{output_dir}/cmds.txt"

        sbatch_file_content: str = f"""\
#!/bin/bash

#SBATCH --job-name=phydb6_seq_query_blast
#SBATCH --output={output_dir}/phydb6_seq_query_blast_%j.out
#SBATCH --error={output_dir}/phydb6_seq_query_blast_%j.err
#SBATCH --account=bsc40
#SBATCH --cpus-per-task=48
#SBATCH --qos=gp_bscls
#SBATCH --time=00:05:00

mkdir -p {output_dir}

echo "\
>protein_search_query_{uuid.uuid4()}
{query_sequence}
" > {query_fasta_path}

for db_fasta_path in $(find {ssh_working_directory} -type f -iname "genome_*_sequences.fasta"); do
    path_basename=$(basename $db_fasta_path);
    result_file_name=$path_basename.result.tsv;
    result_file_path={output_dir}/$result_file_name;
    echo "{ssh_working_directory}/blastp -task \"blastp-fast\" -query {query_fasta_path} -db $db_fasta_path -out $result_file_path -evalue 0.001 -max_target_seqs 30 -max_hsps 1 -dbsize 10000000 -outfmt 7" >> {cmds_file_path};
done

module load parallel
parallel -j 48 < {cmds_file_path}
cat {output_dir}/*.tsv \
    | grep -v "#" \
    | sort -t$'\t' -g -k12,12 -r \
    | head -n 15 \
> {output_dir}/final_query_result.tsv
"""
        # Write the Bash script to the remote server
        ClusterOperations.exec_remote_cmd(
            f"mkdir -p {output_dir}; chmod -R 775 {output_dir}"
        )
        ClusterOperations.write_file_to_remote(
            remote_file_path=sbatch_file_path, content_to_write=sbatch_file_content
        )
        ClusterOperations.exec_remote_cmd(f"chmod -R 755 {sbatch_file_path}")
        stdout_content = ClusterOperations.exec_remote_cmd(
            f"sbatch {sbatch_file_path}"
        ).strip()
        batch_job_id_regexp = re.compile(r".*Submitted batch job (\d+)")
        launched_job_id: int = int(batch_job_id_regexp.findall(stdout_content)[0])
        return SequenceSearchSubmitResult(
            submitted_job_id=launched_job_id, directory_uuid=uuid_val
        )

    @staticmethod
    def get_search_result(
        db_connection: mariadb.Connection,
        submitted_job_id: int,
        job_directory_uuid: str,
        ssh_working_directory: str,
    ) -> JSONResponse | list[SequenceBlastResults]:
        """
        Tries to retrieve the results from the previous submitted blast query in the cluster.
        - If the job is still running, then returns 202 http response, indicating that it is still running.
        - If the directory is not found by the given UUID, then it throws HTTPException with 404 code.
        - If succeeds, then returns the results as an array of 'SequenceSearchDAO' objects.
        """
        output_dir: str = f"{ssh_working_directory}/query_jobs/{job_directory_uuid}"
        result_file: str = f"{output_dir}/final_query_result.tsv"
        try:
            stdout_content = ClusterOperations.exec_remote_cmd(
                f"ls {output_dir}"
            ).strip()
        except ChildProcessError:
            raise HTTPException(
                status_code=404, detail=f"Could not find the initialized job directory."
            )

        # is running? if yes, return empty
        try:
            stdout_content = ClusterOperations.exec_remote_cmd(
                f"squeue | grep -E '^\\s+{submitted_job_id}'"
            ).strip()
            if stdout_content != "":
                return JSONResponse(
                    status_code=202,  # HTTP 202 Accepted
                    content={
                        "status": "processing",
                        "message": "Your request is being processed. Check back later.",
                    },
                )
        except ChildProcessError:
            raise HTTPException(
                status_code=404, detail=f"Could not find the initialized job directory."
            )

        # final result file exists? if not http error
        try:
            stdout_content = ClusterOperations.exec_remote_cmd(
                f"ls {result_file}"
            ).strip()
        except ChildProcessError:
            raise HTTPException(
                status_code=404,
                detail=f"Could not find job data with UUID: {job_directory_uuid}",
            )

        # parse final rsult fil tsv
        try:
            stdout_content = ClusterOperations.exec_remote_cmd(
                f"cat {result_file}"
            ).strip()
        except ChildProcessError:
            raise HTTPException(
                status_code=404,
                detail=f"Could not read job data with UUID: {job_directory_uuid}",
            )

        result_lines: list[str] = stdout_content.splitlines()
        result_columns: Iterator[list[str]] = map(lambda x: x.split("\t"), result_lines)
        blast_details_by_protein_ids: dict[int, BlastResultDetails] = {
            int(line[1].strip().split("_")[-1]): {
                "similarity_percentage": float(line[2]),
                "e_value": line[10],
                "bitscore": float(line[11]),
            }
            for line in result_columns
        }
        db_results: list[SequenceSearchDAO] = list(
            SequenceSearchDAO.get_protein_results_by_protein_ids(
                db_connection, list(blast_details_by_protein_ids.keys())
            )
        )
        results: list[SequenceBlastResults] = [
            SequenceBlastResults(
                protein_id=entry.protein_id,
                external_protein_id=entry.external_protein_id,
                external_genome_id=entry.external_genome_id,
                taxonomy_id=entry.taxonomy_id,
                species_name=entry.species_name,
                description=entry.description,
                similarity_percentage=blast_details_by_protein_ids[entry.protein_id][
                    "similarity_percentage"
                ],
                e_value=blast_details_by_protein_ids[entry.protein_id]["e_value"],
                bitscore=blast_details_by_protein_ids[entry.protein_id]["bitscore"],
            )
            for entry in db_results
        ]

        return results
