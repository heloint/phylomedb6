from __future__ import annotations

import argparse
import gzip
import os
import sqlite3
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Iterator, Sequence, TypedDict

import mariadb  # type: ignore
import numpy
from ete3 import NCBITaxa  # type: ignore
from ete3 import PhyloTree  # type: ignore
from ete3.phylo import PhyloNode
from ete3.phylo import EvolEvent  # type: ignore

Pair = str
LK = float
EE = int


@dataclass
class GroupedPhylomeContentResult:
    taxids: list[int]
    seed_taxid: int


class SeedLineage(TypedDict):
    seed_lineage: list[int]
    seed_lineage_idx: int


class PhylomeContentTaxidRow(TypedDict):
    seed_taxid: int
    taxid: int


class PhylomeNewick(TypedDict):
    newick: str
    lk: float
    method: str
    newick_seed_id: str
    seed_taxid: int


class OrthologsRow(TypedDict):
    p1sp2: str
    seqid: str
    orthologid: str
    CS: float
    trees: int
    co_orthologs: list[str]


@dataclass
class GetOrthologsReportArgs:
    db_user: str
    db_host: str
    db_pass: str
    db_name: str
    db_port: int
    phylome_id: int
    output_file_path: str
    tmp_directory_path: str

    @classmethod
    def get_arguments(
        cls, args: Sequence[str] = sys.argv[1:]
    ) -> GetOrthologsReportArgs:
        parser = argparse.ArgumentParser(
            description=(
                "Creates the orthologs-coorthologs report "
                "from the given phylome in the database of Phylomedb6."
            )
        )
        parser.add_argument(
            "--db_user",
            type=str,
            required=True,
            help=("User to access the Phylomedb6 MariaDB database."),
        )
        parser.add_argument(
            "--db_host",
            type=str,
            required=True,
            help=("Host to access the Phylomedb6 MariaDB database."),
        )
        parser.add_argument(
            "--db_pass",
            type=str,
            required=True,
            help=("Password to access the Phylomedb6 MariaDB database."),
        )
        parser.add_argument(
            "--db_name",
            type=str,
            required=True,
            help=(
                "Database name to be accessed in the Phylomedb6 MariaDB database."
            ),
        )
        parser.add_argument(
            "--db_port",
            type=int,
            default=3306,
            required=True,
            help=("Port to access the Phylomedb6 MariaDB database."),
        )
        parser.add_argument(
            "--phylome_id",
            type=int,
            required=True,
            help=("Phylome ID to target for the orthologs report generation."),
        )
        parser.add_argument(
            "--output_file_path",
            type=str,
            default=os.path.join(".", "out", "orthologs.txt.gz"),
            required=True,
            help=("Output path of the orthologs report."),
        )
        parser.add_argument(
            "--tmp_directory_path",
            type=str,
            default="/tmp",
            required=True,
            help=(
                "Specified directory to use it as a storage for the temporary files."
            ),
        )
        return GetOrthologsReportArgs(**vars(parser.parse_args(args=args)))


def get_topology_difference_count_for_seed_lineage(
    lineages: list[list[int]], seed_lineage: list[int]
) -> dict[int, int]:
    """
    Gets the topology node differences count of the list of lineages compared to the given seed_lineage.

    @param lineages: List of lineages as list of integers.
    @param seed_lineage: List of integers, representing the lineage of the seed to be compared of.
    @returns Dictionary of [taxonomy id, difference count]
    """
    counter: dict[int, int] = {}
    for seed_idx, seed_node in enumerate(seed_lineage):
        for target_idx, target_lineage in enumerate(lineages):
            if target_lineage is None:
                raise ValueError(
                    f"The given lineage on index: {target_idx} has value None"
                )

            target_taxid: int = target_lineage[-1]
            counter.setdefault(target_taxid, 0)
            try:
                target_node: int = target_lineage[seed_idx]
            except IndexError:
                counter[target_taxid] += 1
                continue

            if target_node != seed_node:
                counter[target_taxid] += 1
    counter[seed_lineage[-1]] = 1
    return counter


