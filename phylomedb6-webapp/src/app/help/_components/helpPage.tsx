"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HelpOption } from "../_models/help";
import { useSearchParams } from "next/navigation";

export type GuideItem = {
    id: number;
    title: string;
    content: string;
};
type HelpPageParams = { helpOptions: HelpOption[]; admin: boolean };

export default function HelpPage(params: HelpPageParams) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [adminContent, setAdminContent] = useState(params.admin);
    const [helpItems, setHelpItems] = useState<GuideItem[]>([]);
    const [firstClick, setFirstClick] = useState<boolean>();

    const searchedTitle = searchParams.get("title");
    const [visibleContent, setVisibleContent] = useState<
        Record<string, boolean>
    >(searchedTitle ? { [searchedTitle]: true } : {});

    useEffect(() => {
        const fetchedHelpItems = params.helpOptions.map((position) => ({
            id: position.id,
            title: position.title,
            content: position.content,
        }));
        setHelpItems(fetchedHelpItems);

        const collapsedContents = fetchedHelpItems.reduce(
            (acc, obj) => {
                if (!visibleContent[obj.title]) {
                    acc[obj.title] = false;
                }
                return acc;
            },
            {} as Record<string, boolean>,
        );
        const extendedVisibleContents = {
            ...visibleContent,
            ...collapsedContents,
        };
        setVisibleContent(extendedVisibleContents);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    const showAllGuides = () => {
        const updatedContent: Record<string, boolean> = {}; // to create new empty record
        if (!firstClick) {
            setFirstClick(true);
            Object.keys(visibleContent).forEach((key) => {
                updatedContent[key] = true;
            });
        } else {
            setFirstClick(false);
            Object.keys(visibleContent).forEach((key) => {
                updatedContent[key] = false;
            });
        }
        setVisibleContent(updatedContent);
    };

    const changeContentVisibility = (title: string) => {
        // changing visibility of each guide content
        setVisibleContent((prevVisibleContent) => ({
            ...prevVisibleContent,
            [title]: !prevVisibleContent[title],
        }));
    };

    return (
        <div className="flex flex-col gap-3 my-3  w-full">
            <div className="py-3 px-5 md:px-10 lg:px-20 sm:flex-row bg-white justify-center items-center">
                <h1 className="text-xl underline decoration-solid">
                    PhylomeDB User Guide
                </h1>
                <div className=" flex flex-col sm:flex-row  align-center">
                    <button
                        className="flex my-2 sm:my-5 sm:mr-3 w-36 h-10 pt-30 p-2 text-md text-gray-900 rounded-md justify-center items-center
          bg-gray-200 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60
          border-2 hover:border-solid border-transparent hover:border-slate-700"
                        onClick={() => showAllGuides()}
                    >
                        Show/hide all
                    </button>

                    {adminContent ? (
                        <button
                            data-cy="add-new-guide-button"
                            className="flex my-2 sm:my-5 sm:mr-3 w-36 h-10 pt-30 p-2 text-md text-gray-900 rounded-md justify-center items-center
          bg-gray-200 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60
          border-2 hover:border-solid border-transparent hover:border-slate-700"
                            onClick={() => {
                                router.replace(`/help/add`);
                            }}
                        >
                            Add new guide
                        </button>
                    ) : null}
                </div>
                <div className="tiptap">
                    {helpItems.map((item) => (
                        <div
                            key={item.title}
                            className="my-5 text-gray-900 text-left rounded "
                        >
                            <div className="flex flex-row">
                                <button
                                    className={` flex h-full text-left p-2 rounded-md
                           bg-gray-200 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60 border-2
                           hover:border-solid border-transparent hover:border-slate-700
                            ${adminContent ? "w-5/6" : "w-full"}`}
                                    onClick={() =>
                                        changeContentVisibility(item.title)
                                    }
                                >
                                    {item.title}
                                </button>

                                {adminContent ? (
                                    <button
                                        data-cy="edit-button"
                                        custom-value={item.id}
                                        className="mx-0.5 flex h-full w-1/6 text-left p-2 rounded-md justify-center items-center
                           bg-gray-200 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60 border-2
                           hover:border-solid border-transparent hover:border-slate-700"
                                        onClick={() => {
                                            router.replace(
                                                `/help/edit/${item.id}`,
                                            );
                                        }}
                                    >
                                        Edit
                                    </button>
                                ) : null}
                            </div>

                            {visibleContent[item.title] && (
                                <div
                                    className="p-2 text-sm flex flex-col h-full text-left rounded-md justify-start items-start"
                                    dangerouslySetInnerHTML={{
                                        __html: item.content,
                                    }}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
