import { PhylomeInfo } from "../_models/phylomeInfo";
import SpeciesAndTaxonomy from "./speciesAndTaxonomy";

export default function PhylomeDescription(params: PhylomeInfo) {
    return (
        <>
            <div className="h-fit flex flex-col justify-center items-center w-full  bg-white bg-opacity-60 rounded-xl ">
                <div className="flex flex-col gap-3 w-full sm:w-10/12 flex-shrink-0 py-4 px-4 sm:px-10 lg:px-12 backdrop-blur-sm bg-opacity-80 rounded-lg   bg-transparent mask-image-fade-sides">
                    <h1 className="text-3xl">
                        <u>Phylome {params.phylome_id}</u>
                    </h1>
                    <p className="text-lg">
                        <b>
                            <u>Name:</u>
                        </b>
                        <br />
                        <i>{params.name}</i>
                    </p>
                    <p className="text-lg">
                        <b>
                            <u>Description:</u>
                        </b>
                        <br />
                        <i>{params.description}</i>
                    </p>
                    <div className="text-lg">
                        <b>
                            <u>Species And Taxonomy:</u>
                        </b>
                    </div>
                    <SpeciesAndTaxonomy phylomeId={params.phylome_id} />
                </div>
                
            </div>
        </>
    );
}
