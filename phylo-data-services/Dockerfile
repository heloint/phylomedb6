FROM python:3.12

RUN apt-get update && apt-get install -y \
    git \
    gcc \
    g++ \
    make \
    xvfb \
    openssh-client \
    libmariadb-dev \
    libxcb-* \
    libxkbcommon-x11-dev \
    libdbus-1-dev \
    libqt5pdf5 \
    sshpass \
    rsync \
    && rm -rf /var/lib/apt/lists/*

ENV QT_DEBUG_PLUGINS=1

# Install Trimal and it's submodules.
COPY ./external-sources/trimal /trimal
WORKDIR /trimal/source
RUN make
RUN cp -t /usr/bin ./readal ./statal ./trimal

# Install generate_taxonomy_tree_by_taxids CLI tool.
COPY ./external-sources/generate_taxonomy_tree_by_taxids /generate_taxonomy_tree_by_taxids
WORKDIR /generate_taxonomy_tree_by_taxids
RUN make install-editable

# Install get_orthologs_report CLI tool.
COPY ./external-sources/get_orthologs_report /get_orthologs_report
WORKDIR /get_orthologs_report
RUN make install-editable

# Install blast executables
COPY ./external-sources/blast_executables /blast_executables
WORKDIR /blast_executables
RUN cp ./* /usr/bin/

# Install app main dependencies.
COPY ./external-sources/ete /ete
RUN pip install -e /ete
WORKDIR /app
COPY ./app /app
RUN pip install -r requirements.txt

EXPOSE 3000

# Wait for the database to spin everything up, then start the application.
CMD ["sh", "-c", "python3 /app/_scripts/wait_for_development_db.py && uvicorn main:app --host 0.0.0.0 --port 5000 --reload"]

