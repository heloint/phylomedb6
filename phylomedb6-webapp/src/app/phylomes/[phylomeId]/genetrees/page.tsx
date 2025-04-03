import TabOptions from "../_components/TabOptions";
import { tabOptions } from "../_lib/tabOptions";
import { GeneTreesModel } from "./_models/geneTrees";
import GeneTreesTable from "./_components/GeneTreesTable";
import remoteDb from "@/remoteDb";
import { phylomes } from "@/remoteDb/schema";

export const metadata = {
    title: "Phylome Gene Trees - Explore Gene Tree Data",
    description:
        "Gene trees associated with a specific phylome in the PhylomeDB database.",
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
    const tableData = await GeneTreesModel.getGeneTreesDataByPhylomeId(
        Number(params.phylomeId),
    );
    return (
        <div className="bg-slate-100 bg-opacity-40 h-full flex flex-col py-4">
            <div className="px-1 sm:px-10 md:px-20 w-full  flex flex-col gap-0 sm:flex-row justify-center items-center">
                <TabOptions
                    tabOptions={tabOptions}
                    phylomeId={params.phylomeId}
                    selectedTabType="genetrees"
                />
            </div>
            <div className="min-h-96 flex justify-center">
                <div className="w-full md:px-20">
                    <div className="lg:p-0 h-fit w-full overflow-scroll grid gap-4 ">
                        <GeneTreesTable
                            phylomeId={params.phylomeId}
                            tableData={tableData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