def get_lineages_for_taxids(taxids: Iterable[int]) -> list[list[int]]:
    """
    Gets the list of lienages for the given taxonomy IDs.

    @param taxids: Iterable of taxonomy IDs as integers to get the lineages of.
    @return lineages: Returns a list of lists of taxonomy IDs of integers,
                      representing the lineage of the given species' taxonomy ID.
    @raises ValueError if could not get the lineage for any of the given taxid.
    """
    ncbi = NCBITaxa()
    lineages: list[list[int] | None] = [
        ncbi.get_lineage(taxid) for taxid in taxids
    ]
    filtered_lineages: list[list[int]] = list(filter(None, lineages))
    if len(lineages) != len(filtered_lineages):
        raise ValueError(
            "Could not get the lineages for all of the given taxids."
        )
    return filtered_lineages


def get_seed_lineage(lineages: list[list[int]], seed_taxid: int) -> SeedLineage:
    """
    Gets the seed's lineage for the given seed_taxid.

    @param lineages: List of lists of integers, representing various lineages to get the seed lineage from.
    @param seed_taxid: Integer of the seed's taxid to query.
    @returns SeedLineage TypedDict, which gives back the "seed_lineage"
            as the lineage for the seed_taxid and the "seed_lineage_idx"
            for the index of the result lineage in the "lineages" argument.
    @raises ValueError if could not get the data.
    """
    seed_lineage: list[int] | None = None
    seed_lineage_idx: int | None = None
    for idx, lineage in enumerate(lineages):
        if lineage is None:
            raise ValueError(
                f"The given lineage on index: {idx} has value None"
            )
        if lineage[-1] == seed_taxid:
            seed_lineage_idx = idx
            seed_lineage = lineage
            return {
                "seed_lineage": seed_lineage,
                "seed_lineage_idx": seed_lineage_idx,
            }
    raise ValueError(
        f"Could not get the seed lineage data from the given lineages for seed_taxid: {seed_taxid}"
    )


def resolve_tree_rooting_dictionary(counter: dict[int, int]) -> dict[int, int]:
    """
    Resolves the tree rooting dictionary from the previously generated
    topology difference counter to the seed taxonomy lineage.

    @param counter The previously generated topology difference
                   counter to the seed taxonomy lineage.
    @returns Dictionary, where the keys are taxonomy IDs as integers,
             and the values are the order numbers.
    """
    sorted_counter: dict[int, int] = {
        k: v for k, v in sorted(counter.items(), key=lambda item: item[1])
    }
    unique_counter_values: list[int] = sorted(
        list(set(sorted_counter.values()))
    )
    converted_counter_values: dict[int, int] = {
        value: idx + 1 for idx, value in enumerate(unique_counter_values)
    }

    resolved_tree_rooting_dict: dict[int, int] = {
        taxid: converted_counter_values[counter_value]
        for taxid, counter_value in sorted_counter.items()
    }
    return resolved_tree_rooting_dict


def get_tree_rooting_dict(taxids: list[int], seed_taxid: int) -> dict[int, int]:
    lineages: list[list[int]] = get_lineages_for_taxids(taxids)

    seed_lineage_data: SeedLineage = get_seed_lineage(lineages, seed_taxid)

    lineages.pop(seed_lineage_data["seed_lineage_idx"])

    counter: dict[int, int] = get_topology_difference_count_for_seed_lineage(
        lineages, seed_lineage_data["seed_lineage"]
    )
    resolved_tree_rooting_dict: dict[
        int, int
    ] = resolve_tree_rooting_dictionary(counter)
    return resolved_tree_rooting_dict


def create_tmp_db_tables(tmp_sqlite_connection: sqlite3.Connection) -> None:
    curr = tmp_sqlite_connection.cursor()
    curr.execute(
        """\
            CREATE TABLE IF NOT EXISTS homologs (
                pair TEXT,
                lk REAL,
                ee INTEGER
            )
    """
    )
    curr.execute(
        """
    CREATE TABLE IF NOT EXISTS orthologs (
        p1sp2 TEXT,
        p1 TEXT,
        p2 TEXT,
        CS INTEGER,
        tree_counter INTEGER
    );
    """
    )
    curr.execute(
        """
    CREATE TABLE IF NOT EXISTS coorthologs (
        p2 TEXT,
        p1 TEXT
    );
    """
    )
    tmp_sqlite_connection.commit()


