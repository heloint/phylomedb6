export const metadata = {
    title: "ERGA Phylomes Initiative",
    description: "Learn about the ERGA Phylomes Initiative by PhylomeDB.",
};

export default function Page() {
    return (
        <div className="p-8 max-w-7xl mx-auto bg-white mt-3 ">
            <div>
                <img
                    alt="phylomedb icon"
                    width={150}
                    height={150}
                    src="/logos/phylomedb-logo-lg.webp"
                    className="mb-5"
                />
                <h1 className="text-2xl font-bold mb-4">
                    ERGA Phylomes Initiative
                </h1>
                <h2 className="text-xl font-semibold mb-4">
                    Call for Collaborative Projects Proposal
                </h2>

                <h3 className="text-lg font-semibold mb-2">Introduction</h3>
                <p className="mb-4 text-justify">
                    In order to support the European Reference Genome Atlas
                    (ERGA) project, and facilitate obtaining relevant biological
                    insights through comparative genomics analysis, PhylomeDB
                    database has launched the ERGA phylomes initiative, by which
                    we offer collaborative partnership to groups that have
                    obtained an annotated ERGA reference genome. We offer an
                    evolutionary analysis of the newly sequenced genome and
                    other sequenced species of interest by reconstructing and
                    analysing a phylome of the species.
                </p>
                <p className="mb-4 text-justify">
                    Phylomes are complete collections of phylogenetic trees for
                    all genes encoded in a genome and as such they represent the
                    evolution of a species as seen by each of their genes. By
                    studying the different phylogenetic trees we can obtain
                    information regarding the different evolutionary mechanisms
                    that have affected a species of interest such as
                    duplications and losses. We will also obtain a
                    phylogeny-based catalogue of orthology and paralogy
                    relationships between the species included in the phylome
                    and link this information to functional annotations (See
                    examples of previous collaborations below).
                </p>

                <h3 className="text-lg font-semibold mb-2">
                    What information do we need to build a phylome?
                </h3>
                <ol className="list-decimal list-inside mb-4">
                    <li className="mb-2 text-justify">
                        We will need a single fasta file containing the proteome
                        of your species. If isoforms are present we need the gff
                        file that relates protein codes to their gene codes.
                        This information can also be convenient as it allows us
                        to extend the analysis to include information about gene
                        order.
                    </li>
                    <li className="mb-2 text-justify">
                        A phylome is always constructed in the context of a set
                        of species to which we want to compare. Indications
                        about the taxonomic scope of the phylome are needed to
                        be able to approach the project in a reliable manner. At
                        the proposal level it is enough to describe the
                        taxonomic scope (e.g. across vertebrates) and/or name a
                        few of the species you need to include to address the
                        biological question.
                    </li>
                </ol>

                <h3 className="text-lg font-semibold mb-2">
                    What will you obtain?
                </h3>
                <p className="mb-4 text-justify">
                    The result of a phylome in its rawest form is a catalog of
                    phylogenetic trees that can be then analysed. This dataset
                    will be publicly available and browsable through our
                    webserver. Our standard analysis pipeline includes inference
                    of phylogeny-based orthology and paralogy, detection and
                    relative dating of gene duplications, and phylogenomic
                    reconstruction of species tree. From then on we have
                    experience in mining such rich dataset to enquire about
                    other questions related to the evolution of the genome.
                </p>
                <p className="mb-4 text-justify">
                    Possible inferences include but are not limited to:
                    detection of selection signatures, detection of non-vertical
                    evolution signals such as lateral transfer or hybridization,
                    detection of conserved gene clusters, etc. We offer to
                    collaborate with the selected groups to facilitate the
                    analyses in order to study how individual genes have evolved
                    and how they shaped the evolution of the species of
                    interest.
                </p>

                <h4 className="text-md font-semibold mb-2">
                    Examples of such collaborations:
                </h4>
                <ul className="list-disc list-inside mb-4">
                    <li className="mb-1">
                        Iberian lynx:{" "}
                        <a
                            data-cy="genome-biology-article-link"
                            href="https://genomebiology.biomedcentral.com/articles/10.1186/s13059-016-1090-1"
                            className="text-blue-600 hover:underline"
                        >
                            Genome Biology Article
                        </a>
                    </li>
                    <li className="mb-1">
                        Pea aphid project:{" "}
                        <a
                            data-cy="plos-biology-link"
                            href="https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1000313"
                            className="text-blue-600 hover:underline"
                        >
                            PLOS Biology Article
                        </a>
                    </li>
                    <li className="mb-1">
                        Cotton rat project:{" "}
                        <a
                            data-cy="biorxiv-article"
                            href="https://www.biorxiv.org/content/10.1101/2024.03.21.586163v1"
                            className="text-blue-600 hover:underline"
                        >
                            BioRxiv Article
                        </a>
                    </li>
                    <li className="mb-1">
                        Little skate project:{" "}
                        <a
                            data-cy="nature-link"
                            href="https://www.nature.com/articles/s41586-023-05868-1"
                            className="text-blue-600 hover:underline"
                        >
                            Nature Article
                        </a>
                    </li>
                </ul>

                <h3 className="text-lg font-semibold mb-2">How to apply?</h3>
                <p className="mb-4">
                    Fill in this{" "}
                    <a
                        data-cy="google-form-link"
                        href="https://forms.gle/xk4Bba2qTTjCkG7K7"
                        className="text-blue-600 hover:underline"
                    >
                        Google Form
                    </a>{" "}
                    with the requested information:
                </p>
                <ul className="list-disc list-inside mb-4">
                    <li className="mb-1">
                        Genome description and interest. (limit: 500 words)
                    </li>
                    <li className="mb-1 text-justify">
                        Abstract for the proposed project (i.e. questions that
                        want to be addressed with the phylome, potential for
                        future use by the community, etc) (limit 500 words)
                    </li>
                    <li className="mb-1 text-justify">
                        Taxonomic scope (description of other relevant
                        species/groups for comparison, ideally a list of species
                        with available genomes)
                    </li>
                    <li className="mb-1 text-justify">
                        Brief Description of the team (limit 500 words)
                    </li>
                </ul>
            </div>
        </div>
    );
}
