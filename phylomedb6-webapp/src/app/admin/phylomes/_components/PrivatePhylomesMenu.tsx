"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SessionData } from "@/auth/models/login_sessions";
import { useRouter } from "next/navigation";

import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";
import PhylomeMenuDropdown from "./PhylomeMenuDropdown";

export default function PrivatePhylomesMenu({
    sessionData,
}: {
    sessionData: SessionData | null;
}) {
    const router = useRouter();
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    const [isAddMenuOpen, setAddMenuOpen] = useState(false);
    const [emailSelected, setEmailSelected] = useState("");
    const [selectedPhylome, setSelectedPhylome] = useState("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
    const [phylomesData, setPhylomesData] = useState<{
        [key: string]: Array<string>;
    }>({});
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [oldEmail, setOldEmail] = useState("");

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const searchPhylomeId = useSearchParams();
    let allCurrentPhylomes: Array<string> = [];
    let phylomesRaw = searchPhylomeId.get("selected");

    useEffect(() => {
        const fetchPhylomesData = async () => {
            const newPhylomesData: { [key: number]: Array<string> } = {};
            const resp = await fetch(
                `/api/admin/phylomes?phylome_ids=${JSON.stringify(allCurrentPhylomes)}`,
            );
            const emailsByPhylomeId: {
                phylome_id: number;
                user_email_address: string;
            }[] = await resp.json();

            for (const entry of emailsByPhylomeId) {
                newPhylomesData[entry.phylome_id] =
                    newPhylomesData[entry.phylome_id] || [];
                newPhylomesData[entry.phylome_id].push(
                    entry.user_email_address,
                );
            }
            setPhylomesData(newPhylomesData);
        };

        fetchPhylomesData();
    });

    if (!phylomesRaw) {
        router.push("/");
        return;
    }
    allCurrentPhylomes = JSON.parse(phylomesRaw);

    function handleBackClick() {
        router.push(`/admin/`);
        router.refresh();
    }

    return (
        <div className="flex flex-col gap-3 my-3 w-full items-center">
            {successMessage && (
                <SuccessMessageWindow operationTitle={successMessage} />
            )}
            {errorMessage && <ErrorMessageWindow errorMessage={errorMessage} />}
            <div className="flex py-3 px-3.5 md:px-7 lg:px-14 flex-col sm:flex-col bg-white justify-center items-center content-center border-2 border-slate-300 shadow-md rounded-md w-full">
                <div className="flex py-3 px-5 md:px-10 lg:px-20 flex-col sm:flex-col bg-white justify-center items-center content-center rounded-md lg:w-6/12 sm:w-8/12 my-5">
                    <h1 className="text-3xl underline decoration-solid whitespace-nowrap">
                        Selected private phylomes
                    </h1>
                </div>
                <div className="w-10/12 flex justify-start items-center ">
                    <button
                        data-cy="back-private-phylomes-button"
                        onClick={handleBackClick}
                        className="bg-red-500 text-white font-extrabold text-2xl  px-4 rounded-lg hover:bg-red-600 border-transparent border-2 hover:border-red-700 active:bg-red-700 transition-all duration-300 text-center pb-1 "
                        title="Back"
                    >
                        ←
                    </button>
                </div>
                {allCurrentPhylomes.map((phylomeId) => (
                    <PhylomeMenuDropdown
                        key={phylomeId}
                        phylomeId={phylomeId}
                        setEmailSelectedAction={setEmailSelected}
                        setSelectedPhylomeAction={setSelectedPhylome}
                        selectedPhylome={selectedPhylome}
                        setAddMenuOpenAction={setAddMenuOpen}
                        isAddMenuOpen={isAddMenuOpen}
                        setOldEmailAction={setOldEmail}
                        oldEmail={oldEmail}
                        setIsEditMenuOpenAction={setIsEditMenuOpen}
                        isEditMenuOpen={isEditMenuOpen}
                        isReadOnly={isReadOnly}
                        setIsReadOnlyAction={setIsReadOnly}
                        emailSelected={emailSelected}
                        phylomesData={phylomesData}
                        setPhylomesDataAction={setPhylomesData}
                        setErrorMessageAction={setErrorMessage}
                        setSuccessMessageAction={setSuccessMessage}
                        searchQuery={searchQuery}
                        setSearchQueryAction={setSearchQuery}
                        filteredEmails={filteredEmails}
                        setFilteredEmailsAction={setFilteredEmails}
                    />
                ))}
            </div>
        </div>
    );
}
