import { RefObject, SetStateAction } from "react";
import { Dispatch } from "react";
import { PhylomeAllowedUserData } from "@/_models/admin/phylomes/privatePhylomesRelations";

export function ModifyUsernameMenu({
    actionMenuNum,
    setActionMenuNum,
    closeCross,
    userSelected,
    newName,
    setNewName,
    nameField,
    setIsOpenOptionsEmailMenu,
    setPhylomesData,
    phylomesData,
    setSuccessMessage,
    setErrorMessage,
    setUserSelected,
}: {
    newName: string;
    setIsOpenOptionsEmailMenu: Dispatch<SetStateAction<boolean>>;
    setActionMenuNum: Dispatch<SetStateAction<number>>;
    actionMenuNum: number;
    closeCross: JSX.Element;
    nameField: RefObject<HTMLInputElement>;
    setNewName: Dispatch<SetStateAction<string>>;
    userSelected: { email: string; name: string | null };
    setPhylomesData: Dispatch<PhylomeAllowedUserData[]>;
    phylomesData: PhylomeAllowedUserData[];
    setErrorMessage: Dispatch<SetStateAction<string>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    setUserSelected: Dispatch<
        SetStateAction<{ email: string; name: string | null }>
    >;
}) {
    async function confirmAction(action: string) {
        if (action == "addName") {
            const name = nameField.current ? nameField.current.value : "";
            if (name == userSelected.name) {
                alert("Error Name can't be the same");
                return;
            }
            let resp = await fetch("/api/admin/phylomes", {
                method: "POST",
                body: JSON.stringify({
                    user_email_address: userSelected.email,
                    new_name: name,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (resp.status !== 200 || !resp.ok) {
                setSuccessMessage("");
                setErrorMessage(`Error name not changed.`);
                return;
            }
            setSuccessMessage(`Name changed to ${name} successfully`);
            setErrorMessage("");
            if (!name) {
                return;
            }
            setUserSelected((prevState) => ({
                ...prevState,
                name: name,
            }));

            const updateUserName = (name: string) => {
                setPhylomesData(
                    phylomesData.map((data) =>
                        data.user_email_address === userSelected.email
                            ? {
                                  ...data,
                                  user_full_name: name ?? null,
                              }
                            : data,
                    ),
                );
            };
            updateUserName(name);

            setActionMenuNum(-1);
            setIsOpenOptionsEmailMenu(false);
            return;
        }

        if (action == "removeName") {
            let resp = await fetch("/api/admin/phylomes", {
                method: "POST",
                body: JSON.stringify({
                    user_email_address: userSelected.email,
                    new_name: "",
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (resp.status !== 200 || !resp.ok) {
                setSuccessMessage("");
                setErrorMessage(`Error name not removed.`);
                return;
            }
            setSuccessMessage(`Name ${userSelected.name} removed successfully`);
            setErrorMessage("");
            setUserSelected((prevState) => ({
                ...prevState,
                name: "",
            }));
            const updateUserName = (name: string) => {
                setPhylomesData(
                    phylomesData.map((data) =>
                        data.user_email_address === userSelected.email
                            ? {
                                  ...data,
                                  user_full_name: name ?? null,
                              }
                            : data,
                    ),
                );
            };
            updateUserName("");

            setIsOpenOptionsEmailMenu(false);
            setActionMenuNum(-1);
        }
    }

    return (
        <div>
            {/* Name settings menu */}

            <div>
                <div>
                    <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center ">
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
                                title="Close"
                                onClick={() => {
                                    setActionMenuNum(-1);
                                }}
                                className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 hover:scale-105 hover:bg-red-100"
                            >
                                {closeCross}
                            </button>

                            <h2 className="text-lg font-semibold mb-4">
                                Name Settings
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    confirmAction("addName");
                                }}
                            >
                                <div className="flex justify-center w-full">
                                    <input
                                        title="User email"
                                        name="email-input"
                                        className="border-2 w-full rounded-md p-2 border-slate-300 shadow-lg"
                                        type="text"
                                        placeholder="email"
                                        value={String(
                                            userSelected.email
                                                ? userSelected.email
                                                : "",
                                        )}
                                        disabled
                                    />
                                </div>
                                <div className="flex justify-center mt-1 w-full">
                                    <input
                                        data-cy="name-input-user"
                                        title="User name"
                                        name="email-input"
                                        className="border-2 w-full rounded-md p-2 border-slate-300 shadow-lg"
                                        type="text"
                                        placeholder="New name"
                                        value={newName}
                                        onChange={(e) =>
                                            setNewName(e.target.value)
                                        }
                                        ref={nameField}
                                        required
                                        minLength={2}
                                    />
                                </div>

                                <button
                                    data-cy="confirm-change-name-button"
                                    type="submit"
                                    className="bg-green-500 text-white py-2 px-4 mt-2 rounded-md w-full  hover:bg-green-600 border-transparent border-2 hover:border-green-700"
                                    title="Modify name"
                                >
                                    <p>Confirm</p>
                                </button>

                                <button
                                    data-cy="remove-name-button-user"
                                    type="button"
                                    className={
                                        userSelected.name
                                            ? "bg-red-500 text-white py-2 px-4 mt-2 rounded-md w-full  hover:bg-red-600 border-transparent border-2 hover:border-red-700"
                                            : "hidden"
                                    }
                                    onClick={() => {
                                        confirmAction("removeName");
                                        setActionMenuNum(-1);
                                    }}
                                    title="Delete name"
                                >
                                    Remove Name
                                </button>
                                <button
                                    data-cy="modify-username-back-button"
                                    type="button"
                                    className="bg-blue-500 text-white py-2 px-4 mt-2 rounded-md w-full hover:bg-blue-600 border-transparent border-2 hover:border-blue-700 "
                                    title="Back"
                                    onClick={() => {
                                        setActionMenuNum(-1);
                                        setIsOpenOptionsEmailMenu(true);
                                    }}
                                >
                                    <p>back</p>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
