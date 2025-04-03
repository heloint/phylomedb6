"use client";

import { useEffect, useState } from "react";
import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SequenceDatatable from "./SequenceTable";
import LoadingSpinner1 from "@/components/loading-spinner/LoadingSpinner1";

export default function SequenceSearch() {
    const [searchSequenceValue, setSearchSequenceValue] = useState<string>("");
    const [errorText, setErrorText] = useState<string>("");
    const [sequenceData, setSequenceData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedSequence = localStorage.getItem("query_sequence");
        if (savedSequence) {
            setSearchSequenceValue(savedSequence);
            doSearchBySequence(savedSequence);

            localStorage.removeItem("query_sequence");
        }
    }, []);

    const doSearchBySequence = async (sequenceValue: string) => {
        if (!sequenceValue) {
            return;
        }

        // TODO: Sanitize here the sequence search input
        debugger;
        const isCorrectSequence = isValidProteinSequence(sequenceValue);
        if (!isCorrectSequence) {
            setErrorText(
                "The given sequence must be a valid protein sequence.",
            );
            return;
        }
        setIsLoading(true);

        try {
            const submit_response = await fetch(`/search-by-sequence`, {
                method: "POST",
                cache: "no-store",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query_sequence: sequenceValue }),
            });
            const submit_data = await submit_response.json();
            const submittedJobId: number = submit_data["submitted_job_id"];
            const directoryUuid: string = submit_data["directory_uuid"];
            const historySearch = localStorage.getItem("history");

            localStorage.removeItem("history");

            let isProcessing = true;
            let data = null;

            while (isProcessing) {
                const response = await fetch(
                    `/search-by-sequence/${submittedJobId}/${directoryUuid}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        credentials: "include",
                    },
                );

                if (response.status === 202) {
                    // Still processing; wait before polling again
                    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
                } else if (response.ok) {
                    if (historySearch !== "true") {
                        await fetch(
                            `/api/search/history/history?searchSequenceValue=${sequenceValue}`,
                            { cache: "no-store" },
                        );
                    }

                    // Successfully retrieved final result
                    data = await response.json();
                    isProcessing = false; // Stop polling
                } else {
                    // Handle error responses
                    throw new Error(
                        "An error occurred while processing the request.",
                    );
                }
            }

            setSequenceData(data);
            setErrorText(""); // Clear any previous error message
        } catch (error: any) {
            if (error.message.includes("Unexpected token")) {
                setErrorText("An error occurred while processing the request.");
            } else {
                setErrorText(error.message || "An error occurred");
            }
        } finally {
            setIsLoading(false); // Stop loading spinner
        }
    };

    const handleFileReading = (event: any) => {
        const file = event.target.files[0];
        const maxSize = 3 * 1024 * 1024;
        if (file) {
            if (file.size > maxSize) {
                setSearchSequenceValue("");
                setErrorText("The maximum allowable file size is 3 MB.");
                return;
            }
            setErrorText("");
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result;
                setSearchSequenceValue(content as string);
            };
            reader.readAsText(file);
        }
    };

    return (
        <>
            <div className="min-w-[75%] max-w-lg mx-auto px-4 gap-20">
                <label className="block mt-5 mb-2 text-m text-black">
                    <u>
                        <b>Upload sequence from file:</b>
                    </u>{" "}
                </label>
                <input
                    className="block w-full mb-5 md:text-lg  text-xs sm:text-sm text-gray-900  border-gray-300 border rounded-md cursor-pointer ps-[0.6px]  bg-gray-50"
                    type="file"
                    onChange={handleFileReading}
                />
                <label className="block mt-5 mb-2 text-m text-black ">
                    <u>
                        <b>or paste here:</b>
                    </u>
                </label>

                <textarea
                    data-cy="sequence-textarea-input"
                    value={searchSequenceValue}
                    onChange={(e) => setSearchSequenceValue(e.target.value)}
                    required
                    className="overflow-auto h-40 bg-gray-100 border-2 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 whitespace-pre-wrap"
                    placeholder=""
                    wrap="soft"
                />

                <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-10 py-3">
                    <button
                        data-cy="search-sequence-button"
                        type="button"
                        className="py-2 px-4 text-md text-gray-900 rounded bg-green-200 backdrop-opacity-60 hover:bg-green-400 hover:backdrop-opacity-60 border-2 hover:border-solid border-gray-400 hover:border-gray-700"
                        onClick={() => doSearchBySequence(searchSequenceValue)}
                    >
                        Search
                    </button>
                    <button
                        data-cy="add-test-sequence-search-button"
                        type="button"
                        className="py-2 px-4 text-md text-gray-900 rounded bg-blue-200 backdrop-opacity-60 hover:bg-blue-400 hover:backdrop-opacity-60 border-2 hover:border-solid border-gray-400 hover:border-gray-700"
                        onClick={() =>
                            setSearchSequenceValue(
                                "MAQSTATSPDGGTTFEHLWSSLEPDSTYFDLPQSSRGNNEVVGGTDSSMDVFHLEGMTTSVMAQFNLLSSTMDQMSSRAASASPYTPEHAASVPTHSPYAQPSSTFDTMSPAPVIPSNTDYPGPHHFEVTFQQSSTAKSATWTYSPLLKKLYCQIAKTCPIQIKVSTPPPPGTAIRAMPVYKKAEHVTDVVKRCPNHELGRDFNEGQSAPASHLIRVEGNNLSQYVDDPVTGRQSVVVPY",
                            )
                        }
                    >
                        Add test sequence
                    </button>

                    <button
                        type="button"
                        className="py-2 px-4 text-md text-gray-900 rounded bg-red-200 backdrop-opacity-60 hover:bg-red-400 hover:backdrop-opacity-60 border-2 hover:border-solid border-gray-400 hover:border-gray-700"
                        onClick={() => setSearchSequenceValue("")}
                    >
                        Clean
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center gap-10">
                    <p>
                        <i>
                            * Your search has been queued. Depending on the
                            current load, this might take some time.
                        </i>
                    </p>
                    <LoadingSpinner1 />
                </div>
            ) : (
                <SearchResultDisplay
                    errorText={errorText}
                    sequenceData={sequenceData}
                />
            )}
        </>
    );
}

function SearchResultDisplay(params: {
    errorText: string;
    sequenceData: any[];
}) {
    return (
        <div>
            {params.errorText ? (
                <div className="flex justify-center items-center p-6">
                    <ErrorMessageWindow
                        errorTitle={params.errorText}
                        errorMessage=""
                    />
                </div>
            ) : params.sequenceData && params.sequenceData.length > 0 ? (
                <div className="">
                    <SequenceDatatable sequenceData={params.sequenceData} />
                </div>
            ) : null}
        </div>
    );
}

function isValidProteinSequence(sequence: string): boolean {
    // Valid characters: standard amino acids, ambiguous residues, stop codon, and whitespace.
    const validProteinRegex =
        /^[acdefghiklmnpqrstvwybuzoxjACDEFGHIKLMNPQRSTVWYBUZOXJ*\s]+$/i;
    return validProteinRegex.test(sequence);
}
