import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";

import { Suspense } from "react";
import PhylomesDatatable from "./_components/PhylomesTable";
import { PhylomesModel } from "@/_models/phylomes/phylomes";

export const metadata = {
    title: "Phylomes",
    description: "List of available phylomes",
};
export const revalidate = 300; // Revalidate after minimum of 5 minutes the cached data.

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ taxidFilters: string | undefined }>;
}) {
    const params = await searchParams;
    let phylomeData = await PhylomesModel.getNonEmptyPhylomesData();
    if (params && params.taxidFilters) {
        const taxidFilters = params.taxidFilters
            .split(",")
            .map((taxid) => Number(taxid))
            .filter((convertedTaxid) => !isNaN(convertedTaxid));
        phylomeData = phylomeData.filter((phylome) =>
            taxidFilters.includes(phylome.species_taxid),
        );
    }
    return (
        <Suspense fallback={<DefaultLoadingPage />}>
            <div className="">
                <PhylomesDatatable phylomeData={phylomeData} />
            </div>{" "}
        </Suspense>
    );
}
