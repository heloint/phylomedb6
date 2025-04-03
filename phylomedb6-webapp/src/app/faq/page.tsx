import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import FaqPage from "./_components/faqPage";

import { Suspense } from "react";
import { getAllFaqOptions } from "./_models/faq";
import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";

export const metadata = {
    title: "PhylomeDB Frequently Asked Questions",
    description:
        "Browse through our Frequently Asked Questions (FAQ) to find quick answers to common queries.",
};

export default async function Help() {
    const faq = await getAllFaqOptions();
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    return (
        <div className="p-8 max-w-7xl mx-auto bg-white mt-3 ">
            <Suspense fallback={<DefaultLoadingPage />}>
                <FaqPage faqOptions={faq} admin={isAdmin} />
            </Suspense>
        </div>
    );
}
