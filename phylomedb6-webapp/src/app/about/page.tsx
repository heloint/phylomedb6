export const metadata = {
    title: "About PhylomeDB",
    description:
        "Find all the necessary citation information for PhylomeDB, including research publications, dataset references, and acknowledgments for the PhylomeDB team and contributors.",
};

export default function Page() {
    return (
        <div className="p-8 max-w-7xl mx-auto bg-white mt-3">
            <div >
                <img
                    alt="phylomedb icon"
                    width={150}
                    height={150}
                    src="/logos/phylomedb-logo-lg.webp"
                    className="mb-5"
                />
                <h1 className="text-2xl font-bold mb-4">
                    How to cite PhylomeDB
                </h1>
                <h3 className="text-lg font-semibold mb-2">Database:</h3>
                <ul className="list-disc list-inside flex flex-col gap-4 ml-5">
                    <li className="mb-2 text-justify">
                        <em>
                            Fuentes D, Molina M, Chorostecki U,
                            Capella-Gutiérrez S, Marcet-Houben M, Gabaldón T.
                        </em>{" "}
                        <strong>
                            PhylomeDB V5: an expanding repository for
                            genome-wide catalogues of annotated gene phylogenies
                        </strong>
                        Nucleic Acids Res. 2021 Oct 30:gkab966. doi:
                        10.1093/nar/gkab966. PMID: 34718760 [
                        <a
                            data-cy="PMID-34718760-link"
                            className="text-blue-600  hover:underline hover:underline-offset-2"
                            href="https://academic.oup.com/nar/advance-article/doi/10.1093/nar/gkab966/6414570"
                            target="_blank"
                        >
                            Link
                        </a>
                        ]
                    </li>
                    <li className="mb-2 text-justify">
                        <em>
                            Huerta-Cepas J, Capella-Gutiérrez S, Pryszcz LP,
                            Marcet-Houben M, Gabaldón T.
                        </em>{" "}
                        <strong>
                            PhylomeDB v4: zooming into the plurality of
                            evolutionary histories of a genome.
                        </strong>{" "}
                        Nucleic Acids Res. 2014, 42(Database issue), D897-902.
                        PMID: 24275491 [
                        <a
                            data-cy="PMID-24275491-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://academic.oup.com/nar/article/42/D1/D897/1057169"
                            target="_blank"
                        >
                            Link
                        </a>
                        ]
                    </li>
                    <li className="mb-2 text-justify">
                        <em>
                            Huerta-Cepas J, Capella-Gutierrez S, Pryszcz LP,
                            Denisov I, Kormes D, Marcet-Houben M, Gabaldón T.
                        </em>{" "}
                        <strong>
                            PhylomeDB v3.0: an expanding repository of
                            genome-wide collections of trees, alignments and
                            phylogeny-based orthology and paralogy predictions.
                        </strong>{" "}
                        Nucleic Acids Res. 2011, 39(Database issue), D556–60.
                        PMID: 21075798 [
                        <a
                            data-cy="PMID-21075798-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://academic.oup.com/nar/article/39/suppl_1/D556/2506874"
                            target="_blank"
                        >
                            Link
                        </a>
                        ]
                    </li>
                    <li className="mb-2 text-justify">
                        <em>Huerta-Cepas J, Bueno A, Dopazo J, Gabaldón T. </em>
                        <strong>
                            PhylomeDB: a database for genome-wide collections of
                            gene phylogenies.
                        </strong>{" "}
                        Nucleic Acids Res. 2008, 36(Database issue):D491-6.
                        PMID: 17962297 [
                        <a
                            data-cy="PMID-17962297-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://academic.oup.com/nar/article/36/suppl_1/D491/2507569" /* broken link (fixed) check */
                            target="_blank"
                        >
                            Link
                        </a>
                        ]
                    </li>
                </ul>
                <h3 className="text-lg font-semibold mb-2 mt-5">
                    The original phylogenetic pipeline used to reconstruct
                    phylomes is described in:
                </h3>
                <ul className="list-disc list-inside mb-4 ml-5 ">
                    <li className="mb-1 text-justify">
                        <em>
                            Huerta-Cepas J, Dopazo H, Dopazo J, Gabaldón T.{" "}
                        </em>
                        <strong>The human phylome.</strong>
                        Genome Biol. 2007;8(6):R109. PMID: 17567924 [
                        <a
                            data-cy="PMID-17567924-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://pubmed.ncbi.nlm.nih.gov/17567924/"
                            target="_blank"
                        >
                            Link
                        </a>
                        ]
                    </li>
                </ul>
                <h3 className="text-lg font-semibold mb-2">
                    Specific phylome releases and datasets:
                </h3>
                <p className="ml-4 mb-8 text-justify">
                    Please,check for{" "}
                    <a
                        data-cy="associated-publication-link"
                        className="text-blue-600 hover:underline hover:underline-offset-2"
                        href="/phylomes"
                        target="_blank"
                    >
                        associated publications
                    </a>{" "}
                    of each phylome
                </p>
                <h1 className="text-2xl font-bold mb-4 mt-4">PhylomeDB team</h1>
                <p className="text-justify">
                    People involved in the design, development and maintenance
                    of PhylomeDB are:
                </p>
                <ul className="list-disc list-inside mb-4 mt-2 ml-5">
                    <li className="mb-1 text-justify">
                        <a
                            data-cy="diego-fuentes-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://scholar.google.es/citations?user=9WWxbrYAAAAJ&hl=es&oi=ao"
                            target="_blank"
                        >
                            Diego Fuentes
                        </a>
                    </li>
                    <li className="mb-1 text-justify">
                        <a
                            data-cy="daniel-majer-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://www.bsc.es/majer-daniel"
                            target="_blank"
                        >
                            Dániel Májer
                        </a>
                    </li>
                    <li className="mb-1 text-justify">
                        <a
                            data-cy="marina-marcet-houben-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://www.bsc.es/marcet-houben-marina"
                            target="_blank"
                        >
                            Marina Marcet-Houben
                        </a>
                    </li>
                    <li className="mb-1 text-justify">
                        <a
                            data-cy="toni-gabaldon-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://www.bsc.es/gabaldon-toni"
                            target="_blank"
                        >
                            Toni Gabaldón
                        </a>
                    </li>
                    <p className="mb-4 mt-4">(Past members and contributors)</p>
                    <li className="mb-1 text-justify">
                        <a
                            data-cy="salvador-capella-gutierrez-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://scholar.google.com/citations?user=sCFo5z4AAAAJ&hl=en"
                            target="_blank"
                        >
                            Salvador Capella-Gutierrez
                        </a>
                    </li>
                    <li className="mb-1 text-justify">
                        <a
                            data-cy="leszek-pryszcz-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://www.crg.eu/en/group-members/leszek-piotr-pryszcz"
                            target="_blank"
                        >
                            Leszek Pryszcz
                        </a>
                    </li>
                    <li className="mb-1 text-justify">
                        <a
                            data-cy="miguel-angel-naranjo-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://scholar.google.es/citations?user=WVEclfoAAAAJ&hl=es"
                            target="_blank"
                        >
                            Miguel Ángel Naranjo
                        </a>
                    </li>
                    <li className="mb-1">Ernst Thür</li>
                    <li className="mb-1 text-justify">
                        <a
                            data-cy="laia-carrete-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://scholar.google.es/citations?user=WtHoc5oAAAAJ"
                            target="_blank"
                        >
                            Laia Carreté
                        </a>
                    </li>
                    <li className="mb- text-justify">
                        <a
                            data-cy="jaime-huerta-cepas-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://scholar.google.com/citations?user=lUCR9rIAAAAJ&hl=en"
                            target="_blank"
                        >
                            Jaime Huerta-Cepas
                        </a>
                    </li>
                    <li className="mb-1">Ivan Denisov</li>
                    <li className="mb-1">Diego Kormes</li>
                    <li className="mb-1">Anibal Bueno-Amorós </li>
                    <li className="mb-1">Manu Molina</li>
                    <li className="mb-1">
                        <a
                            data-cy="uciel-chorostecki-link"
                            className="text-blue-600 hover:underline hover:underline-offset-2"
                            href="https://scholar.google.com/citations?user=k2ijrokAAAAJ&hl=en&oi=ao"
                            target="_blank"
                        >
                            Uciel Chorostecki
                        </a>
                    </li>
                    <li className="mb-1">Ismael Collado</li>
                </ul>
                <h1 className="text-2xl font-bold mb-4">PhylomeDB uses</h1>
                <div className="flex flex-row flex-wrap items-center justify-center text-center space-x-4  ">
                    <a
                        href="http://ete.cgenomics.org/"
                        target="_blank"
                        data-cy="ete-cgenomics-link"
                    >
                        {" "}
                        {/*Link broken*/}
                        <img
                            alt="phylomedb icon"
                            width={80}
                            height={80}
                            src="/logos/ete-logo.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    <a
                        href="https://trimal.cgenomics.org/"
                        target="_blank"
                        data-cy="trimal-link-button"
                    >
                        <img
                            alt="phylomedb icon"
                            width={140}
                            height={140}
                            src="/logos/trimal-logo.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    <a
                        href="https://www.jalview.org/"
                        target="_blank"
                        data-cy="jalview-link-button"
                    >
                        <img
                            alt="phylomedb icon"
                            width={190}
                            height={190}
                            src="/logos/jalview-logo.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                </div>
                <h1 className="text-2xl font-bold mb-4">
                    PhylomeDB cross linking
                </h1>
                <div className=" flex flex-row flex-wrap items-center space-x-4 justify-center ">
                    <a
                        href="https://www.uniprot.org/"
                        target="_blank"
                        data-cy="uniprot-link-button"
                    >
                        <img
                            alt="phylomedb icon"
                            width={100}
                            height={100}
                            src="/logos/uniprot-logo.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    <a
                        href="https://www.ensembl.org/index.html"
                        target="_blank"
                        data-cy="ensembl-link-button"
                    >
                        <img
                            alt="phylomedb icon"
                            width={110}
                            height={110}
                            src="/logos/ensembl-logo.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    <a
                        href="https://www.yeastgenome.org/"
                        target="_blank"
                        data-cy="sgd-link-button"
                    >
                        <img
                            alt="phylomedb icon"
                            width={75}
                            height={75}
                            src="/logos/SGD-logo.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    <a
                        href="http://www.candidagenome.org/"
                        target="_blank"
                        data-cy="cgd-link-button"
                    >
                        <img
                            alt="phylomedb icon"
                            width={75}
                            height={75}
                            src="/logos/logo-CGD.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    <a
                        href="http://www.genolevures.org/"
                        target="_blank"
                        data-cy="genolevures-link-button"
                    >
                        {" "}
                        {/*Link broken*/}
                        <img
                            alt="phylomedb icon"
                            width={110}
                            height={110}
                            src="/logos/genolevures-logo.webp"
                            className="mb-5  transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    <a
                        href="https://acypicyc.cycadsys.org/"
                        target="_blank"
                        data-cy="acypicyc-link-button"
                    >
                        <img
                            alt="phylomedb icon"
                            width={130}
                            height={130}
                            src="/logos/acypicyc-logo.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110"
                        />
                    </a>
                    <a
                        href="http://www.treefam.org/"
                        target="_blank"
                        data-cy="treefam-link-button"
                    >
                        <img
                            alt="phylomedb icon"
                            width={130}
                            height={130}
                            src="/logos/treefam-logo.webp"
                            className="mb-5 transform transition-transform duration-300 hover:scale-110 "
                        />
                    </a>
                </div>
            </div>
        </div>
    );
}
