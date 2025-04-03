import remoteDb from "@/remoteDb";
import ProteomesTable from "./_components/ProteomesTable";
import TabOptions from "../_components/TabOptions";
import { tabOptions } from "../_lib/tabOptions";
import { ProteomesModel } from "./_models/proteomes";
import { phylomes } from "@/remoteDb/schema";
export const metadata = {
    title: "Phylome proteomes",
    description: "Proteomes for a specific phylome in the PhylomeDB database.",
};

export const dynamicParams = true;

export async function generateStaticParams() {
    const results = await remoteDb
        .select({ phylomeId: phylomes.phylome_id })
        .from(phylomes);
    return results.map((result) => ({
        phylomeId: result.phylomeId.toString(),
    }));
}

export default async function Page({
    params,
}: {
    params: { phylomeId: string };
}) {
    const proteomeData = await ProteomesModel.getProteomesByPhylomeId(
        Number(params.phylomeId),
    );

    return (
        <div className="bg-slate-100 bg-opacity-40 h-full flex flex-col py-4">
            <div className="px-1 sm:px-10 md:px-20 w-full  flex flex-col gap-0 sm:flex-row justify-center items-center">
                <TabOptions
                    tabOptions={tabOptions}
                    phylomeId={params.phylomeId}
                    selectedTabType="proteomes"
                />
            </div>
            <div className="min-h-96 flex justify-center">
                <div className="w-full md:px-20">
                    <ProteomesTable proteomesData={proteomeData} />
                </div>
            </div>
        </div>
    );
}
