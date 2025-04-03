import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import EditUserGuide from "../../_components/editPage";
import { Suspense } from "react";
import { getFaqOptionById } from "../../_models/faq";
import { notFound } from "next/navigation";
import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";

export default async function Faq({ params }: { params: { guideId: string } }) {
    const faq = await getFaqOptionById(params.guideId);
    const isAdmin = await checkIsAuthenticatedAsAdmin();

    if (!faq || faq === undefined || isAdmin === false) {
        notFound();
    }

    return (
        <div className="p-8 max-w-7xl mx-auto bg-white mt-3">
            <Suspense fallback={<DefaultLoadingPage />}>
                <EditUserGuide faqOption={faq} />
            </Suspense>
        </div>
    );
}