def get_grouped_query_results_from_cursor(
    cursor: mariadb.Cursor,
) -> GroupedPhylomeContentResult:
    idx: int
    row: PhylomeContentTaxidRow
    seed_taxid: int | None = None
    collected_taxids: list[int] = []
    for idx, row in enumerate(cursor):
        if idx == 0:
            seed_taxid = row["seed_taxid"]
        collected_taxids.append(row["taxid"])
    assert len(collected_taxids) > 0
    assert seed_taxid is not None

    grouped_query_results = GroupedPhylomeContentResult(
        taxids=collected_taxids, seed_taxid=seed_taxid
    )
    return grouped_query_results


def get_grouped_phylome_contents(
    connection: mariadb.Connection, phylome_id: int
) -> GroupedPhylomeContentResult:
    cursor = connection.cursor(dictionary=True)
    query: str = """\
        SELECT
            (SELECT genomes.taxid FROM genomes WHERE genomes.genome_id=phylomes.seed_genome_id LIMIT 1) AS seed_taxid,
            genomes.taxid
        FROM phylome_contents
        JOIN genomes
        ON (phylome_contents.genome_id = genomes.genome_id)
        JOIN phylomes
        ON (phylome_contents.phylome_id = phylomes.phylome_id)
        WHERE phylomes.phylome_id = ?"""
    cursor.execute(query, (phylome_id,))
    grouped_query_results: GroupedPhylomeContentResult = (
        get_grouped_query_results_from_cursor(cursor)
    )
    return grouped_query_results


def yield_phylome_newicks(
    connection: mariadb.Connection, phylome_id: int
) -> Iterator[PhylomeNewick]:
    cursor = connection.cursor(dictionary=True)
    query: str = """\
        SELECT
            trees.newick,
            trees.lk,
            trees.method,
            CONCAT("Phy", seed_protein_id, "_", genomes.taxid) AS newick_seed_id,
            genomes.taxid AS seed_taxid
        FROM trees
        JOIN proteins
        ON (trees.seed_protein_id = proteins.protein_id)
        JOIN genes
        ON (proteins.gene_id = genes.gene_id)
        JOIN genomes
        ON (genes.genome_id = genomes.genome_id)
        WHERE trees.phylome_id=?
"""
    cursor.execute(query, (phylome_id,))
    yield from cursor


@dataclass
class ExtendedPhyloTree:
    tree: PhyloTree
    seedid: str
    method: str
    lk: float
    seed_taxid: int


def get_extended_tree(args: PhylomeNewick) -> ExtendedPhyloTree:
    tree = PhyloTree(args["newick"])
    extended_tree = ExtendedPhyloTree(
        tree=tree,
        seedid=args["newick_seed_id"],
        method=args["method"],
        lk=args["lk"],
        seed_taxid=args["seed_taxid"],
    )
    # tree.seedid = args["newick_seed_id"]
    # tree.method = args["method"]
    # tree.lk = args["lk"]
    # tree.seed_taxid = args["seed_taxid"]
    #
    if args["newick_seed_id"] != extended_tree.seedid or extended_tree.method != args["method"]:
        raise ValueError(
            f"ERROR: Seedid and/or method doesn't match:"
            " {newick_seed_id}, {tree.seedid}, {newick_method}, {tree.method}"
        )
    return extended_tree


def yield_extended_trees(
    phylome_newicks: Iterator[PhylomeNewick],
) -> Iterator[ExtendedPhyloTree]:
    for newick_result in phylome_newicks:
        extended_tree: ExtendedPhyloTree = get_extended_tree(newick_result)
        yield extended_tree


