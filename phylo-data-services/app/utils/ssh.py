#!/usr/bin/env python3
import os
from typing import Generator

import paramiko


class SSHSession:
    @staticmethod
    def get_connection() -> Generator[paramiko.SSHClient, None, None]:
        ssh_user: str = os.environ["CLUSTER_USER"]
        ssh_pass: str = os.environ["CLUSTER_PASS"]
        ssh_host: str = os.environ["CLUSTER_HOST"]

        connection = paramiko.SSHClient()
        connection.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        connection.connect(hostname=ssh_host, username=ssh_user, password=ssh_pass)

        try:
            yield connection
        finally:
            connection.close()
