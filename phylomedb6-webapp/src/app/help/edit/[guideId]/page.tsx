import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import EditUserGuide from "../../_components/editPage";

import { Suspense } from "react";
import { getHelpOptionById } from "../../_models/help";
import { notFound } from "next/navigation";
import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";

export default async function Help({
    params,
}: {
    params: { guideId: string };
}) {
    const help = await getHelpOptionById(params.guideId);
    const isAdmin = await checkIsAuthenticatedAsAdmin();

    if (!help || help === undefined || isAdmin === false) {
        notFound();
    }
    return (
        <div className="p-8 max-w-7xl mx-auto bg-white mt-3">
            <Suspense fallback={<DefaultLoadingPage />}>
                <EditUserGuide helpOption={help} />
            </Suspense>
        </div>
    );
}