def set_midpoint_as_outgroup(tree: PhyloTree, tree_id: str) -> None:
    try:
        tree.set_outgroup(tree.get_midpoint_outgroup())
    except Exception as e:
        print(
            f"ERROR: Cannot root tree: {tree_id} using mid-point",
            file=sys.stderr,
        )
        raise e


def set_oldest_leaft_as_outgroup(
    tree: PhyloTree,
    phylome_id: int,
    tree_id: str,
    seed_node: PhyloNode,
    root_dictionary: dict[int, int],
) -> None:
    try:
        outgroup = seed_node.get_farthest_oldest_leaf(
            root_dictionary[phylome_id]
        )
        tree.set_outgroup(outgroup)
    except ValueError as e:
        print(
            f"ERROR: Cannot root tree: {tree_id} using sp2age in phylome"
            f" {phylome_id}",
            file=sys.stderr,
        )
        print(e, file=sys.stderr)
        raise e


def set_tree_root(
    tree: PhyloTree,
    phylome_id: int,
    root_dictionary: dict[int, int],
    seed_node: PhyloNode,
    tree_id: str,
) -> None:
    if phylome_id in root_dictionary:
        set_oldest_leaft_as_outgroup(
            tree, phylome_id, tree_id, seed_node, root_dictionary
        )
        return
    set_midpoint_as_outgroup(tree, tree_id)


def add_homologs(
    tmp_sqlite_connection: sqlite3.Connection,
    seedspecies: int,
    lk: float,
    h1list: Iterable[str],
    h2list: Iterable[str],
    ee: int,
) -> None:
    cursor = tmp_sqlite_connection.cursor()
    for h1 in h1list:
        # skip non-seedsp proteins
        if get_species_taxid_from_newick_node_id(h1) != seedspecies:
            continue
        for h2 in h2list:
            # skip within-species paralogs
            if get_species_taxid_from_newick_node_id(h2) == seedspecies:
                continue

            pair: str = f"{h1}-{h2}"
            cursor.execute(
                """\
                INSERT INTO homologs (pair, lk, ee)
                VALUES (?, ?, ?);""",
                (pair, lk, ee),
            )


def get_species_taxid_from_newick_node_id(node_id: str) -> int:
    return int(node_id.split("_")[-1])


def write_homologs_tmp_file(
    tmp_sqlite_connection: sqlite3.Connection,
    phylo_trees: Iterator[ExtendedPhyloTree],
    root_dictionary: dict[int, int],
    phylome_id: int,
) -> None:
    failed_newick_counter: int = 0
    for extended_tree in phylo_trees:
        if not extended_tree.tree:
            print("Skipping phylome_id: %s" % phylome_id, file=sys.stderr)
            continue

        species_taxid: int = extended_tree.seed_taxid
        tree_id: str = f"{phylome_id}_{extended_tree.seedid}_{extended_tree.method}"

        try:
            seed_node = extended_tree.tree.get_leaves_by_name(extended_tree.seedid)[0]
        except:
            print(
                f"ERROR: Cannot get seedid ({extended_tree.seedid}) leaf in: {tree_id}",
                file=sys.stderr,
            )
            failed_newick_counter += 1
            continue

        extended_tree.tree.set_species_naming_function(get_species_taxid_from_newick_node_id)

        # ROOT TREE with error avoinding loops - should be sorted out in the future!
        try:
            set_tree_root(extended_tree.tree, phylome_id, root_dictionary, seed_node, tree_id)
        except Exception:
            continue

        evolEvents: list[EvolEvent] = extended_tree.tree.get_descendant_evol_events()
        # GET EVOLEVENTS
        for e in evolEvents:
            # define species overlap
            ee: int = 1
            if not e.sos:
                ee = 0
            # add seedsp homologs
            add_homologs(
                tmp_sqlite_connection,
                species_taxid,
                extended_tree.lk,
                e.in_seqs,
                e.out_seqs,
                ee,
            )
            add_homologs(
                tmp_sqlite_connection,
                species_taxid,
                extended_tree.lk,
                e.out_seqs,
                e.in_seqs,
                ee,
            )
    tmp_sqlite_connection.commit()


