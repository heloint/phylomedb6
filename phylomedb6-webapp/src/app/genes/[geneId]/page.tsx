import { GeneDescription } from "./_components/description";
import { getGeneDescriptionDataByGeneId } from "./_models/geneDescriptionInfo";
import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import { Suspense } from "react";
import { PhylomesModel } from "@/_models/phylomes/phylomes";
import PhylomesTableByGeneId from "./_components/PhylomesTableByGeneId";

export const dynamicParams = true;

export default async function Page({ params }: { params: { geneId: string } }) {
    const geneId = Number(params.geneId);
    const phylomeData =
        await PhylomesModel.getNonEmptyPhylomesDataByGeneId(geneId);
    const geneInfoData = await getGeneDescriptionDataByGeneId(geneId);

    return (
        <Suspense fallback={<DefaultLoadingPage />}>
            <div className="bg-slate-100 bg-opacity-40 h-full flex flex-col py-4">
                <div className="min-h-70 flex justify-center ">
                    <div className="w-full sm:px-5 lg:px-20">
                        <div>
                            <GeneDescription {...geneInfoData} />
                            <PhylomesTableByGeneId phylomeData={phylomeData} />
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
