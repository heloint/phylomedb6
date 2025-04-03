import os
import tarfile
import pytest
import mariadb
from unittest.mock import patch, MagicMock

from services.trees_download_service import TreesDownloadService
from pathlib import Path


@pytest.fixture
def mock_get_tree_by_phylome_id():
    with patch(
        "models.tree_dao.TreeDAO.get_tree_by_phylome_id"
    ) as mock_get_tree_by_phylome_id:
        yield mock_get_tree_by_phylome_id


def test_get_trees_newick_by_phylome_id(mock_get_tree_by_phylome_id):
    db_connection = MagicMock(mariadb.Connection)
    phylome_id = 4
    phylome_id_padded = f"{phylome_id:04d}"
    downloads_base_directory = "/tmp/downloads_base_directory"
    expected_output_file_name = f"Phylome_{phylome_id_padded}_trees.tar.gz"
    expected_output_file_path = os.path.join(
        downloads_base_directory, expected_output_file_name
    )
    Path(expected_output_file_path).unlink(missing_ok=True)

    mock_seed_protein_id = 123
    mock_newick = "(Phy1745008_559292:0.3222042135,Phy1747686_559292:0.0000020848,(Phy1747684_559292:0.2165957161,Phy1748590_559292:1.4323279573)59:0.0591784857);"
    expected_newick_file_name = f"Phylome_{phylome_id_padded}_{mock_seed_protein_id}.nw"

    mock_get_tree_by_phylome_id.return_value = [
        MagicMock(
            tree_id=10,
            phylome_id=6,
            seed_protein_id=mock_seed_protein_id,
            method="fdsa",
            lk=1.1,
            newick=mock_newick,
        )
    ]

    result = TreesDownloadService.get_trees_newick_by_phylome_id(
        db_connection, phylome_id, downloads_base_directory
    )
    assert result["output_file_name"] == expected_output_file_name
    assert result["output_file_path"] == os.path.join(
        downloads_base_directory, result["output_file_name"]
    )

    with tarfile.open(result["output_file_path"], "r:gz") as tar:
        member = tar.getmember(expected_newick_file_name)
        file = tar.extractfile(member)
        assert file is not None
        content = file.read().decode("utf-8")  # Read and decode
        assert content == mock_newick
