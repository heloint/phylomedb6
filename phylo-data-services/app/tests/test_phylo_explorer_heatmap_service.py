import os
import pytest
from unittest.mock import patch
from services.phylo_explorer_heatmap_service import PhyloExplorerHeatmapJSONService

os.environ["PHYLO_EXPLORER_SQLITE_DB_PATH"] = "/tmp/test.db"

@pytest.fixture
def mock_query_result():
    return (("Phylome1", 1, 100, 200), ("Phylome1", 1, 100, 300))

@pytest.fixture
def mock_queried_tax_ids():
    return [200, 300]

@pytest.fixture
def mock_species_presence_percentages():
    return {1: {200: 0.8, 300: 0.6}}

@pytest.fixture
def service(mock_query_result, mock_queried_tax_ids):
    with patch.dict("os.environ", {"PHYLO_EXPLORER_SQLITE_DB_PATH": "test.db"}):
        with patch.object(PhyloExplorerHeatmapJSONService, "get_species_presence_percentages", return_value={1: {200: 0.8, 300: 0.6}}):
            return PhyloExplorerHeatmapJSONService(mock_query_result, mock_queried_tax_ids)

def test_group_data(mock_query_result, mock_species_presence_percentages):
    service = PhyloExplorerHeatmapJSONService([], [])
    grouped_data = service.group_data(mock_query_result, mock_species_presence_percentages)

    assert len(grouped_data) == 1
    assert grouped_data[0]["phylome"] == "Phylome1"
    assert grouped_data[0]["species"] == [200, 300]
    assert grouped_data[0]["presence_percentages"] == [0.8, 0.6]

def test_restrict_grouped_data():
    service = PhyloExplorerHeatmapJSONService([], [])
    grouped_data = [
        {"phylome": "Phylome1", "species": [200, 300], "presence_percentages": [0.8, 0.6], "id": 1, "seed": 100},
        {"phylome": "Phylome2", "species": [400], "presence_percentages": [0.9], "id": 2, "seed": 100},
    ]
    filtered_data, all_species = service.restrict_grouped_data(grouped_data, [200, 300])

    assert len(filtered_data) == 1
    assert filtered_data[0]["phylome"] == "Phylome1"
    assert all_species == [200, 300]

def test_create_distance_matrix():
    service = PhyloExplorerHeatmapJSONService([], [])
    grouped_data = [
        {"phylome": "Phylome1", "species": [200, 300], "presence_percentages": [0.8, 0.6], "id": 1, "seed": 100},
    ]
    ordered_species = [200, 300]
    matrix = service.create_distance_matrix(grouped_data, ordered_species)

    assert matrix == [[0.8], [0.6]]

