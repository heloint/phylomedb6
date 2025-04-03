.PHONY: run-dummy run-dummy-get-orthologs-report

install:
	pip install .
	@rm -rf *.egg-info
	@rm -rf build

install-editable:
	@rm -rf build
	@rm -rf *.egg-info
	pip install -e .

uninstall:
	pip uninstall get_orthologs_report
	@rm -rf *.egg-info
	@rm -rf build

run-dummy:
	python3 -m get_orthologs_report \
		--db_user "root"\
		--db_host "0.0.0.0" \
		--db_pass "test" \
		--db_name "phylomedb6" \
		--db_port 5000 \
		--phylome_id 1 \
		--output_file_path ./out/orthologs.txt.gz \
		--tmp_directory_path "/tmp"