def insert_orthologs_data_from_homologs(
    tmp_sqlite_connection: sqlite3.Connection,
    homologs: Iterator[dict[Pair, list[tuple[LK, EE]]]],
    cs_cutoff_limit: float,
    likelihood_cutoff_limit: float,
) -> None:
    cursor = tmp_sqlite_connection.cursor()
    for homolog in homologs:
        for pair in homolog.keys():
            # unpack pair
            pair_parts: list[str] = pair.split("-")
            p1: str = pair_parts[0]
            p2: str = pair_parts[1]

            # get bestLK for given pair
            bestLk: float = max((lk for lk, _ in homolog[pair]))

            # skip trees having lk < 3x bestLk
            ees: list[int] = [
                ee
                for lk, ee in homolog[pair]
                if lk >= likelihood_cutoff_limit * bestLk
            ]
            # check CS
            current_cs_value: numpy.floating[Any] = 1 - numpy.mean(ees)
            if current_cs_value < cs_cutoff_limit:
                continue

            # add ortholog entry
            sp2: int = get_species_taxid_from_newick_node_id(p2)
            p1sp2: str = f"{p1}-{sp2}"

            cursor.execute(
                """
                INSERT INTO orthologs (p1sp2, p1, p2, CS, tree_counter)
                VALUES (?, ?, ?, ?, ?)
            """,
                (p1sp2, p1, p2, str(current_cs_value), str(len(ees))),
            )

            cursor.execute(
                """
                INSERT INTO coorthologs (p2, p1)
                VALUES (?, ?)
            """,
                (p2, p1),
            )
    tmp_sqlite_connection.commit()


def iterate_homologs_from_db(
    tmp_sqlite_connection: sqlite3.Connection,
) -> Iterator[dict[Pair, list[tuple[LK, EE]]]]:
    curr: sqlite3.Cursor = tmp_sqlite_connection.cursor()
    curr.execute("SELECT pair, lk, ee FROM homologs ORDER BY pair;")
    tmp_record: dict[str, list[tuple[float, int]]] = {}
    for row in curr:
        pair: str = row[0]
        lk: float = row[1]
        ee: int = row[2]

        if pair not in tmp_record and tmp_record:
            yield tmp_record
            tmp_record.clear()
            continue

        tmp_record.setdefault(pair, [])
        tmp_record[pair].append((lk, ee))


def get_orthologs_pair_count(
    tmp_sqlite_connection: sqlite3.Connection,
) -> dict[str, int]:
    query: str = """
    SELECT
        p1sp2,
        COUNT(*)
    FROM orthologs
    GROUP BY p1sp2
    """
    curr: sqlite3.Cursor = tmp_sqlite_connection.cursor()
    curr.execute(query)
    orthologs_pair_count: dict[str, int] = {row[0]: row[1] for row in curr}
    return orthologs_pair_count


def iterate_ortholog_summaries_from_db(
    tmp_sqlite_connection: sqlite3.Connection,
) -> Iterator[OrthologsRow]:
    query: str = """
    SELECT
        orth.p1sp2,
        orth.p1,
        coorth.p2,
        orth.CS,
        orth.tree_counter,
        coorth.p1
    FROM orthologs AS orth
    JOIN coorthologs AS coorth
    ON (orth.p2 = coorth.p2 AND orth.p1 != coorth.p1)
    ORDER BY orth.p1sp2, orth.p1, coorth.p2 DESC
    """
    curr: sqlite3.Cursor = tmp_sqlite_connection.cursor()
    curr.execute(query)

    tmp_record: OrthologsRow = {
        "p1sp2": "",
        "seqid": "",
        "orthologid": "",
        "CS": 0.0,
        "trees": 0,
        "co_orthologs": [],
    }

    for row in curr:
        p1sp2: str = row[0]
        seqid: str = row[1]
        orthologid: str = row[2]
        CS: float = row[3]
        trees: int = row[4]
        co_ortholog: str = row[5]

        if (
            seqid != tmp_record["seqid"]
            or orthologid != tmp_record["orthologid"]
        ):
            if tmp_record["seqid"] and tmp_record["orthologid"]:
                yield tmp_record

            tmp_record["p1sp2"] = p1sp2
            tmp_record["seqid"] = seqid
            tmp_record["orthologid"] = orthologid
            tmp_record["CS"] = CS
            tmp_record["trees"] = trees
            tmp_record["co_orthologs"].clear()

        tmp_record["co_orthologs"].append(co_ortholog)


