#!/usr/bin/env python3

import os
from dataclasses import dataclass
from pathlib import Path
from subprocess import getstatusoutput
from uuid import uuid4


@dataclass
class ClusterOperations:
    _banner_separator: str = "==> this is THE separator line <=="
    _tmp_cmd_dir: Path = Path("/tmp")

    @classmethod
    def exec_remote_cmd(
        cls,
        remote_cmd: str,
        cluster_user: str | None = None,
        cluster_host: str | None = None,
        cluster_pass: str | None = None,
    ) -> str:
        if cluster_user is None:
            cluster_user = os.environ["CLUSTER_USER"]
        if cluster_host is None:
            cluster_host = os.environ["CLUSTER_HOST"]
        if cluster_pass is None:
            cluster_pass = os.environ["CLUSTER_PASS"]
        cls._tmp_cmd_dir.mkdir(exist_ok=True, parents=True)
        tmp_cmd_file: Path = cls._tmp_cmd_dir / f"tmp_ssh_cmd_{str(uuid4())}"
        banner_separator_print_cmd: str = f"echo '{cls._banner_separator}'; "
        tmp_cmd_file.write_text(banner_separator_print_cmd + remote_cmd)
        ssh_cmd: str = (
            f'sshpass -p "{cluster_pass}" '  # Give the password
            f"ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null {cluster_user}@{cluster_host} "
            f"-T < {str(tmp_cmd_file)}"  # Execute commands from the tmp command file.
        )
        exit_code, output = getstatusoutput(ssh_cmd)
        trimmed_output = output.split(cls._banner_separator)[-1].strip()
        if exit_code != 0 and trimmed_output != "":
            raise ChildProcessError(trimmed_output)
        tmp_cmd_file.unlink(missing_ok=True)
        return trimmed_output

    @classmethod
    def copy_from_remote(
        cls,
        remote_path: str,
        local_path: str,
        cluster_user: str | None = None,
        cluster_host: str | None = None,
        cluster_pass: str | None = None,
    ) -> None:
        if cluster_user is None:
            cluster_user = os.environ["CLUSTER_USER"]
        if cluster_host is None:
            cluster_host = os.environ["CLUSTER_HOST"]
        if cluster_pass is None:
            cluster_pass = os.environ["CLUSTER_PASS"]
        rsync_command: str = (
            f'sshpass -p "{cluster_pass}" '
            f'rsync -vaq -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"'
            f"{cluster_user}@{cluster_host}:{remote_path} {local_path}"
        )
        exit_code, output = getstatusoutput(rsync_command)
        if exit_code != 0:
            raise ChildProcessError(output)

    @classmethod
    def copy_to_remote(
        cls,
        local_path: str,
        remote_path: str,
        cluster_user: str | None = None,
        cluster_host: str | None = None,
        cluster_pass: str | None = None,
    ) -> None:
        if cluster_user is None:
            cluster_user = os.environ["CLUSTER_USER"]
        if cluster_host is None:
            cluster_host = os.environ["CLUSTER_HOST"]
        if cluster_pass is None:
            cluster_pass = os.environ["CLUSTER_PASS"]
        rsync_command: str = (
            f'sshpass -p "{cluster_pass}" rsync --omit-dir-times --no-perms --chmod 775 -vaq -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"'
            f" {local_path} {cluster_user}@{cluster_host}:{remote_path}"
        )
        exit_code, output = getstatusoutput(rsync_command)
        if exit_code != 0:
            raise ChildProcessError(output)

    @classmethod
    def write_file_to_remote(
        cls,
        remote_file_path: str,
        content_to_write: str,
    ) -> None:

        tmp_file_path: Path = cls._tmp_cmd_dir / f"tmp_file_to_write_{str(uuid4())}"
        tmp_file_path.write_text(content_to_write.rstrip("\n".rstrip("\n")) + "\n")
        cls.copy_to_remote(local_path=str(tmp_file_path), remote_path=remote_file_path)
        tmp_file_path.unlink(missing_ok=True)
