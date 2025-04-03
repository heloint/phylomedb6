#!/usr/bin/env python3
import os
import time

import mariadb  # type: ignore


def check_database():
    """Check the database connection and return True if ready, else False."""
    try:
        connection = mariadb.connect(
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASS"],
            host=os.environ["DB_HOST"],
            port=int(os.environ["DB_PORT"]),
            database=os.environ["DB_DATABASE"],
        )
        if not connection:
            return False

        cursor = connection.cursor()
        cursor.execute("SHOW TABLES;")
        results = cursor.fetchall()
        if len(results) < 1:
            raise Exception("Database is empty!")
        print(f"==> Database tables: {results}")
        print(
            f"==> Database: [{os.environ['DB_DATABASE']}] is ready to receive connection!"
        )
        connection.close()
        return True
    except Exception as e:
        print(f"==> [WARNING] Database check failed: {e}")
        return False


def main():
    retry_time_gap = 5 * 1000  # 5 seconds in milliseconds
    timeout_limit = 60 * 60 * 1000  # 1 hour in milliseconds
    start_time = time.time() * 1000  # Current time in milliseconds
    retry_count = 0

    while not check_database():
        elapsed_time = time.time() * 1000 - start_time
        if elapsed_time > timeout_limit:
            raise Exception(
                f"==> [ERROR] Database is taking too long to connect. Timeout Limit: {timeout_limit} ms!"
            )
        retry_count += 1
        print(
            f"==> Database connection retry: {retry_count} in {retry_time_gap} ms ..."
        )
        time.sleep(retry_time_gap / 1000)


if __name__ == "__main__":
    main()
