"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";

import ErrorMessage from "@/components/errorMessage/errorMessage";
import { GuideItem } from "./faqPage";
import { FaqOption } from "../_models/faq";
import { useFormState } from "react-dom";
import { editFaqGuide } from "../edit/[guideId]/_actions";
import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";
import RichTextEditor from "@/components/editor/editor";

type EditPageParams = {
    faqOption: FaqOption;
};
export default function EditUserGuide(params: EditPageParams) {
    const router = useRouter();
    const initialState = {
        message: "",
        error: "",
    };
    const [faqItem, setFaqItem] = useState<GuideItem>(params.faqOption);
    const [editedFaqContent, setEditedFaqContent] = useState<string>(
        params.faqOption.content,
    );
    const [editedFaqTitle, setEditedFaqTitle] = useState<string>(
        params.faqOption.title,
    );

    const [state, formAction] = useFormState(editFaqGuide, initialState);
    const [editorKey, setEditorKey] = useState<number>(0);

    function cleanAll() {
        setEditedFaqContent("");
        setEditedFaqTitle("");
        setEditorKey((prevKey) => prevKey + 1);
        state.error = "";
        state.message = "";
    }

    return (
        <div className=" flex flex-col gap-3 my-3 w-full ">
            <div className="py-3 px-5 md:px-10 lg:px-20 sm:flex-row bg-white justify-center items-center">
                <div className="flex flex-row justify-center items-center w-full">
                    {state.error ? (
                        <ErrorMessageWindow
                            errorTitle="ERROR"
                            errorMessage={state.error}
                        />
                    ) : null}

                    {state.message ? (
                        <SuccessMessageWindow operationTitle={state.message} />
                    ) : null}
                </div>

                <h1 className="text-xl underline decoration-solid">
                    Editing: {editedFaqTitle}
                </h1>

                <form action={formAction}>
                    <label className="block mt-5 mb-2 text-m text-black">
                        Title:{" "}
                    </label>
                    <input
                        name="id"
                        value={faqItem?.id.toString()}
                        placeholder={faqItem?.id.toString()}
                        className="hidden"
                    />
                    <input
                        data-cy="modify-title-input"
                        name="title"
                        value={editedFaqTitle}
                        onChange={(e) => setEditedFaqTitle(e.target.value)}
                        placeholder={faqItem?.title}
                        className="overflow-auto overflow-y-scroll mt-3 h-10 bg-gray-100 border border-gray-300 text-gray-900 text-sm
                     rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                     whitespace-pre-wrap"
                    />
                    <label className="block mt-5 mb-2 text-m text-black">
                        Content:{" "}
                    </label>

                    <RichTextEditor
                        key={editorKey}
                        content={editedFaqContent}
                        setContent={setEditedFaqContent}
                    />

                    <input
                        type="hidden"
                        name="content"
                        value={editedFaqContent}
                    />

                    <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-10 py-3">
                        <button
                            data-cy="save-faq-guide-button"
                            name="action"
                            value="edit"
                            type="submit"
                            className={`py-2 px-4 text-md text-gray-900 rounded
                  bg-gray-200 backdrop-opacity-60
                  hover:bg-white hover:backdrop-opacity-60 border-2
                  hover:border-solid border-transparent hover:border-slate-700
                  ${
                      state.message === "Successfully deleted faq guide!"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                  }`}
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        >
                            Save
                        </button>

                        <button
                            data-cy="clean-inputs-button"
                            type="button"
                            className={`py-2 px-4 text-md text-gray-900 rounded
                  bg-gray-200 backdrop-opacity-60
                  hover:bg-white hover:backdrop-opacity-60 border-2
                  hover:border-solid border-transparent hover:border-slate-700
                  ${
                      state.message === "Successfully deleted faq guide!"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                  }`}
                            onClick={() => cleanAll()}
                        >
                            Clean
                        </button>

                        <button
                            data-cy="back-button"
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

                        <button
                            data-cy="delete-guide-button"
                            type="submit"
                            name="action"
                            value="delete"
                            className={`py-2 px-4 text-md text-gray-900 rounded
                  bg-gray-200 backdrop-opacity-60
                  hover:bg-white hover:backdrop-opacity-60 border-2
                  hover:border-solid border-transparent hover:border-slate-700
                  ${
                      state.message === "Successfully deleted faq guide!"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                  }`}
                        >
                            Delete this info
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
