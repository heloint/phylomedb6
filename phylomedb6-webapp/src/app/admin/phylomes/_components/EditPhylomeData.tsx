import { Dispatch, RefObject, SetStateAction } from "react";

export default function EditPhylomeMenu({
    isEditMenuOpen,
    setIsEditMenuOpenAction,
    isReadOnly,
    setIsReadOnlyAction,
    closeCross,
    setEmailSelectedAction,
    emailSelected,
    emailInputRef,
    oldEmail,
    selectedPhylome,
    setSuccessMessageAction,
    setErrorMessageAction,
    setPhylomesDataAction,
    setFilteredEmailsAction,
}: {
    isEditMenuOpen: boolean;
    setIsEditMenuOpenAction: Dispatch<SetStateAction<boolean>>;
    isReadOnly: boolean;
    setIsReadOnlyAction: Dispatch<SetStateAction<boolean>>;
    closeCross: JSX.Element;
    setEmailSelectedAction: Dispatch<SetStateAction<string>>;
    emailSelected: string;
    emailInputRef: RefObject<HTMLInputElement>;
    oldEmail: string;
    selectedPhylome: string;
    setSuccessMessageAction: Dispatch<SetStateAction<string>>;
    setErrorMessageAction: Dispatch<SetStateAction<string>>;
    setPhylomesDataAction: Dispatch<
        SetStateAction<{ [key: string]: Array<string> }>
    >;
    setFilteredEmailsAction: Dispatch<SetStateAction<string[]>>;
}) {
    const handleClickDeleteEmail = async () => {
        if (!isReadOnly) {
            setIsReadOnlyAction(true);
            return;
        }
        let resp = await fetch(
            `/api/admin/phylomes?user_email_address=${emailSelected}&phylome_id=${selectedPhylome}`,
            {
                method: "DELETE",
            },
        );

        if (!resp.ok || resp.status !== 200) {
            setSuccessMessageAction("");
            setErrorMessageAction(`Error deleting ${emailSelected}.`);
            setIsEditMenuOpenAction(!isEditMenuOpen);
            return;
        }

        setPhylomesDataAction((prevData) => {
            const updatedPhylomesData = { ...prevData };
            updatedPhylomesData[selectedPhylome] = updatedPhylomesData[
                selectedPhylome
            ].filter((email) => email !== emailSelected);
            return updatedPhylomesData;
        });
        setSuccessMessageAction(`${emailSelected} deleted succesfully`);
        setErrorMessageAction("");
        setIsEditMenuOpenAction(!isEditMenuOpen);
    };

    const handleModifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) {
            setIsReadOnlyAction(!isReadOnly);
            return;
        }
        if (
            !emailInputRef.current ||
            emailInputRef.current.value === oldEmail
        ) {
            alert("Email cannot be the same!");
            return;
        }
        setEmailSelectedAction(emailInputRef.current.value);
        const emailCurrent = emailInputRef.current.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailCurrent)) {
            setEmailSelectedAction(oldEmail);
            alert("Please enter a valid email address");
            return;
        }

        const resp = await fetch("/api/admin/phylomes", {
            method: "POST",
            body: JSON.stringify({
                new_email: emailCurrent,
                user_email_address: oldEmail,
                phylome_id: `${selectedPhylome}`,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!resp.ok || resp.status !== 200) {
            setSuccessMessageAction("");
            setErrorMessageAction(
                `Error modifying ${oldEmail} , email ${emailCurrent} already existing.`,
            );
            setIsEditMenuOpenAction(!isEditMenuOpen);
            return;
        }

        setPhylomesDataAction((prevData) => {
            const updatedPhylomesData = { ...prevData };
            const emailIndex =
                updatedPhylomesData[selectedPhylome].indexOf(oldEmail);
            if (emailIndex === -1) {
                return prevData;
            }
            updatedPhylomesData[selectedPhylome][emailIndex] = emailCurrent;
            return updatedPhylomesData;
        });
        setFilteredEmailsAction((prevFilteredEmails) => {
            return prevFilteredEmails.map((email) =>
                email === oldEmail ? emailCurrent : email,
            );
        });
        setSuccessMessageAction(
            `${oldEmail} modified succesfully to ${emailCurrent}`,
        );
        setErrorMessageAction("");
        setIsReadOnlyAction(!isReadOnly);

        setIsEditMenuOpenAction(!isEditMenuOpen);
    };

    return (
        <div>
            <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center ">
                <div
                    className="bg-white p-5 rounded-md border-2 border-slate-300 shadow-lg w-96 h-fit relative mb-16 top-96"
                    style={{
                        top:
                            window.innerWidth >= 768
                                ? `${window.scrollY + 200}px`
                                : `150px`,
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={() => {
                            setIsEditMenuOpenAction(!isEditMenuOpen);
                            setIsReadOnlyAction(true);
                        }}
                        className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 hover:scale-105 hover:bg-red-100"
                    >
                        {closeCross}
                    </button>

                    {/* Modal content */}
                    <h2 className="text-lg font-semibold mb-4">
                        Email Settings
                    </h2>
                    <form onSubmit={handleModifyEmail}>
                        <input
                            data-cy="modify-email-input"
                            type="email"
                            placeholder="Enter new email"
                            className="w-full border p-2 border-slate-300 shadow-md rounded-md mb-4"
                            readOnly={isReadOnly}
                            ref={emailInputRef}
                            value={isReadOnly ? emailSelected : undefined}
                            title="Modify email"
                            required
                        />

                        <button
                            data-cy="modify-email-button"
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded-md w-full hover:bg-blue-600 border-transparent border-2 hover:border-blue-700"
                            title="Modify email"
                        >
                            {isReadOnly ? "Modify" : "Save"}
                        </button>
                        <button
                            data-cy="delete-email-from-phylome-button"
                            type="button"
                            className="bg-red-500 text-white py-2 px-4 mt-2 rounded-md w-full  hover:bg-red-600 border-transparent border-2 hover:border-red-700"
                            onClick={handleClickDeleteEmail}
                            title="Delete email"
                        >
                            {isReadOnly ? "Delete" : "Back"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
