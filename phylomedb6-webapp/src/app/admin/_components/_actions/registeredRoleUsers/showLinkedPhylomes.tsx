import { RefObject, SetStateAction } from "react";
import { Dispatch } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function ShowLinkedPhylomes({
    actionMenuNum,
    setActionMenuNum,
    closeCross,
    userSelected,
    setNewName,
    nameField,
    emailField,
    setIsOpenOptionsEmailMenu,
    phylomesWithGivenMail,
    searchLinkedPhylomeQuery,
    setSearchLinkedPhylomeQuery,
    phylomesWithGivenMailFiltered,
    router,
}: {
    setIsOpenOptionsEmailMenu: Dispatch<SetStateAction<boolean>>;
    setActionMenuNum: Dispatch<SetStateAction<number>>;
    actionMenuNum: number;
    closeCross: JSX.Element;
    nameField: RefObject<HTMLInputElement>;
    emailField: RefObject<HTMLInputElement>;
    setNewName: Dispatch<SetStateAction<string>>;
    userSelected: { email: string; name: string | null };
    phylomesWithGivenMail: number[];
    searchLinkedPhylomeQuery: string;
    setSearchLinkedPhylomeQuery: Dispatch<SetStateAction<string>>;
    phylomesWithGivenMailFiltered: number[];
    router: AppRouterInstance;
}) {
    const handleClickLinkedPhylome = (phylome: number) => {
        const serializedPhylomes = encodeURIComponent(
            JSON.stringify(Array.from([phylome])),
        );
        router.push(`/admin/phylomes?selected=${serializedPhylomes}`);
    };

    return (
        <div>
            <div>
                <div>
                    <div className="fixed inset-0  bg-white bg-opacity-30 flex justify-center ">
                        <div
                            data-cy="phylomes-linked-modal"
                            className="bg-white p-5 rounded-md border-2 border-slate-300 shadow-sm  w-96 h-fit relative mb-16 top-96"
                            style={{
                                top:
                                    window.innerWidth >= 768
                                        ? `${window.scrollY + 100}px`
                                        : `100px`,
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
                                Phylomes linked
                            </h2>

                            <div className="flex justify-center w-full">
                                <input
                                    title="User email"
                                    name="email-input"
                                    className="border-2 w-full rounded-md p-2 border-slate-300 shadow-lg"
                                    type="email"
                                    placeholder="New email"
                                    value={userSelected.email}
                                    disabled
                                    ref={emailField}
                                    required
                                    minLength={2}
                                />
                            </div>
                            <div className="flex justify-center mt-1 w-full">
                                <input
                                    title="User name"
                                    name="name input"
                                    className={
                                        userSelected.name
                                            ? "border-2 w-full p-2 rounded-md  border-slate-300 shadow-lg"
                                            : "hidden"
                                    }
                                    type="text"
                                    placeholder="New name"
                                    value={userSelected.name || ""}
                                    onChange={(e) => setNewName(e.target.value)}
                                    ref={nameField}
                                    required
                                    minLength={2}
                                    disabled
                                />
                            </div>
                            <div className="flex justify-center mt-1 w-full border-slate-300 shadow-sm">
                                <input
                                    data-cy="search-bar-linked-phylomes-modal"
                                    id="searchBarLinked"
                                    type="number"
                                    value={searchLinkedPhylomeQuery}
                                    onChange={(e) =>
                                        setSearchLinkedPhylomeQuery(
                                            e.target.value,
                                        )
                                    }
                                    placeholder={`Search by phylome id`}
                                    className="w-full p-2 border-2 border-slate-300 shadow-md rounded-md mt-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    title="Search by phylome id"
                                />
                            </div>
                            <div className="w-full p-2 mt-2 border-2 rounded-md max-h-[150px] overflow-auto border-slate-300 shadow-lg">
                                {phylomesWithGivenMail.length === 0 ? (
                                    <p className="text-gray-500 text-center">
                                        No phylomes available
                                    </p>
                                ) : phylomesWithGivenMailFiltered.length ===
                                  0 ? (
                                    <p className="text-gray-500">
                                        No phylomes found
                                    </p>
                                ) : (
                                    phylomesWithGivenMailFiltered.map(
                                        (phylome) => (
                                            <button
                                                data-cy="phylome-button-phylomes-linked"
                                                value={phylome}
                                                key={phylome}
                                                className="flex items-center  my-2 h-10 w-full hover:bg-gray-200 px-5 rounded-md "
                                                onClick={() =>
                                                    handleClickLinkedPhylome(
                                                        phylome,
                                                    )
                                                }
                                            >
                                                <label
                                                    className="flex items-center justify-start cursor-pointer text-lg w-full h-full sm:hover:text-xl transition-out duration-150 ease-in"
                                                    title={"phylome " + phylome}
                                                >
                                                    Phylome {phylome}
                                                </label>
                                            </button>
                                        ),
                                    )
                                )}
                            </div>

                            <button
                                data-cy="linked-phylomes-back-button"
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
