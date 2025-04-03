"use client";

import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";

import { createNewFaq } from "../add/_actions";
import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";
import RichTextEditor from "@/components/editor/editor";

export default function AddFaqGuide() {
    const router = useRouter();

    const initialState = {
        message: "",
        error: "",
    };
    const [state, formAction] = useFormState(createNewFaq, initialState);
    const [newContent, setNewContent] = useState<string>("");
    const [newTitle, setNewTitle] = useState<string>("");
    const [editorKey, setEditorKey] = useState<number>(0);

    function cleanAll() {
        setNewContent("");
        setNewTitle("");
        state.error = null;
        state.message = null;
        setEditorKey((prevKey) => prevKey + 1);
    }

    return (
        <div className="p-8 max-w-7xl mx-auto bg-white mt-3">
            <div className="flex flex-col  w-full ">
                <div className="py-1 px-5 md:px-10  sm:flex-row bg-white justify-center items-center">
                    {state.error ? (
                        <div className="flex flex-row justify-center items-center w-full">
                            <ErrorMessageWindow
                                errorTitle="ERROR"
                                errorMessage={state.error}
                            />
                        </div>
                    ) : null}
                    {state.message ? (
                        <div className="flex flex-row justify-center items-center w-full">
                            <SuccessMessageWindow
                                operationTitle={state.message}
                            />
                        </div>
                    ) : null}
                    <div>
                        <h1 className=" py-3 px-5 text-xl underline decoration-solid">
                            Add new faq
                        </h1>
                        <form action={formAction}>
                            <label className="block mt-5 mb-2 text-m text-black">
                                Title:{" "}
                            </label>
                            <input
                                data-cy="new-title-input"
                                name="title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                                className="overflow-auto overflow-y-scroll mt-3 h-10 bg-gray-100 border border-gray-300 text-gray-900 text-sm
                     rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                     whitespace-pre-wrap"
                            />
                            <label className="block mt-5 mb-2 text-m text-black">
                                Content:{" "}
                            </label>

                            <RichTextEditor
                                key={editorKey}
                                content={newContent}
                                setContent={setNewContent}
                            />

                            <input
                                type="hidden"
                                name="content"
                                value={newContent}
                            />

                            <div className="flex flex-col sm:flex-row justify-left gap-1 sm:gap-10 py-3">
                                <button
                                    data-cy="save-faq-guide-button"
                                    onClick={() =>
                                        window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                        })
                                    }
                                    type="submit"
                                    className="py-2 px-4 text-md text-gray-900 rounded
                            bg-gray-200 backdrop-opacity-60
                            hover:bg-white  hover:backdrop-opacity-60 border-2
                            hover:border-solid border-transparent hover:border-slate-700"
                                >
                                    Save
                                </button>

                                <button
                                    data-cy="clean-all-button"
                                    type="button"
                                    className="py-2 px-4 text-md text-gray-900 rounded
                                        bg-gray-200 backdrop-opacity-60
                                      hover:bg-white hover:backdrop-opacity-60 border-2
                                      hover:border-solid border-transparent hover:border-slate-700"
                                    onClick={() => cleanAll()}
                                >
                                    Clean all
                                </button>

                                <button
                                    data-cy="back-to-faq"
                                    type="button"
                                    className="py-2 px-4 text-md text-gray-900 rounded
                                        bg-gray-200 backdrop-opacity-60
                                      hover:bg-white hover:backdrop-opacity-60 border-2
                                      hover:border-solid border-transparent hover:border-slate-700"
                                    onClick={() => {
                                        router.replace("/faq");
                                    }}
                                >
                                    Back to FAQ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
