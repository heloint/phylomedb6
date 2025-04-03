import { GeneDescriptionData } from "../_models/geneDescriptionInfo";

export function GeneDescription(params: GeneDescriptionData) {
    return (
        <div className="px-1 sm:px-0">
            <div className="h-fit flex flex-col justify-center items-center w-full py-4   bg-white bg-opacity-50 rounded-xl">
                <div className="w-full flex-shrink-0 py-4 px-2 sm:px-10 lg:px-12 backdrop-blur-lg">
                    <h1 className="text-2xl text-center lg:text-start font-semibold underline decoration-solid">
                        <u>Gene description</u>
                    </h1>
                    <div className="flex flex-col lg:flex-row gap-2 md:gap-4 xl:gap-8 p-4 ">
                        {/* Gene ID */}
                        <div className="flex flex-col items-center justify-center  text-center">
                            <b>
                                <u>Gene ID:</u>
                            </b>
                            <i>{params.gene_id || "Not found"}</i>
                        </div>

                        {/* External Gene ID */}
                        <div className="flex flex-col items-center justify-center text-center">
                            <b>
                                <u>External Gene ID:</u>
                            </b>
                            <i>{params.external_gene_id || "Not available"}</i>
                        </div>

                        {/* Contig ID */}
                        <div className="flex flex-col items-center justify-center  text-center">
                            <b>
                                <u>Contig ID:</u>
                            </b>
                            <i>{params.contig_id || "Not available"}</i>
                        </div>

                        {/* Gene Name */}
                        <div className="flex flex-col items-center justify-center  text-center">
                            <b>
                                <u>Gene Name:</u>
                            </b>
                            <i>{params.gene_name || "Not available"}</i>
                        </div>

                        {/* Source */}
                        <div className="flex flex-col items-center justify-center text-center">
                            <b>
                                <u>Source:</u>
                            </b>
                            <i>{params.source || "Not available"}</i>
                        </div>

                        {/* Strand */}
                        <div className="flex flex-col items-center justify-center  text-center">
                            <b>
                                <u>Strand:</u>
                            </b>
                            <i>{params.strand || "Not available"}</i>
                        </div>

                        {/* Genome ID */}
                        <div className="flex flex-col items-center justify-center  text-center">
                            <b>
                                <u>Genome ID:</u>
                            </b>
                            <i>{params.genome_id || "Not available"}</i>
                        </div>

                        {/* External Genome ID */}
                        <div className="flex flex-col items-center justify-center  text-center">
                            <b>
                                <u>External Genome ID:</u>
                            </b>
                            <i>
                                {params.external_genome_id || "Not available"}
                            </i>
                        </div>

                        {/* Species Tax ID */}
                        <div className="flex flex-col items-center justify-center text-center">
                            <b>
                                <u>Species Tax ID:</u>
                            </b>
                            <i>{params.species_taxid || "Not available"}</i>
                        </div>

                        {/* Species Name */}
                        <div className="flex flex-col items-center justify-center  text-center">
                            <b>
                                <u>Species Name:</u>
                            </b>
                            <i>{params.species_name || "Not available"}</i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
