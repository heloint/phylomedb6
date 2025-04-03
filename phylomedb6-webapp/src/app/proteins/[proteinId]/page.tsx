import { ProteinDescription } from "./_components/description";
import PhylomesTableContProt from "./_components/PhylomesTableContainingProtein";
import { getGeneProteinDataByProteinId } from "./_models/proteinInfo";
import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import { Suspense } from "react";
import { PhylomesModelByProteinId } from "./_models/phylomesByProteinIdInfo";

export const dynamicParams = true;

export default async function Page({
    params,
}: {
    params: { proteinId: string };
}) {
    const proteinId = Number(params.proteinId);
    const phylomeData =
        await PhylomesModelByProteinId.getNonEmptyPhylomesData(proteinId);
    const proteinInfoData = await getGeneProteinDataByProteinId(proteinId);

    return (
        <Suspense fallback={<DefaultLoadingPage />}>
            <div className="bg-slate-100 bg-opacity-40 h-full flex flex-col py-4">
                <div className="min-h-70 flex justify-center sm:">
                    <div className="w-full sm:px-5 lg:px-20">
                        <ProteinDescription {...proteinInfoData} />
                        <PhylomesTableContProt phylomeData={phylomeData} />
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
