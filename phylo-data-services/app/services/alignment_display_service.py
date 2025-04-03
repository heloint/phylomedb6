#!/usr/bin/env python3

import mariadb  # type: ignore
import binascii
import subprocess
import tempfile
from uuid import uuid4
import zlib
from functools import lru_cache

from models.tree_alignment_dao import TreeAlignment


class AlignmentDisplayService:
    @classmethod
    def get_tree_alignment_html(
        cls, db_connection: mariadb.Connection, tree_id: int, alignment_type: str
    ) -> str:
        if alignment_type not in ["raw", "clean"]:
            raise ValueError(
                f"Not a valid alignment type in URL: {alignment_type}."
                "Only can be used 'raw' or 'clean'!"
            )
        found_alignments = TreeAlignment.get_by_tree_id(db_connection, tree_id)
        filtered_alignments: list[TreeAlignment] = [
            alignment
            for alignment in found_alignments
            if alignment.alignment_type == alignment_type
        ]
        if len(filtered_alignments) != 1:
            raise ValueError(f"Inconsistent alignment types for tree_id: {tree_id}")
        target_alignment: TreeAlignment = filtered_alignments[0]
        alternative_alignment_type: str = "raw"
        if alignment_type == "raw":
            alternative_alignment_type = "clean"
        html_content: str = f"""\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Table</title>
    <link rel="stylesheet" href="/static/css/alignment-style.css">
</head>
<body>
    <div class="alignment-header-container">
        <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>phylome_id</th>
                    <th>sequence_number</th>
                    <th>residues_number</th>
                    <th>alignment_type</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{target_alignment.phylome_id}</td>
                    <td>{target_alignment.seqs_numb}</td>
                    <td>{target_alignment.residues_numb}</td>
                    <td>{target_alignment.alignment_type}</td>
                </tr>
            </tbody>
        </table>
        <a href="/ete-smartview/alignment/{tree_id}/{alternative_alignment_type}">
            <button class="default-btn">{alternative_alignment_type.capitalize()} alignment for tree {tree_id}</button>
        </a>
        </div>
    </div>
    <div class="alignment-container">
    {cls._get_alignment_html(target_alignment.alignment)}
    </div>
</body>
</html>
"""
        return html_content

    @classmethod
    @lru_cache(maxsize=128)
    def _get_alignment_html(cls, alignment: bytes) -> str:
        uuid: str = str(uuid4())
        decompressed_alignment: bytes = cls._decompress_db_blob(alignment)
        with tempfile.NamedTemporaryFile(
            dir="/tmp", suffix=f"-{uuid}", delete=True
        ) as tmp_alg_file:
            tmp_alg_file.write(decompressed_alignment)
            tmp_alg_file.flush()
            readal_html_convert_cmd: str = f"readal -html -in {tmp_alg_file.name}"
            html: str = subprocess.getoutput(readal_html_convert_cmd)
            return html

    @classmethod
    def _decompress_db_blob(cls, blob: bytes) -> bytes:
        decompressor = zlib.decompressobj()
        unhexed_blob: bytes = binascii.unhexlify(blob)
        decompressed_blob: bytes = decompressor.decompress(unhexed_blob)
        return decompressed_blob
