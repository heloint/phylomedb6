import NewsDataTable from "./_components/NewsDataTable";

import persistentLocalDb from "@/persistentLocalDb";
import { news } from "@/persistentLocalDb/persistentLocalSchema";
export const metadata = {
    title: "PhylomeDB News",
    description: "The latest news from PhylomeDB.",
};
export default async function Page() {
    const res = await persistentLocalDb.select().from(news);
    return (
        <div>
            <NewsDataTable data={res} />
        </div>
    );
}
