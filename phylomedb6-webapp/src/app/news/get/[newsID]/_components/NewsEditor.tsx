"use client";

import RichTextEditor from "@/components/editor/editor";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

import { deleteNewsPost, updateNewsPost } from "../_actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";

type NewsData = {
    title: string;
    description: string;
    content: string;
};

export default function NewsEditor({
    newsId,
    newsData,
}: {
    newsId: number;
    newsData: NewsData;
}) {
    const [title, setTitle] = useState<string>(newsData.title);
    const [description, setDescription] = useState<string>(
        newsData.description,
    );
    const [content, setContent] = useState<string>(newsData.content);

    const [updateState, updateFormAction] = useFormState(updateNewsPost, {
        message: null,
        error: null,
    });

    const [deleteState, deleteFormAction] = useFormState(deleteNewsPost, {
        error: null,
    });

    useEffect(() => {
        const a = document.querySelector("#news-editor-container .tiptap");
        if (!a) {
            return;
        }
        a.innerHTML = content;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            id="news-editor-container"
            className="bg-white rounded p-4 sm:mx-[2rem] md:mx-[8rem] lg:mx-[10rem]"
        >
            <input type="hidden" name="id" value={newsId} />
            <div className="flex justify-center items-center w-full">
                {updateState.error ? (
                    <ErrorMessageWindow
                        errorTitle="ERROR"
                        errorMessage={updateState.error}
                    />
                ) : null}
                {updateState.message ? (
                    <SuccessMessageWindow operationTitle="Successfully update post!" />
                ) : null}
                {deleteState.error ? (
                    <ErrorMessageWindow
                        errorTitle="ERROR"
                        errorMessage={deleteState.error}
                    />
                ) : null}
            </div>
            <div className="flex flex-col gap-1 items-start justify-center">
                <div className="flex gap-3 justify-start items-center">
                    <h1 className="text-2xl py-4">NEWS</h1>
                    <form action={updateFormAction}>
                        <input type="hidden" name="id" value={newsId} />
                        <input type="hidden" name="title" value={title} />
                        <input
                            type="hidden"
                            name="description"
                            value={description}
                        />
                        <input type="hidden" name="content" value={content} />
                        <Button
                            data-cy="update-button"
                            type="submit"
                            variant="outline"
                            size={"default"}
                            className={`bg-green-200 border border-solid border-black m-1 text-md text-gray-900 rounded backdrop-opacity-60
                        hover:bg-green-800 hover:text-white hover:border-slate-700`}
                        >
                            Update
                        </Button>
                    </form>

                    <form action={deleteFormAction}>
                        <input type="hidden" name="id" value={newsId} />
                        <Button
                            data-cy="delete-button"
                            type="submit"
                            variant="outline"
                            size={"default"}
                            className={`bg-red-200 border border-solid border-black m-1 text-md text-gray-900 rounded backdrop-opacity-60
                        hover:bg-red-800 hover:text-white hover:border-slate-700`}
                        >
                            Delete
                        </Button>
                    </form>
                </div>
                <h2 className="text-2xl py-4">{newsData.title}</h2>
            </div>
            <fieldset className="flex flex-col">
                <legend className="text-2xl py-4">Title</legend>
                <Input
                    data-cy="title-input"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </fieldset>
            <fieldset className="flex flex-col">
                <legend className="text-2xl py-4">Description</legend>
                <Input
                    data-cy="description-input"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input type="hidden" name="description" value={description} />
            </fieldset>
            <fieldset className="flex flex-col">
                <legend className="text-2xl py-4">Content</legend>
                <RichTextEditor
                    data-cy="content-input"
                    content={content}
                    setContent={setContent}
                />
                <input type="hidden" name="content" value={content} />
            </fieldset>
        </div>
    );
}
