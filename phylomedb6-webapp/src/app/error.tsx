"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex justify-center items-center w-full mt-10">
            <div className="bg-white bg-opacity-50 backdrop-blur-sm p-16 rounded-3xl">
                <ErrorMessageWindow
                    errorTitle="Something went wrong!"
                    errorMessage={`Please visit back later. If the issue still exists, don't hesitate to contact us!`}
                />
                <div className="flex justify-center items-center py-4">
                    <button
                        id={`error-reset-btn`}
                        className="m-1 py-2 px-4 text-lg text-gray-900 rounded
    bg-gray-200 backdrop-opacity-60 hover:bg-white  hover:backdrop-opacity-60 border-2 border-gray-400
    hover:border-solid hover:border-slate-700"
                        onClick={() => reset()}
                    >
                        Try again
                    </button>
                </div>
            </div>
        </div>
    );
}
