import { Suspense } from "react";
import TabOptions from "../_components/TabOptions";
import GeneSearch from "./_components/GeneSearch";
import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import { checkIsAuthenticated } from "@/auth/checkSession";

export const metadata = {
    title: "Search by gene",
    description: "Search phylomes by gene name.",
};

export default async function Page() {
    let sessionData = await checkIsAuthenticated();
    return (
        <div className="py-8 px-4 sm:px-8 lg:px-32 mx-auto w-full">
            <div className="h-full flex flex-col py-4 mt-3">
                <div className="h-full flex flex-col py-4">
                    <TabOptions sessionData={sessionData} />
                    <div className="min-h-96 flex justify-center backdrop-blur-sm bg-white bg-opacity-75 rounded-lg border-2 border-gray-600 shadow-lg">
                        <div className="w-full">
                            <GeneSearch />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
