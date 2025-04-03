import pytest
import os

@pytest.fixture(scope="module")
def set_up_env(monkeypatch):
    monkeypatch.setenv("NEXT_PUBLIC_BASE_URL","http://localhost:3050")
    monkeypatch.setenv("PHYLO_EXPLORER_SQLITE_DB_PATH","./phylo_explorer.db")
    monkeypatch.setenv("DB_USER","root")
    monkeypatch.setenv("DB_PASS","test")
    monkeypatch.setenv("DB_HOST","phylomedb6-db")
    monkeypatch.setenv("DB_PORT","3306")
    monkeypatch.setenv("DB_DATABASE","phylomedb6")
    monkeypatch.setenv("CLUSTER_USER","")
    monkeypatch.setenv("CLUSTER_HOST","")
    monkeypatch.setenv("CLUSTER_PASS","")
    monkeypatch.setenv("CLUSTER_TRANFER_HOST","")
    monkeypatch.setenv("CLUSTER_BLAST_DB_PATH","")
    monkeypatch.setenv("EMAIL_USER","")
    monkeypatch.setenv("EMAIL_PASS","")
    monkeypatch.setenv("EMAIL_USER_ADMIN","")
    monkeypatch.setenv("FULLNAME_USER_ADMIN","")
    yield
