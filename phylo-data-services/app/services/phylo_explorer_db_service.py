#!/usr/bin/env python3

from __future__ import annotations

import os
import sqlite3
from typing import Iterator, TypedDict
from decimal import Decimal
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from itertools import chain, batched
from hashlib import md5

from utils.mariadb_connection import get_single_mariadb_connection


class OccurencePercentageRow(TypedDict):
    phylome_id: int
    taxid: int
    occurence_percentage: Decimal


class PhyloExplorerDBService:
    @classmethod
    def generate_phylo_explorer_db(
        cls,
        sqlite_db_path: str | None = None,
    ) -> None:
        print("==> Starting to generate the phylo-explorer sqlite database.")
        if sqlite_db_path is None:
            sqlite_db_path = os.environ["PHYLO_EXPLORER_SQLITE_DB_PATH"]
        sqlite_db: Path = Path(sqlite_db_path)
        if sqlite_db.exists() and cls._is_db_up_to_date(sqlite_db_path):
            return
        sqlite_db.unlink(missing_ok=True)
        sqlite_conn = sqlite3.connect(sqlite_db_path)
        cls.create_table_phylome_data(sqlite_conn)
        data: Iterator[OccurencePercentageRow] = (
            cls.fetch_occurence_percentages_by_all_phylomes()
        )
        cls.register_phylome_percentages(sqlite_conn, data)
        sqlite_conn.close()
        print("==> Finished to generate the phylo-explorer sqlite database.")

    @classmethod
    def _is_db_up_to_date(cls, sqlite_db_path: str) -> bool:
        sqlite_conn = sqlite3.connect(sqlite_db_path)
        sqlite_curr = sqlite_conn.cursor()
        sqlite_curr.execute(
            "SELECT DISTINCT phylome_id FROM phylome_data ORDER BY phylome_id"
        )
        sqlite_phylome_ids: bytes = str(tuple(row[0] for row in sqlite_curr)).encode(
            "utf-8"
        )
        sqlite_md5_hash: str = md5(sqlite_phylome_ids).hexdigest()
        mariadb_conn = get_single_mariadb_connection()
        mariadb_curr = mariadb_conn.cursor()
        mariadb_curr.execute("SELECT phylome_id FROM phylomes ORDER BY phylome_id;")
        mariadb_phylome_ids: bytes = str(tuple(row[0] for row in mariadb_curr)).encode(
            "utf-8"
        )
        mariadb_md5_hash: str = md5(mariadb_phylome_ids).hexdigest()
        return sqlite_md5_hash == mariadb_md5_hash

    @classmethod
    def create_table_phylome_data(cls, conn: sqlite3.Connection) -> None:
        """
        This function creates table of phylome_data
        """
        cursor: sqlite3.Cursor = conn.cursor()
        create_table_statement: str = """\
            CREATE TABLE IF NOT EXISTS phylome_data (
                phylome_id INTEGER,
                taxid INTEGER,
                ocurrence_percentage REAL
            )
        """
        cursor.execute(create_table_statement)
        create_phylome_id_idx_statement: str = """\
            CREATE INDEX phylome_id_idx ON phylome_data(phylome_id);
        """
        cursor.execute(create_phylome_id_idx_statement)
        create_taxid_idx_statement: str = """\
            CREATE INDEX taxid_idx ON phylome_data(taxid);
        """
        cursor.execute(create_taxid_idx_statement)
        create_phylome_id_taxid_idx_statement: str = """\
            CREATE INDEX phylome_id_taxid_idx ON phylome_data(phylome_id,taxid);
        """
        cursor.execute(create_phylome_id_taxid_idx_statement)
        conn.commit()

    @classmethod
    def fetch_occurence_percentages_by_all_phylomes(
        cls,
    ) -> Iterator[OccurencePercentageRow]:
        all_phylome_ids: tuple[int, ...] = cls._get_all_phylome_ids()
        with ThreadPoolExecutor(max_workers=4) as executor:
            yield from chain.from_iterable(
                executor.map(
                    cls._fetch_occurence_percentage_by_phylome_id, all_phylome_ids
                )
            )

    @classmethod
    def _get_all_phylome_ids(
        cls,
    ) -> tuple[int, ...]:
        conn = get_single_mariadb_connection()
        curr = conn.cursor(dictionary=True)
        curr.execute("SELECT phylome_id FROM phylomes;")
        return tuple(row["phylome_id"] for row in curr)

    @classmethod
    def _fetch_occurence_percentage_by_phylome_id(
        cls,
        phylome_id: int,
    ) -> Iterator[OccurencePercentageRow]:
        conn = get_single_mariadb_connection()
        curr = conn.cursor(dictionary=True)
        curr.execute(
            """\
            WITH taxids_by_trees AS (
                SELECT
                    tree_contents.phylome_id,
                    tree_contents.seed_protein_id,
                    species.taxid
                FROM tree_contents
                JOIN proteins
                ON (tree_contents.target_protein_id=proteins.protein_id)
                JOIN genes
                ON (genes.gene_id = proteins.gene_id)
                JOIN genomes
                ON (genomes.genome_id = genes.genome_id)
                JOIN species
                ON (genomes.taxid=species.taxid)
                WHERE tree_contents.phylome_id = ?
                GROUP BY tree_contents.phylome_id, tree_contents.seed_protein_id, species.taxid
            ),
            total_tree_count AS (
                SELECT COUNT(DISTINCT seed_protein_id) AS trees_count FROM taxids_by_trees
            )
            SELECT
                phylome_id,
                taxid,
                COUNT(taxid) * 100.0 / (SELECT trees_count FROM total_tree_count LIMIT 1) AS occurence_percentage
                FROM taxids_by_trees GROUP BY taxid;
    """,
            (phylome_id,),
        )
        for row in curr:
            row["occurence_percentage"] = int(row["occurence_percentage"])
            yield row

    @classmethod
    def register_phylome_percentages(
        cls,
        sqlite_conn: sqlite3.Connection,
        args: Iterator[OccurencePercentageRow],
    ) -> None:
        curr = sqlite_conn.cursor()
        for batch in batched(args, 100):
            query = "INSERT INTO phylome_data (phylome_id, taxid, ocurrence_percentage) VALUES (:phylome_id, :taxid, :occurence_percentage)"
            curr.executemany(query, batch)
            sqlite_conn.commit()
