#!/usr/bin/env python3
import os
from typing import Generator

import mariadb  # type: ignore


class MariadbSession:
    @staticmethod
    def get_connection() -> Generator[mariadb.Connection, None, None]:
        connection: mariadb.Connection = mariadb.Connection(
            host=os.environ["DB_HOST"],
            port=int(os.environ["DB_PORT"]),
            user=os.environ["DB_USER"],
            database=os.environ["DB_DATABASE"],
            password=os.environ["DB_PASS"],
        )
        try:
            yield connection
        finally:
            connection.close()


def get_single_mariadb_connection() -> mariadb.Connection:
    return mariadb.Connection(
        host=os.environ["DB_HOST"],
        port=int(os.environ["DB_PORT"]),
        user=os.environ["DB_USER"],
        database=os.environ["DB_DATABASE"],
        password=os.environ["DB_PASS"],
    )
