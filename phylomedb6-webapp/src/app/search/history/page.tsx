import { Suspense } from "react";
import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import TabOptions from "../_components/TabOptions";
import HistoryDataTable from "./_components/HistoryTable";
import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import { checkIsAuthenticated } from "@/auth/checkSession";
import {
    getAllHistoryOptions,
    HistoryOption,
} from "../../../_models/history/history";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = {
    title: "Search by sequence",
    description: "Search phylomes by sequence.",
};

export default async function Page() {
    let isLoggedIn = await checkIsAuthenticated();
    let dbResults: HistoryOption[] = [];

    if (isLoggedIn) {
        dbResults = await getAllHistoryOptions(isLoggedIn.user_email_address);
    }

    if (!isLoggedIn) {
        revalidatePath("/", "layout");
        return redirect("/");
    }

    if (dbResults.length < 1) {
        <ErrorMessageWindow
            errorTitle="No data received"
            errorMessage={`Could not retrieve any data for this history`}
        />;
    }

    return (
        <Suspense fallback={<DefaultLoadingPage />}>
            <div className="py-8 px-4 sm:px-8 lg:px-32 mx-auto w-full">
                {/*<div className="min-h-96 flex justify-center backdrop-blur-sm bg-white bg-opacity-75 rounded-lg border-2 border-slate-300 shadow-lg">*/}
                <div className="h-full flex flex-col py-4 mt-3">
                    <div className="h-full flex flex-col py-4">
                        <TabOptions sessionData={isLoggedIn} />
                        <div className="min-h-96 flex justify-center backdrop-blur-sm bg-white bg-opacity-75 rounded-lg border-2 border-gray-600 shadow-lg">
                            <div className="w-full">
                                <HistoryDataTable historyData={dbResults} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
