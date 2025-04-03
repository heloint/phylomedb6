import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import persistentLocalDb from "@/persistentLocalDb";
import { news } from "@/persistentLocalDb/persistentLocalSchema";
import NewsEditor from "./_components/NewsEditor";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";

export const metadata = {
    title: "Get PhylomeDB News",
    description:
        "Get news articles, research updates, and announcements from PhylomeDB.",
};

export default async function Page({ params }: { params: { newsID: number } }) {
    const dbResults = await persistentLocalDb
        .select()
        .from(news)
        .where(eq(news.id, params.newsID))
        .limit(1);
    if (dbResults.length < 1) {
        <ErrorMessageWindow
            errorTitle="No data received"
            errorMessage={`Could not retrieve any data for this news with ID: ${params.newsID}.`}
        />;
    }
    return (
        <Suspense fallback={<DefaultLoadingPage />}>
            <div>
                <NewsEditor newsId={params.newsID} newsData={dbResults[0]} />
            </div>
        </Suspense>
    );
}
