"use client";

import RichTextEditor from "@/components/editor/editor";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { createNewsPost } from "../_actions";
import { Button } from "@/components/ui/button";
import { useFormState } from "react-dom";
import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";

export default function NewsCreationForm() {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [content, setContent] = useState<string>("");

    const [state, formAction] = useFormState(createNewsPost, {
        message: null,
        error: null,
    });

    return (
        <form
            action={formAction}
            className="bg-white rounded p-4 sm:mx-[2rem] md:mx-[8rem] lg:mx-[10rem]"
        >
            <div className="flex justify-center items-center w-full">
                {state.error ? (
                    <ErrorMessageWindow
                        errorTitle="ERROR"
                        errorMessage={state.error}
                    />
                ) : null}
                {state.message ? (
                    <SuccessMessageWindow operationTitle="Successfully created new post!" />
                ) : null}
            </div>
            <div className="flex gap-3 justify-start items-center">
                <h1 className="text-2xl py-4">Create news post</h1>
                <Button
                    data-cy="confirm-create-button"
                    type="submit"
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    variant="outline"
                    size={"default"}
                    className={`bg-green-200 border border-solid border-black m-1 text-md text-gray-900 rounded backdrop-opacity-60
                    hover:bg-green-800 hover:text-white hover:border-slate-700`}
                >
                    Create
                </Button>
            </div>

            <fieldset className="flex flex-col">
                <legend className="text-2xl py-4">Title</legend>
                <Input
                    data-cy="input-title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </fieldset>
            <fieldset className="flex flex-col">
                <legend className="text-2xl py-4">Description</legend>
                <Input
                    data-cy="input-description"
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
        </form>
    );
}
