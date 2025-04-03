import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from services.sequence_search_service import SequenceSearchService
import mariadb


# Test for submit_blast_protein_search method
@pytest.fixture
def mock_cluster_operations():
    with patch(
        "utils.cluster_operations.ClusterOperations.exec_remote_cmd"
    ) as mock_exec_remote_cmd, patch(
        "utils.cluster_operations.ClusterOperations.write_file_to_remote"
    ) as mock_write_file_to_remote:
        yield mock_exec_remote_cmd, mock_write_file_to_remote


# Test for get_search_result when the job is still running
@pytest.fixture
def mock_get_protein_results():
    with patch(
        "models.sequence_search_dao.SequenceSearchDAO.get_protein_results_by_protein_ids"
    ) as mock_get_protein_results:
        yield mock_get_protein_results


def test_submit_blast_protein_search(mock_cluster_operations):
    mock_exec_remote_cmd, mock_write_file_to_remote = mock_cluster_operations
    mock_exec_remote_cmd.return_value = "Submitted batch job 12345"
    mock_write_file_to_remote.return_value = None
    ssh_working_directory = "/test/working/dir"
    query_sequence = "ATGCATGCATGC"
    result = SequenceSearchService.submit_blast_protein_search(
        ssh_working_directory, query_sequence
    )

    # Assert the correct response is returned
    assert result.submitted_job_id == 12345
    assert isinstance(result.directory_uuid, str)

    # Ensure the mocked methods were called
    mock_exec_remote_cmd.assert_called_with(
        f"sbatch /test/working/dir/query_jobs/{result.directory_uuid}/query_job.sh"
    )


@pytest.fixture
def mock_cluster_operations_for_running():
    with patch(
        "utils.cluster_operations.ClusterOperations.exec_remote_cmd"
    ) as mock_exec_remote_cmd:
        yield mock_exec_remote_cmd


def test_get_search_result_running(
    mock_get_protein_results, mock_cluster_operations_for_running
):
    mock_cluster_operations_for_running.side_effect = [
        "",  # squeue (job is running)
        "test_output_dir/final_query_result.tsv",  # result file exists
    ]
    mock_get_protein_results.return_value = []
    db_connection = MagicMock(mariadb.Connection)
    submitted_job_id = 12345
    job_directory_uuid = "uuid_test"
    ssh_working_directory = "/test/working/dir"
    result = SequenceSearchService.get_search_result(
        db_connection, submitted_job_id, job_directory_uuid, ssh_working_directory
    )
    assert isinstance(result, JSONResponse)
    assert result.status_code == 202
    assert (
        "Your request is being processed"
        in json.loads(result.__dict__["body"].decode())["message"]
    )


# Test for get_search_result when the job is completed
def test_get_search_result_completed(
    mock_get_protein_results, mock_cluster_operations_for_running
):
    # Mock the behavior when the job is completed
    mock_cluster_operations_for_running.side_effect = [
        "",  # squeue (job is not running)
        "test_output_dir/final_query_result.tsv",  # result file exists
        "protein_id_1\tquery_sequence_1\t99.5\tother_columns",  # mock TSV content
    ]
    mock_get_protein_results.return_value = [
        MagicMock(
            protein_id=1,
            external_protein_id="protein_1",
            external_genome_id="genome_1",
            taxonomy_id=1,
            species_name="species_1",
            description="desc_1",
        )
    ]
    db_connection = MagicMock(mariadb.Connection)
    submitted_job_id = 12345
    job_directory_uuid = "uuid_test"
    ssh_working_directory = "/test/working/dir"
    result = SequenceSearchService.get_search_result(
        db_connection, submitted_job_id, job_directory_uuid, ssh_working_directory
    )
    assert isinstance(result, JSONResponse)
    message = json.loads(result.__dict__["body"])["message"]
    assert message in ["Your request is being processed. Check back later."]


# Test for get_search_result when the directory is not found
def test_get_search_result_directory_not_found(mock_cluster_operations_for_running):
    # Mock the behavior for directory not found
    mock_cluster_operations_for_running.side_effect = ChildProcessError
    db_connection = MagicMock(mariadb.Connection)
    submitted_job_id = 12345
    job_directory_uuid = "uuid_test"
    ssh_working_directory = "/test/working/dir"
    with pytest.raises(HTTPException) as context:
        SequenceSearchService.get_search_result(
            db_connection, submitted_job_id, job_directory_uuid, ssh_working_directory
        )
    assert context.value.status_code == 404
    assert "Could not find the initialized job directory" in str(context.value.detail)


# Test for get_search_result when the result file is not found
def test_get_search_result_file_not_found(mock_cluster_operations_for_running):
    # Mock the behavior for file not found
    mock_cluster_operations_for_running.side_effect = [
        "",  # squeue (job is not running)
        ChildProcessError,  # result file doesn't exist
    ]
    db_connection = MagicMock(mariadb.Connection)
    submitted_job_id = 12345
    job_directory_uuid = "uuid_test"
    ssh_working_directory = "/test/working/dir"

    # Call the method and assert exception is raised
    with pytest.raises(HTTPException) as context:
        SequenceSearchService.get_search_result(
            db_connection, submitted_job_id, job_directory_uuid, ssh_working_directory
        )
    assert context.value.status_code == 404
    assert "Could not find the initialized job directory." in str(context.value.detail)
