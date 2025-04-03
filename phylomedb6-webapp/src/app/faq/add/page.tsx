import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";
import AddFaqGuide from "../_components/addPage";

export const metadata = {
    title: "Add PhylomeDB Frequently Asked Questions Item",
    description: "Add new items to the PhylomeDB Frequently Asked Questions.",
};

export default async function Faq({ params }: { params: { guideId: string } }) {
    const isAdmin = await checkIsAuthenticatedAsAdmin();

    if (isAdmin === false) {
        notFound();
    }

    return (
        <div className="p-8 max-w-7xl mx-auto bg-white mt-3">
            <Suspense fallback={<DefaultLoadingPage />}>
                <AddFaqGuide />
            </Suspense>
        </div>
    );
}