def write_orthologs_file(
    ortholog_summaries: Iterator[OrthologsRow],
    pair_count: dict[str, int],
    output_file_path: str,
) -> None:
    header: str = "#seqid\torthologid\ttype\tCS\ttrees\tco-orthologs\n"
    out: gzip.GzipFile = gzip.open(output_file_path, "wb")
    out.write(header.encode())
    for summary in ortholog_summaries:
        p1sp2: str = summary["p1sp2"]
        relation1: str = "one"

        if pair_count[p1sp2] > 1:
            relation1 = "many"

        relation2: str = "one"
        if len(summary["co_orthologs"]) > 1:
            relation2 = "many"

        relation_type: str = f"{relation1}-to-{relation2}"
        co_orthologs: str = " ".join(summary["co_orthologs"])
        tmp_line: str = (
            f'{summary["seqid"]}\t{summary["orthologid"]}\t'
            f'{relation_type}\t{summary["CS"]:1.3f}\t'
            f'{summary["trees"]}\t{co_orthologs}\n'
        )
        out.write(tmp_line.encode())
    out.close()


def main() -> int:
    args = GetOrthologsReportArgs.get_arguments()
    connection = mariadb.connect(
        database=args.db_name,
        host=args.db_host,
        user=args.db_user,
        password=args.db_pass,
        port=args.db_port,
    )
    if connection is None:
        raise ConnectionError("Could not connect to database!")

    cs_cutoff_limit: float = 0.5
    likelihood_cutoff_limit: float = 3.0

    output_file_parent_dir: Path = Path(args.output_file_path).parent
    output_file_parent_dir.mkdir(parents=True, exist_ok=True)
    Path(args.tmp_directory_path).mkdir(parents=True, exist_ok=True)

    grouped_phylome_contents = get_grouped_phylome_contents(
        connection, args.phylome_id
    )
    tree_rooting_dict: dict[int, int] = get_tree_rooting_dict(
        taxids=grouped_phylome_contents.taxids,
        seed_taxid=grouped_phylome_contents.seed_taxid,
    )
    phylome_newicks: Iterator[PhylomeNewick] = yield_phylome_newicks(
        connection, args.phylome_id
    )
    extended_trees: Iterator[ExtendedPhyloTree] = yield_extended_trees(phylome_newicks)

    tmp_sqlite_uuid: uuid.UUID = uuid.uuid4()
    tmp_sqlite_path: str = os.path.join(
        args.tmp_directory_path, f"get-orthologs-report-{tmp_sqlite_uuid}.db"
    )
    tmp_sqlite_connection = sqlite3.Connection(tmp_sqlite_path)
    create_tmp_db_tables(tmp_sqlite_connection)

    write_homologs_tmp_file(
        tmp_sqlite_connection=tmp_sqlite_connection,
        phylo_trees=extended_trees,
        root_dictionary=tree_rooting_dict,
        phylome_id=args.phylome_id,
    )

    homologs: Iterator[
        dict[Pair, list[tuple[LK, EE]]]
    ] = iterate_homologs_from_db(tmp_sqlite_connection)

    insert_orthologs_data_from_homologs(
        tmp_sqlite_connection,
        homologs,
        cs_cutoff_limit,
        likelihood_cutoff_limit,
    )

    pair_count: dict[str, int] = get_orthologs_pair_count(tmp_sqlite_connection)
    ortholog_summaries: Iterator[
        OrthologsRow
    ] = iterate_ortholog_summaries_from_db(tmp_sqlite_connection)

    write_orthologs_file(
        ortholog_summaries,
        pair_count,
        args.output_file_path,
    )
    Path(tmp_sqlite_path).unlink()
    connection.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
