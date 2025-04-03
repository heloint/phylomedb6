#!/usr/bin/env python3

import os
import subprocess
from typing import TypedDict


class GetOrthologsReportOutputData(TypedDict):
    output_file_path: str
    output_file_name: str


class OrthologsDownloadService:
    @classmethod
    def get_orthologs_report_by_phylome_id(
        cls, phylome_id: int, downloads_base_directory: str
    ) -> GetOrthologsReportOutputData:
        output_file_name: str = f"phylome_{phylome_id}_orthologs.txt.gz"
        output_file_path: str = os.path.join(downloads_base_directory, output_file_name)
        if os.path.exists(output_file_path) and os.path.isfile(output_file_path):
            return {
                "output_file_name": output_file_name,
                "output_file_path": output_file_path,
            }
        cls._run_orthologs_report_generator(
            db_host=os.environ["DB_HOST"],
            db_port=int(os.environ["DB_PORT"]),
            db_user=os.environ["DB_USER"],
            db_name=os.environ["DB_DATABASE"],
            db_pass=os.environ["DB_PASS"],
            phylome_id=phylome_id,
            output_file_path=output_file_path,
            tmp_directory_path="/tmp",
        )
        if not os.path.exists(output_file_path) or not os.path.isfile(output_file_path):
            raise FileNotFoundError(
                f"File {output_file_name} on path "
                f"{output_file_path} doesn't exists or is not a file."
            )
        return {
            "output_file_name": output_file_name,
            "output_file_path": output_file_path,
        }

    @classmethod
    def _run_orthologs_report_generator(
        cls,
        db_user: str,
        db_host: str,
        db_pass: str,
        db_name: str,
        db_port: int,
        phylome_id: int,
        output_file_path: str,
        tmp_directory_path: str,
    ) -> None:
        cmd: tuple[str, ...] = (
            "get_orthologs_report",
            "--db_user",
            db_user,
            "--db_host",
            db_host,
            "--db_pass",
            db_pass,
            "--db_name",
            db_name,
            "--db_port",
            str(db_port),
            "--phylome_id",
            str(phylome_id),
            "--output_file_path",
            output_file_path,
            "--tmp_directory_path",
            tmp_directory_path,
        )
        launched_job: subprocess.CompletedProcess[str] = subprocess.run(
            " ".join(cmd),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            shell=True,
        )

        if launched_job.returncode != 0:
            raise RuntimeError(
                f"Failed to run the following command: {cmd}\n{launched_job.stderr}"
            )
