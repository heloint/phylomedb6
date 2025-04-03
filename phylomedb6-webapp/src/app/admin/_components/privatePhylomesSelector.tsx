"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { PrivatePhylomesData } from "../../../_models/admin/privatePhylomesLocal";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";

export default function PrivatePhylomes({
    phylomesIds,
}: {
    phylomesIds: PrivatePhylomesData[];
}) {
    const [phyIds, setPhyIds] = useState<PrivatePhylomesData[]>(phylomesIds);
    const [selectedPhylomes, setSelectedPhylomes] = useState<number[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [phylomeAction, setPhylomeAction] = useState("add");

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const router = useRouter();

    return (
        <div className="flex flex-col gap-3  w-full  items-center">
            {successMessage && (
                <SuccessMessageWindow operationTitle={successMessage} />
            )}
            {errorMessage && <ErrorMessageWindow errorMessage={errorMessage} />}
            <div className="flex py-3 px-3.5 md:px-7 lg:px-14 flex-col sm:flex-col bg-white justify-center items-center content-center border-2 border-slate-300 shadow-lg rounded-md w-full  ">
                <div className="flex  px-5 md:px-10 lg:px-20 flex-col sm:flex-col bg-white justify-center items-center content-center border-slate-300   rounded-md lg:w-6/12 sm:w-8/12 mt-0 mb-2">
                    <h1 className="text-3xl underline decoration-solid min-w-60 text-center">
                        Manage private phylomes
                    </h1>
                </div>
                <SelectComponent
                    setSelectedPhylomes={setSelectedPhylomes}
                    setPhyIds={setPhyIds}
                    phylomeAction={phylomeAction}
                    selectedPhylomes={selectedPhylomes}
                    router={router}
                    setPhylomeAction={setPhylomeAction}
                    setErrorMessage={setErrorMessage}
                    setSuccessMessage={setSuccessMessage}
                />
                <div
                    className={`flex ${isMenuOpen ? "py-3" : "py-0"} px-2.5 md:px-2.5 lg:px-5 flex-row sm:flex-row bg-white  content-center border-2 border-slate-300 shadow-lg rounded-md w-full`}
                >
                    <PhylomeComponent
                        phyIds={phyIds}
                        isMenuOpen={isMenuOpen}
                        setPhyIds={setPhyIds}
                        setIsMenuOpen={setIsMenuOpen}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedPhylomes={selectedPhylomes}
                        setSelectedPhylomes={setSelectedPhylomes}
                        setErrorMessage={setErrorMessage}
                        setSuccessMessage={setSuccessMessage}
                        router={router}
                    />
                </div>
            </div>
        </div>
    );
}

// This component allows the user to manage private phylomes (add, delete, and select).
function PhylomeComponent({
    phyIds,
    setIsMenuOpen,
    setPhyIds,
    setSearchQuery,
    searchQuery,
    isMenuOpen,
    selectedPhylomes,
    setSelectedPhylomes,
    setErrorMessage,
    setSuccessMessage,
    router,
}: {
    phyIds: PrivatePhylomesData[];
    isMenuOpen: boolean;
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
    setPhyIds: Dispatch<SetStateAction<PrivatePhylomesData[]>>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    selectedPhylomes: number[];
    setSelectedPhylomes: Dispatch<SetStateAction<number[]>>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    router: AppRouterInstance;
}) {
    const addPhylomeInputRef = useRef<HTMLInputElement>(null);
    const filteredPhylomes = phyIds.filter((phylome) =>
        phylome.phylome_id.toString().includes(searchQuery),
    );
    useEffect(() => {
        if (addPhylomeInputRef.current) {
            addPhylomeInputRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [isMenuOpen]);

    const handleClick = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleCheckboxChange = (id: number, isChecked: boolean) => {
        if (isChecked && selectedPhylomes.length >= 20) {
            alert("Max phylomes selection is 20");
            return;
        }

        setSelectedPhylomes((prev) => {
            if (isChecked) {
                return [...prev, id];
            } else {
                return prev.filter((phylomeId) => phylomeId !== id);
            }
        });
    };

    const handleResetSelections = () => {
        setSelectedPhylomes([]);
    };

    const handleAddNewPhylome = async (event: React.FormEvent) => {
        event.preventDefault();
        if (addPhylomeInputRef.current) {
            const phylomeIdToAdd = addPhylomeInputRef.current.value;
            if (phylomeIdToAdd.length < 1) {
                return;
            }

            const response = await fetch(
                `/api/admin?phylome_id=${phylomeIdToAdd}`,
            );
            const data = await response.json();
            if (!response.ok) {
                setErrorMessage(`${data.error}`);
                setSuccessMessage("");
                return;
            }
            if (!data.isPrivate) {
                setErrorMessage(`${data.message}`);
                setSuccessMessage("");
                return;
            }

            let res = await fetch("/api/admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phylome_id: phylomeIdToAdd }),
            });
            if (res.ok || res.status === 200) {
                const newPhylome = { phylome_id: Number(phylomeIdToAdd) };
                setPhyIds((prev) => [...prev, newPhylome]);
                addPhylomeInputRef.current.value = "";
                setSuccessMessage(
                    `Phylome with id ${phylomeIdToAdd} added succesfully`,
                );
                setErrorMessage("");
            } else {
                setErrorMessage(
                    `The phylome with id ${phylomeIdToAdd} is already inserted.`,
                );
                setSuccessMessage("");
            }
        }
    };

    const addUsersToOnePhylome = (phylome_id: any) => {
        const phylome_id_array = [phylome_id];
        const serializedPhylomes = encodeURIComponent(
            JSON.stringify(Array.from(new Set(phylome_id_array))),
        );

        router.push(`/admin/phylomes?selected=${serializedPhylomes}`);
    };
    const chevronRightSVG = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="22"
            fill="currentColor"
            className="bi bi-chevron-right"
            viewBox="0 0 16 16"
        >
            <path
                fillRule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
            />
        </svg>
    );

    const chevronDownSVG = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="22"
            fill="currentColor"
            className="bi bi-chevron-down"
            viewBox="0 0 16 16"
        >
            <path
                fillRule="evenodd"
                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
            />
        </svg>
    );

    const plusSVG = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-plus"
            viewBox="0 0 16 16"
        >
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
        </svg>
    );
    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-row w-full">
                <div className="w-3/12 sm:w-2/12   flex  items-center py-2">
                    <button
                        data-cy="toggle-phylomes-menu-button"
                        title="Toggle phylomes menu"
                        className="w-auto p-2  justify-center items-center border-2 rounded-xl text-2xl bg-white text-black border-slate-300 shadow-lg hover:border-gray-600 hover:shadow-lg transition-all duration-300 ease-in-out"
                        onClick={handleClick}
                    >
                        {isMenuOpen ? chevronDownSVG : chevronRightSVG}
                    </button>
                </div>
                <div className="w-8/12 mx-10 sm:mx-0 p-4 flex justify-center items-center">
                    <p
                        className="text-center text-2xl whitespace-nowrap"
                        hidden={!isMenuOpen}
                    >
                        Phylomes List
                    </p>
                </div>
            </div>

            {isMenuOpen && (
                <div>
                    <form
                        onSubmit={handleAddNewPhylome}
                        className="w-65 sm:w-80 mt-2 flex flex-row"
                    >
                        <input
                            data-cy="add-new-phylome-input"
                            id="addPhylome"
                            type="text"
                            ref={addPhylomeInputRef}
                            placeholder="Add new Phylome ID"
                            className="w-full p-2 border-2 rounded-sm hover:border-gray-900 border-slate-300 shadow-lg"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength={10}
                            title="Add phylome"
                        />
                        <button
                            data-cy="add-phylome-button"
                            type="submit"
                            className="px-1.5  ml-2 bg-green-500 border-2 border-transparent hover:border-green-700 text-white rounded-lg  hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 box-border"
                            title="Add phylome"
                        >
                            {plusSVG}
                        </button>
                    </form>

                    <div className="flex flex-row justify-between items-center w-full">
                        <div className="w-65 sm:w-80 mt-2">
                            <input
                                data-cy="searchbar-phylomes"
                                id="searchBar"
                                type="number"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Phylome ID"
                                className="w-full p-2 border-2 hover:border-gray-900 border-slate-300 shadow-lg rounded-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min={0}
                                title="Search phylomes"
                            />
                        </div>
                        <div className="mt-4 ml-2">
                            <button
                                data-cy="reset-selections-button"
                                onClick={handleResetSelections}
                                className="px-2 py-2 mb-2 bg-red-500 border-transparent border-2 hover:border-red-700 text-white rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 white-space: min-w-max"
                                title="Reset selected phylomes"
                            >
                                Reset Selections
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isMenuOpen && (
                <div className="w-full p-4 mt-2 border-2 border-slate-300  rounded-md h-max-[500px] overflow-auto flex justify-center items-center">
                    {filteredPhylomes.length === 0 ? (
                        <p className="text-gray-500 text-center">
                            No phylomes found
                        </p>
                    ) : (
                        filteredPhylomes.map((phylome) => (
                            <div
                                className="flex w-full justify-center items-center"
                                key={phylome.phylome_id}
                            >
                                <div className="flex items-center  my-2 h-10 w-full group hover:bg-gray-200 px-5 rounded-md cursor-pointer ">
                                    <input
                                        data-cy="phylome-checkbox"
                                        type="checkbox"
                                        id={`checkbox-${phylome.phylome_id}`}
                                        name={`checkbox-${phylome.phylome_id}`}
                                        className="mr-2 h-4"
                                        checked={selectedPhylomes.includes(
                                            phylome.phylome_id,
                                        )}
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                phylome.phylome_id,
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <label
                                        data-cy="phylome-selector-label"
                                        custom-value={phylome.phylome_id}
                                        htmlFor={`checkbox-${phylome.phylome_id}`}
                                        className="flex items-center cursor-pointer justify-start  w-full h-full sm:group-hover:text-2xl text-xl transition-all duration-300 ease-in-out"
                                        title={"phylome " + phylome.phylome_id}
                                    >
                                        Phylome {phylome.phylome_id}
                                    </label>
                                </div>
                                <button
                                    className="ml-2 bg-blue-500 h-10 text-nowrap px-2 rounded-lg border-2 border-transparent hover:border-blue-700 hover:bg-blue-600 text-white"
                                    onClick={() => {
                                        addUsersToOnePhylome(
                                            phylome.phylome_id,
                                        );
                                    }}
                                >
                                    Add users
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// Component to handle the list of phylomes, including adding new ones, filtering, and selecting.
function SelectComponent({
    setPhyIds,
    phylomeAction,
    setSelectedPhylomes,
    selectedPhylomes,
    router,
    setPhylomeAction,
    setErrorMessage,
    setSuccessMessage,
}: {
    setPhyIds: Dispatch<SetStateAction<PrivatePhylomesData[]>>;
    setSelectedPhylomes: Dispatch<SetStateAction<number[]>>;
    phylomeAction: string;
    selectedPhylomes: number[];
    router: AppRouterInstance;
    setPhylomeAction: Dispatch<SetStateAction<string>>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
}) {
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (phylomeAction === "") {
            alert("Select valid option!");
            return;
        }
        if (selectedPhylomes.length === 0) {
            alert("No phylomes selected!");
            return;
        }

        const serializedPhylomes = encodeURIComponent(
            JSON.stringify(Array.from(new Set(selectedPhylomes))),
        );

        if (phylomeAction === "add") {
            router.push(`/admin/phylomes?selected=${serializedPhylomes}`);
        } else if (phylomeAction === "delete") {
            const res = await fetch(
                `/api/admin?phylome_id=${serializedPhylomes}`,
                {
                    method: "DELETE",
                },
            );
            if (!res.ok || res.status !== 200) {
                setErrorMessage("Error deleting phylomes");
                setSuccessMessage("");
            } else {
                //TODO h-full in success Message to display all.
                setSuccessMessage(
                    selectedPhylomes.length === 1
                        ? `Phylome with id ${selectedPhylomes[0]} deleted successfully`
                        : `Phylomes deleted successfully ids [${selectedPhylomes
                              .slice(0, 2)
                              .join(
                                  ", ",
                              )}${selectedPhylomes.length > 2 ? ", ..." : ""}]`,
                );
                setErrorMessage("");
            }
            setPhyIds((prev) =>
                prev.filter((id) => !selectedPhylomes.includes(id.phylome_id)),
            );
            setSelectedPhylomes((prev) =>
                prev.filter(
                    (phylomeId) => !selectedPhylomes.includes(phylomeId),
                ),
            );
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 w-full sm:w-72 self-start"
        >
            <select
                data-cy="select-phylomes-action"
                name="menu_opt"
                id="optmn"
                value={phylomeAction}
                onChange={(e) => setPhylomeAction(e.target.value)}
                className="block w-full px-4  hover:border-gray-900  py-2 mb-2 text-base text-gray-900 bg-white border-2 border-slate-300  rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                title="Action"
            >
                <option value="add">Add Users</option>
                <option value="delete">Delete Phylomes</option>
            </select>
            <button
                data-cy="confirm-phylomes-action-button"
                title="Confirm action"
                type="submit"
                className="px-4 py-1.5 mb-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 border-2 border-transparent hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 box-border"
            >
                Confirm
            </button>
        </form>
    );
}
