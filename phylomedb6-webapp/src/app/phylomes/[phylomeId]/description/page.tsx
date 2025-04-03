import PhylomeDescription from "./_components/description";
import { getPhylomeInfoByPhylomeId } from "./_models/phylomeInfo";
import TabOptions from "../_components/TabOptions";
import { tabOptions } from "../_lib/tabOptions";
import remoteDb from "@/remoteDb";
import { phylomes } from "@/remoteDb/schema";

export const metadata = {
    title: "Phylome Description",
    description:
        "Detailed descriptions and information for each available phylome in the PhylomeDB database.",
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
    const phylomeInfoData = await getPhylomeInfoByPhylomeId(params.phylomeId);
    return (
        <div className="bg-slate-100 bg-opacity-40 h-full flex flex-col py-4">
            <div className="px-1 sm:px-10 md:px-20 w-full  flex flex-col gap-0 sm:flex-row justify-center items-center">
                <TabOptions
                    tabOptions={tabOptions}
                    phylomeId={params.phylomeId}
                    selectedTabType="description"
                />{" "}
            </div>
            <div className="min-h-96 flex justify-center">
                <div className="w-full sm:px-5 lg:px-20">
                    <PhylomeDescription {...phylomeInfoData} />
                </div>
            </div>
        </div>
    );
}
