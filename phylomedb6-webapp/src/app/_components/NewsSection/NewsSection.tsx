import Box2 from "@/components/box2/box1";
import persistentLocalDb from "@/persistentLocalDb";
import { news } from "@/persistentLocalDb/persistentLocalSchema";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type NewsSectionParams = {
    newsLimit: number;
    admin: boolean;
};
export default async function NewsSection({
    newsLimit,
    admin,
}: NewsSectionParams) {
    const res = await persistentLocalDb.select().from(news).limit(newsLimit);
    return (
        <div className="w-full p-9 bg-slate-200 bg-opacity-75 rounded-lg">
            <div className="flex flex-col-reverse md:flex-row justify-center items-center">
                <h1 className="flex justify-center items-center gap-5 text-3xl py-4 text-center w-full">
                    <img
                        alt="phylo explorer matrix"
                        width={70}
                        height={70}
                        src="/icons/news-icon.webp"
                        className="opacity-50"
                    />
                    <span className="underline text-blue-700 font-bold font-mono">
                        <a href="/news/all">NEWS</a>
                    </span>
                </h1>

                {admin && (
                    <Button
                        data-cy="new-post-news-button"
                        variant="outline"
                        size="lg"
                        className="m-1 py-2 px-4 text-md text-gray-900 rounded bg-green-300 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60 border-2 border-black hover:border-gray-400"
                    >
                        <Link href="/news/create">New post</Link>
                    </Button>
                )}
            </div>
            <div className="grid gap-6">
                {res.map((content, idx) => (
                    <Box2 key={idx} extraClasses="flex flex-col gap-3">
                        <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">
                                <a
                                    data-cy="title-link"
                                    custom-value={content.id}
                                    className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                                    href={`/news/get/${content.id}`}
                                >
                                    {content.title}
                                </a>
                            </h3>
                            <h4 className="text-sm">{content.timestamp}</h4>
                        </div>
                        <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
                        <p>{content.description}</p>
                        <a
                            data-cy="more-info-news"
                            custom-value={content.id}
                            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                            href={`/news/get/${content.id}`}
                        >
                            ...more info
                        </a>
                    </Box2>
                ))}
            </div>
        </div>
    );
}
