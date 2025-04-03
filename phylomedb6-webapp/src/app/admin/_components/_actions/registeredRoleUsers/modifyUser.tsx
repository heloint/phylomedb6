import { RefObject, SetStateAction } from "react";
import { Dispatch } from "react";
import { PhylomeAllowedUserData } from "@/_models/admin/phylomes/privatePhylomesRelations";

export function ModifyUserDataMenu({
    setActionMenuNum,
    closeCross,
    userSelected,
    newName,
    setNewName,
    nameField,
    emailField,
    newEmail,
    setIsOpenOptionsEmailMenu,
    phylomesData,
    setPhylomesData,
    setSuccessMessage,
    setErrorMessage,
    setUserSelected,
    setNewEmail,
}: {
    newName: string;
    newEmail: string;
    setIsOpenOptionsEmailMenu: Dispatch<SetStateAction<boolean>>;
    setActionMenuNum: Dispatch<SetStateAction<number>>;
    closeCross: JSX.Element;
    nameField: RefObject<HTMLInputElement>;
    emailField: RefObject<HTMLInputElement>;
    setNewName: Dispatch<SetStateAction<string>>;
    setNewEmail: Dispatch<SetStateAction<string>>;
    userSelected: { email: string; name: string | null };
    phylomesData: PhylomeAllowedUserData[];
    setPhylomesData: Dispatch<PhylomeAllowedUserData[]>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    setUserSelected: Dispatch<
        SetStateAction<{ email: string; name: string | null }>
    >;
}) {
    async function confirmAction() {
        const name = nameField.current ? nameField.current.value : "";
        const email = emailField.current ? emailField.current.value : "";
        if (userSelected.name == name && userSelected.email == email) {
            alert("Error: The user can't be the same.");
            return;
        }

        let resp = await fetch("/api/admin/phylomes", {
            method: "POST",
            body: JSON.stringify({
                user_email_address: userSelected.email,
                new_name: name,
                new_email: email,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (resp.status !== 200 || !resp.ok) {
            setSuccessMessage("");
            setErrorMessage(`Error the email ${email} already exists`);
            setActionMenuNum(-1);
            setIsOpenOptionsEmailMenu(false);
            return;
        }
        const updateUserData = (email: string, name: string) => {
            setPhylomesData(
                phylomesData.map((data) =>
                    data.user_email_address === userSelected.email
                        ? {
                              ...data,
                              user_email_address: email ?? null,
                              user_full_name: name ?? null,
                          }
                        : data,
                ),
            );
        };
        updateUserData(email, name);

        setSuccessMessage(`User ${userSelected.email} modified successfully`);
        setErrorMessage("");

        setUserSelected(() => ({
            email: email,
            name: name,
        }));

        setActionMenuNum(-1);
        setIsOpenOptionsEmailMenu(false);
        return;
    }

    return (
        <div>
            {/* Name settings menu */}

            <div>
                <div>
                    <div className="fixed inset-0  bg-white bg-opacity-30 flex justify-center ">
                        <div
                            className="bg-white p-5 rounded-md border-2 border-slate-300 shadow-lg w-96 h-fit relative mb-16 top-96"
                            style={{
                                top:
                                    window.innerWidth >= 768
                                        ? `${window.scrollY + 100}px`
                                        : `150px`,
                            }}
                        >
                            {/* Close button */}
                            <button
                                title="close"
                                onClick={() => {
                                    setActionMenuNum(-1);
                                }}
                                className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 hover:scale-105 hover:bg-red-100"
                            >
                                {closeCross}
                            </button>

                            <h2 className="text-lg font-semibold mb-4">
                                User Settings
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    confirmAction();
                                    e.preventDefault();
                                }}
                            >
                                <div className="flex justify-center w-full">
                                    <input
                                        data-cy="new-email-input"
                                        title="User email"
                                        name="email-input"
                                        className="border-2 p-2 w-full rounded-md  border-slate-300 shadow-lg"
                                        type="email"
                                        placeholder="New email"
                                        value={newEmail}
                                        onChange={(e) =>
                                            setNewEmail(e.target.value)
                                        }
                                        ref={emailField}
                                        required
                                        minLength={2}
                                    />
                                </div>
                                <div className="flex justify-center mt-1 w-full">
                                    <input
                                        data-cy="new-name-input"
                                        title="User name"
                                        name="name input"
                                        className="border-2 w-full rounded-md p-2 border-slate-300 shadow-lg"
                                        type="text"
                                        placeholder="New name"
                                        value={newName}
                                        onChange={(e) =>
                                            setNewName(e.target.value)
                                        }
                                        ref={nameField}
                                        minLength={2}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        data-cy="modify-user-back-button"
                                        type="submit"
                                        className="bg-gray-500 text-white py-2 px-4 mt-2 rounded-md w-full hover:bg-gray-600 border-transparent border-2 hover:border-gray-700 "
                                        title="Back"
                                        onClick={() => {
                                            setActionMenuNum(-1),
                                                setIsOpenOptionsEmailMenu(true);
                                        }}
                                    >
                                        <p>back</p>
                                    </button>
                                    <button
                                        data-cy="confirm-modify-user-button"
                                        type="submit"
                                        className="bg-blue-500 text-white py-2 px-4 mt-2 rounded-md w-full  hover:bg-blue-600 border-transparent border-2 hover:border-blue-700"
                                        title="Confirm modification"
                                    >
                                        <p>Confirm</p>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
