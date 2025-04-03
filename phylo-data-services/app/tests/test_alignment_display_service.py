from pathlib import Path
from services.alignment_display_service import AlignmentDisplayService

CURRENT_DIRECTORY = Path(__file__).parent
DATA_DIRECTORY = CURRENT_DIRECTORY / "data"

def test_decompress_db_blob():
    alignment_file = DATA_DIRECTORY / "data_alignment_bytes.txt"
    alignment_bytes = alignment_file.read_text().encode()
    decompressed_alignment_file = DATA_DIRECTORY / "data_decompressed_alignment_bytes.txt"
    expected_decompressed_alignment_bytes = decompressed_alignment_file.read_text().encode()
    decompressed_alignment_bytes = AlignmentDisplayService._decompress_db_blob(alignment_bytes)
    assert expected_decompressed_alignment_bytes == decompressed_alignment_bytes

