import sys

from .common import log, dump

DESC = ""


def populate_args(ncbi_args_p):
    ncbi_args = ncbi_args_p.add_argument_group("NCBI GENERAL OPTIONS")

    ncbi_args.add_argument(
        "--search", dest="search", nargs="+", help="A list of taxid or species names"
    )

    ncbi_args.add_argument(
        "--db", dest="dbfile", type=str, help="""NCBI sqlite3 db file."""
    )

    ncbi_args.add_argument(
        "--taxdump_file",
        dest="taxdumpfile",
        type=str,
        help="""Use local NCBI taxdump file instead of downloading from NCBI.""",
    )

    ncbi_args.add_argument(
        "--create",
        dest="create",
        action="store_true",
        default=False,
        help="""Create taxdump file and exit.""",
    )

    ncbi_args.add_argument(
        "--fuzzy",
        dest="fuzzy",
        type=float,
        help=(
            "EXPERIMENTAL: Tries a fuzzy (and SLOW) search for those"
            " species names that could not be translated"
            " into taxids. A float number must be provided"
            " indicating the minimum string similarity."
            " Special sqlite compilation is necessary."
        ),
    )

    output_args = ncbi_args_p.add_argument_group("NCBI OUTPUT OPTIONS")

    output_args.add_argument(
        "--tree",
        dest="tree",
        action="store_true",
        help=(
            "dump a pruned version of the NCBI taxonomy"
            " tree containing target species"
        ),
    )

    output_args.add_argument(
        "--descendants",
        dest="descendants",
        action="store_true",
        help=("dump the descendant taxa for each of the queries"),
    )

    output_args.add_argument(
        "--info",
        dest="info",
        action="store_true",
        help="""dump NCBI taxonmy information for each target species into the specified file. """,
    )

    output_args.add_argument(
        "--collapse_subspecies",
        dest="collapse_subspecies",
        action="store_true",
        help=(
            "When used, all nodes under the the species rank"
            " are collapsed, so all species and subspecies"
            " are seen as sister nodes"
        ),
    )

    output_args.add_argument(
        "--rank_limit",
        dest="rank_limit",
        type=str,
        help=("When used, all nodes under the provided rank" " are discarded"),
    )

    output_args.add_argument(
        "--full_lineage",
        dest="full_lineage",
        action="store_true",
        help=(
            "When used, topology is not pruned to avoid "
            " one-child-nodes, so the complete lineage"
            " track leading from root to tips is kept."
        ),
    )


def run(args):
    # add lineage profiles/stats

    import re
    from .. import PhyloTree, NCBITaxa

    # dump tree by default
    if not args.tree and not args.info and not args.descendants:
        args.tree = True

    ncbi = NCBITaxa(args.dbfile, args.taxdumpfile)

    if args.create:
        sys.exit(0)
    all_taxids = {}
    all_names = set()
    queries = []

    if not args.search:
        log.error("Search terms should be provided (i.e. --search) ")
        sys.exit(-1)
    for n in args.search:
        queries.append(n)
        try:
            all_taxids[int(n)] = None
        except ValueError:
            all_names.add(n.strip())

    # translate names
    name2tax = ncbi.get_name_translator(all_names)
    for tids in name2tax.values():
        for tid in tids:
            all_taxids[tid] = None

    not_found_names = all_names - set(name2tax.keys())
    if args.fuzzy and not_found_names:
        log.warn("%s unknown names", len(not_found_names))
        for name in not_found_names:
            # enable extension loading
            tax, realname, sim = ncbi.get_fuzzy_name_translation(name, args.fuzzy)
            if tax:
                all_taxids[tax] = None
                name2tax[name] = [tax]
                name2realname[name] = realname
                name2score[name] = "Fuzzy:%0.2f" % sim

    if not_found_names:
        log.warn(
            "[%s] could not be translated into taxids!" % ",".join(not_found_names)
        )

    if args.tree:
        if len(all_taxids) == 1:
            target_taxid = list(all_taxids.keys())[0]
            log.info("Dumping NCBI descendants tree for %s" % (target_taxid))
            t = ncbi.get_descendant_taxa(
                target_taxid,
                collapse_subspecies=args.collapse_subspecies,
                rank_limit=args.rank_limit,
                return_tree=True,
            )
        else:
            log.info("Dumping NCBI taxonomy of %d taxa..." % (len(all_taxids)))
            t = ncbi.get_topology(
                list(all_taxids.keys()),
                intermediate_nodes=args.full_lineage,
                rank_limit=args.rank_limit,
                collapse_subspecies=args.collapse_subspecies,
            )

        id2name = ncbi.get_taxid_translator([n.name for n in t.traverse()])
        for n in t.traverse():
            n.add_properties(taxid=n.name)
            n.add_properties(sci_name=str(id2name.get(int(n.name), "?")))
            n.name = "%s - %s" % (id2name.get(int(n.name), n.name), n.name)
            lineage = ncbi.get_lineage(n.taxid)
            n.add_properties(named_lineage="|".join(ncbi.translate_to_names(lineage)))
        dump(
            t,
            properties=[
                "taxid",
                "name",
                "rank",
                "bgcolor",
                "sci_name",
                "collapse_subspecies",
                "named_lineage",
            ],
        )
    elif args.descendants:
        log.info("Dumping NCBI taxonomy of %d taxa..." % (len(all_taxids)))
        print(
            "# "
            + "\t".join(
                ["Taxid", "Sci.Name", "Rank", "descendant_taxids", "descendant_names"]
            )
        )
        translator = ncbi.get_taxid_translator(all_taxids)
        ranks = ncbi.get_rank(all_taxids)
        for taxid in all_taxids:
            descendants = ncbi.get_descendant_taxa(
                taxid,
                collapse_subspecies=args.collapse_subspecies,
                rank_limit=args.rank_limit,
            )
            print(
                "\t".join(
                    [
                        str(taxid),
                        translator.get(taxid, taxid),
                        ranks.get(taxid, ""),
                        "|".join(map(str, descendants)),
                        "|".join(map(str, ncbi.translate_to_names(descendants))),
                    ]
                )
            )

    elif args.info:
        print(
            "# "
            + "\t".join(["Taxid", "Sci.Name", "Rank", "Named Lineage", "Taxid Lineage"])
        )
        translator = ncbi.get_taxid_translator(all_taxids)
        ranks = ncbi.get_rank(all_taxids)
        for taxid, name in translator.items():
            lineage = ncbi.get_lineage(taxid)
            named_lineage = ",".join(ncbi.translate_to_names(lineage))
            lineage_string = ",".join(map(str, lineage))
            print(
                "\t".join(
                    [
                        str(taxid),
                        name,
                        ranks.get(taxid, ""),
                        named_lineage,
                        lineage_string,
                    ]
                )
            )
