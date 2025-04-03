import { Dispatch, RefObject, SetStateAction } from "react";

export default function AddEmailMenu({
    setAddMenuOpenAction,
    isAddMenuOpen,
    closeCross,
    selectedPhylome,
    emailInputRef,
    setEmailSelectedAction,
    phylomesData,
    setSuccessMessageAction,
    setErrorMessageAction,
    setPhylomesDataAction,
}: {
    setAddMenuOpenAction: Dispatch<SetStateAction<boolean>>;
    isAddMenuOpen: boolean;
    selectedPhylome: string;
    setEmailSelectedAction: Dispatch<SetStateAction<string>>;
    phylomesData: { [key: string]: Array<string> };
    setErrorMessageAction: Dispatch<SetStateAction<string>>;
    setSuccessMessageAction: Dispatch<SetStateAction<string>>;
    setPhylomesDataAction: Dispatch<
        SetStateAction<{ [key: string]: Array<string> }>
    >;
    closeCross: JSX.Element;
    emailInputRef: RefObject<HTMLInputElement>;
}) {
    const handleClickConfirmAddEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInputRef.current) {
            setAddMenuOpenAction(!isAddMenuOpen);
            return;
        }

        setEmailSelectedAction(emailInputRef.current.value);
        const emailCurrent = emailInputRef.current.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailCurrent)) {
            alert("Please enter a valid email address");
            setEmailSelectedAction("");
            return;
        }

        const isEmailDuplicate =
            phylomesData[selectedPhylome]?.includes(emailCurrent);
        if (isEmailDuplicate) {
            alert("This email is already added.");
            setEmailSelectedAction("");
            return;
        }

        const resp = await fetch("/api/admin/phylomes", {
            method: "POST",
            body: JSON.stringify({
                user_email_address: emailCurrent,
                phylome_id: `${selectedPhylome}`,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!resp.ok || resp.status !== 200) {
            setSuccessMessageAction("");
            setErrorMessageAction(`Error adding ${emailCurrent}.`);
            return;
        }
        setAddMenuOpenAction(!isAddMenuOpen);
        setPhylomesDataAction((prevData) => {
            const updatedPhylomesData = { ...prevData };
            if (!updatedPhylomesData[selectedPhylome]) {
                updatedPhylomesData[selectedPhylome] = [];
            }

            updatedPhylomesData[selectedPhylome].push(emailCurrent);
            return updatedPhylomesData;
        });
        setSuccessMessageAction(`${emailCurrent} added succesfully`);
        setErrorMessageAction("");
    };
    return (
        <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center border-slate-300   ">
            <div
                className="bg-white p-6 rounded-md border-2  border-slate-300  shadow-lg w-96 h-fit relative "
                style={{
                    top:
                        window.innerWidth >= 768
                            ? `${window.scrollY + 200}px`
                            : `230px`,
                }}
            >
                {/* Close button */}
                <button
                    onClick={() => setAddMenuOpenAction(!isAddMenuOpen)}
                    className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 hover:bg-red-100"
                >
                    {closeCross}
                </button>

                {/* add content */}
                <h2 className="text-lg font-semibold mb-4">
                    Phylome {selectedPhylome}
                </h2>
                <form onSubmit={handleClickConfirmAddEmail}>
                    <input
                        data-cy="add-new-email-input"
                        type="email"
                        placeholder="Add email"
                        ref={emailInputRef}
                        className="w-full border p-2 border-slate-300  rounded-md mb-4"
                        title="Add new email"
                        required
                    />
                    <button
                        data-cy="confirm-add-new-email-button"
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded-md w-full  hover:bg-blue-600 border-transparent border-2 hover:border-blue-700"
                        title="Add email"
                    >
                        Add email
                    </button>
                </form>
            </div>
        </div>
    );
}
