import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";

import NewsCreationForm from "./ _components/NewsCreationForm";

export const metadata = {
    title: "Create PhylomeDB News",
    description:
        "Submit new news articles, research updates, or announcements to PhylomeDB.",
};

export default async function Help({
    params,
}: {
    params: { guideId: string };
}) {
    const isAdmin = await checkIsAuthenticatedAsAdmin();

    if (isAdmin === false) {
        notFound();
    }
    return (
        <div className="p-8 max-w-7xl mx-auto bg-white mt-3">
            <Suspense fallback={<DefaultLoadingPage />}>
                <NewsCreationForm />
            </Suspense>
        </div>
    );
}
