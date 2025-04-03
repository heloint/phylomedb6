import { GeneProteinData } from "../_models/proteinInfo";

export function ProteinDescription(params: GeneProteinData) {
    return (
        <div className="px-2 sm:p-0">
            <div className="h-fit w-full flex flex-col md:flex-row justify-center items-center  py-4 bg-white bg-opacity-50 rounded-xl border-2 border-black">
                <div className="w-full flex-shrink-0 py-4 px-4 sm:px-10 xl:px-24 backdrop-blur-lg">
                    <h1 className="text-2xl  font-semibold underline decoration-solid text-center lg:text-start">
                        <u>Protein description</u>
                    </h1>
                    <div className="flex flex-col lg:flex-row lg:items-start gap-1 md:gap-5 xl:gap-10 text-md py-4 ">
                        {/* Protein ID */}
                        <div className="flex flex-col items-center lg:items-start justify-center text-center">
                            <b>
                                <u>Protein ID:</u>
                            </b>
                            <i>{params.protein_id || "Not found"}</i>
                        </div>
                        <div className="flex flex-col items-center lg:items-start justify-center text-center">
                            <b>
                                <u>External Protein ID:</u>
                            </b>
                            <i>
                                {params.external_protein_id || "Not available"}
                            </i>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col items-center lg:items-start justify-center text-center">
                            <b>
                                <u>Description:</u>
                            </b>
                            <i>{params.description || "Not available"}</i>
                        </div>

                        {/* Gene ID */}
                        <div className="flex flex-col items-center lg:items-start justify-center text-center">
                            <b>
                                <u>Gene ID:</u>
                            </b>
                            <i>{params.gene_id || "Not available"}</i>
                        </div>

                        {/* External Gene ID */}
                        <div className="flex flex-col items-center lg:items-start justify-center text-center">
                            <b>
                                <u>External Gene ID:</u>
                            </b>
                            <i>{params.external_gene_id || "Not available"}</i>
                        </div>

                        {/* Contig ID */}
                        <div className="flex flex-col items-center lg:items-start justify-center text-center">
                            <b>
                                <u>Contig ID:</u>
                            </b>
                            <i>{params.contig_id || "Not available"}</i>
                        </div>

                        {/* Gene Name */}
                        <div className="flex flex-col items-center lg:items-start justify-center text-center">
                            <b>
                                <u>Gene Name:</u>
                            </b>
                            <i>{params.gene_name || "Not available"}</i>
                        </div>

                        {/* Source */}
                        <div className="flex flex-col items-center lg:items-start justify-center text-center">
                            <b>
                                <u>Source:</u>
                            </b>
                            <i>{params.source || "Not available"}</i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
