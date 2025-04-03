import { RefObject, SetStateAction } from "react";
import { Dispatch } from "react";
import { PhylomeAllowedUserData } from "@/_models/admin/phylomes/privatePhylomesRelations";

export function DeleteUserMenu({
    setActionMenuNum,
    closeCross,
    userSelected,
    setIsOpenOptionsEmailMenu,
    setPhylomesData,
    setSuccessMessage,
    setErrorMessage,
    phylomesWithGivenMail,
    phylomesData,
}: {
    setIsOpenOptionsEmailMenu: Dispatch<SetStateAction<boolean>>;
    setActionMenuNum: Dispatch<SetStateAction<number>>;
    closeCross: JSX.Element;
    nameField: RefObject<HTMLInputElement>;
    emailField: RefObject<HTMLInputElement>;
    setNewName: Dispatch<SetStateAction<string>>;
    userSelected: { email: string; name: string | null };
    setPhylomesData: Dispatch<PhylomeAllowedUserData[]>;
    phylomesData: PhylomeAllowedUserData[];
    setErrorMessage: Dispatch<SetStateAction<string>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    phylomesWithGivenMail: number[];
}) {
    async function deleteUserFromAllPhylomes() {
        try {
            let resp = await fetch(
                `/api/admin/phylomes?user_email_address=${userSelected.email}`,
                {
                    method: "DELETE",
                },
            );

            if (!resp.ok || resp.status !== 200) {
                setSuccessMessage("");
                setErrorMessage(`Error deleting ${userSelected.email}.`);
                return;
            }
            setSuccessMessage(`${userSelected.email} deleted successfully`);
            setErrorMessage("");

            setPhylomesData(
                phylomesData.filter(
                    (data) => data.user_email_address !== userSelected.email,
                ),
            );

            setActionMenuNum(-1);
            setIsOpenOptionsEmailMenu(false);
        } catch (error) {
            setSuccessMessage("");
            setErrorMessage(`Error deleting ${userSelected.email}.`);
        }
    }

    const handleCancel = () => {
        setActionMenuNum(-1);
        setIsOpenOptionsEmailMenu(true);
    };

    return (
        <div>
            <div
                className="fixed inset-0 bg-white bg-opacity-30 flex justify-center"
                data-cy="delete-user-modal"
            >
                <div
                    className="bg-white p-5 rounded-md border-2 border-slate-300 shadow-lg w-96 h-fit relative mb-16 top-96"
                    style={{
                        top:
                            window.innerWidth >= 768
                                ? `${window.scrollY + 100}px`
                                : `150px`,
                    }}
                >
                    <button
                        title="Close"
                        onClick={() => setActionMenuNum(-1)}
                        className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 hover:scale-105 hover:bg-red-100"
                    >
                        {closeCross}
                    </button>

                    <h2 className="text-xl mb-4">Confirm Deletion</h2>
                    <p className="mb-4">
                        The user{" "}
                        <span className="font-semibold">
                            {userSelected.email}
                        </span>
                        {userSelected.name ? ` (${userSelected.name})` : ""} is
                        assigned to the following phylomes:
                    </p>

                    {phylomesWithGivenMail.length > 0 ? (
                        <div className="mb-4 p-2 bg-gray-100 rounded-md">
                            <span className="font-medium">Phylomes:</span>{" "}
                            {phylomesWithGivenMail.map(
                                (phylome: number, index) => (
                                    <span key={phylome}>
                                        {phylome}
                                        {index <
                                        phylomesWithGivenMail.length - 1
                                            ? ", "
                                            : ""}
                                    </span>
                                ),
                            )}
                        </div>
                    ) : (
                        <p className="mb-4">
                            No phylomes assigned to this user.
                        </p>
                    )}

                    <p className="mb-4">
                        Do you want to proceed with deletion? This action cannot
                        be undone.
                    </p>

                    <div className="flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 w-1/2 rounded hover:bg-gray-600 border-transparent border-2 hover:border-gray-700"
                            data-cy="delete-user-from-all-phylomes-back-button"
                        >
                            Back
                        </button>
                        <button
                            onClick={deleteUserFromAllPhylomes}
                            className="bg-red-500 text-white px-4 py-2 w-1/2 rounded hover:bg-red-600 border-transparent border-2 hover:border-red-700"
                            data-cy="confirm-delete-user-button"
                            user-email={userSelected.email}
                            custom-value={phylomesWithGivenMail
                                .map((phylome: number) => phylome)
                                .join(", ")}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
