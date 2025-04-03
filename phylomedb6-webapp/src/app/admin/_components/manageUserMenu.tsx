"use client";

import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { PhylomeAllowedUserData } from "@/_models/admin/phylomes/privatePhylomesRelations";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ModifyUsernameMenu } from "./_actions/registeredRoleUsers/modifyUserName";
import { ModifyUserDataMenu } from "./_actions/registeredRoleUsers/modifyUser";
import { DeleteUserMenu } from "./_actions/registeredRoleUsers/deleteUser";
import { ShowLinkedPhylomes } from "./_actions/registeredRoleUsers/showLinkedPhylomes";

export default function UserEditMenu({
    allPrivatePhylomesData,
}: {
    allPrivatePhylomesData: PhylomeAllowedUserData[];
}) {
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [phylomesData, setPhylomesData] = useState<PhylomeAllowedUserData[]>(
        allPrivatePhylomesData,
    );

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchLinkedPhylomeQuery, setSearchLinkedPhylomeQuery] =
        useState<string>("");
    const [actionMenuNum, setActionMenuNum] = useState<number>(-1);
    const [newName, setNewName] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");

    const [filterField, setFilterField] = useState<string>("email");
    const [userSelected, setUserSelected] = useState<{
        email: string;
        name: string | null;
    }>({
        email: "",
        name: "",
    });
    const [oldUser, setOldUser] = useState<{
        email: string;
        name: string | null;
    }>({
        email: "",
        name: "",
    });

    const [isOpenOptionsEmailMenu, setIsOpenOptionsEmailMenu] =
        useState<boolean>(false);
    const router = useRouter();
    return (
        <div className="flex flex-col gap-3 my-3  w-full  items-center">
            {successMessage && (
                <SuccessMessageWindow operationTitle={successMessage} />
            )}
            {errorMessage && <ErrorMessageWindow errorMessage={errorMessage} />}
            <div className="flex shadow-lg py-3 px-3.5 md:px-7 lg:px-14 flex-col sm:flex-col bg-white justify-center items-center content-center border-2 rounded-md w-full  ">
                <div className="flex pb-2 px-5 md:px-10 lg:px-20 flex-col sm:flex-col bg-white justify-center items-center content-center  rounded-md lg:w-6/12 sm:w-8/12 mt-0 mb-2">
                    <h1 className="text-3xl underline decoration-solid min-w-60 text-center">
                        Manage Users
                    </h1>
                </div>

                <div
                    className={`flex ${isMenuOpen ? "py-3" : "py-0"} px-2.5 md:px-2.5 lg:px-5 flex-row sm:flex-row  bg-white border-slate-300 shadow-md  content-center border-2 rounded-md w-full`}
                >
                    <UserList
                        setErrorMessage={setErrorMessage}
                        setSuccessMessage={setSuccessMessage}
                        isMenuOpen={isMenuOpen}
                        setIsMenuOpen={setIsMenuOpen}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        filterField={filterField}
                        setFilterField={setFilterField}
                        allPrivatePhylomesData={allPrivatePhylomesData}
                        userSelected={userSelected}
                        setUserSelected={setUserSelected}
                        setOldUser={setOldUser}
                        isOpenOptionsEmailMenu={isOpenOptionsEmailMenu}
                        setIsOpenOptionsEmailMenu={setIsOpenOptionsEmailMenu}
                        actionMenuNum={actionMenuNum}
                        setActionMenuNum={setActionMenuNum}
                        newName={newName}
                        setNewName={setNewName}
                        newEmail={newEmail}
                        setNewEmail={setNewEmail}
                        router={router}
                        searchLinkedPhylomeQuery={searchLinkedPhylomeQuery}
                        setSearchLinkedPhylomeQuery={
                            setSearchLinkedPhylomeQuery
                        }
                        phylomesData={phylomesData}
                        setPhylomesData={setPhylomesData}
                    />
                </div>
            </div>
        </div>
    );
}

function UserList({
    isMenuOpen,
    setIsMenuOpen,
    setErrorMessage,
    setSuccessMessage,
    searchQuery,
    setSearchQuery,
    filterField,
    setFilterField,
    allPrivatePhylomesData,
    userSelected,
    setUserSelected,

    setOldUser,
    isOpenOptionsEmailMenu,
    setIsOpenOptionsEmailMenu,
    actionMenuNum,
    setActionMenuNum,
    newName,
    setNewName,
    newEmail,
    setNewEmail,
    router,
    searchLinkedPhylomeQuery,
    setSearchLinkedPhylomeQuery,
    phylomesData,
    setPhylomesData,
}: {
    isMenuOpen: boolean;
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    filterField: string;
    setFilterField: Dispatch<SetStateAction<string>>;
    allPrivatePhylomesData: PhylomeAllowedUserData[];
    userSelected: {
        email: string;
        name: string | null;
    };
    setUserSelected: Dispatch<
        SetStateAction<{
            email: string;
            name: string | null;
        }>
    >;
    setOldUser: Dispatch<
        SetStateAction<{
            email: string;
            name: string | null;
        }>
    >;
    isOpenOptionsEmailMenu: boolean;
    setIsOpenOptionsEmailMenu: Dispatch<SetStateAction<boolean>>;
    actionMenuNum: number;
    setActionMenuNum: Dispatch<SetStateAction<number>>;
    newName: string;
    setNewName: Dispatch<SetStateAction<string>>;
    newEmail: string;
    setNewEmail: Dispatch<SetStateAction<string>>;
    router: AppRouterInstance;
    searchLinkedPhylomeQuery: string;
    setSearchLinkedPhylomeQuery: Dispatch<SetStateAction<string>>;
    phylomesData: PhylomeAllowedUserData[];
    setPhylomesData: Dispatch<PhylomeAllowedUserData[]>;
}) {
    const divContentref = useRef<HTMLDivElement>(null);
    const nameField = useRef<HTMLInputElement>(null);
    const emailField = useRef<HTMLInputElement>(null);
    const phylomesWithGivenMail = allPrivatePhylomesData
        .filter((phylome) => phylome.user_email_address === userSelected.email)
        .map((phylome) => phylome.phylome_id);

    const phylomesWithGivenMailFiltered = phylomesWithGivenMail.filter(
        (phylomeId) => {
            const query =
                searchLinkedPhylomeQuery === ""
                    ? null
                    : parseInt(searchLinkedPhylomeQuery);
            return query ? phylomeId === query : true;
        },
    );
    useEffect(() => {
        if (divContentref.current) {
            divContentref.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [isMenuOpen]);

    useEffect(() => {
        if (userSelected) {
        }
    }, [userSelected]);

    useEffect(() => {
        if (isOpenOptionsEmailMenu || actionMenuNum > 0) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpenOptionsEmailMenu, actionMenuNum]);
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

    const handleClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const handleFilterChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setFilterField(event.target.value);
    };

    // Apply filter based on the selected field
    const filteredPrivatePhylomesData = phylomesData.filter(
        (privatePhylomeData) => {
            if (filterField === "email") {
                return privatePhylomeData.user_email_address
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());
            } else if (
                filterField === "name" &&
                privatePhylomeData.user_full_name
            ) {
                return privatePhylomeData.user_full_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            }
            return false;
        },
    );
    const handleClickEmail = (
        userEmailAddress: string,
        userName: string | null = "",
    ) => {
        setOldUser({ email: userEmailAddress, name: userName });
        setUserSelected({ email: userEmailAddress, name: userName });
        setIsOpenOptionsEmailMenu(!isOpenOptionsEmailMenu);
    };

    const deleteMailFromAllPhylomes = () => {
        setActionMenuNum(3);
        setIsOpenOptionsEmailMenu(!isOpenOptionsEmailMenu);
    };

    const editMailToAllPhylomes = () => {
        setActionMenuNum(2);
        setIsOpenOptionsEmailMenu(!isOpenOptionsEmailMenu);
        setNewEmail(userSelected.email);
        setNewName(userSelected.name ? userSelected.name : "");
    };

    const addNameToMailAllPhylomes = async () => {
        setActionMenuNum(1);
        setIsOpenOptionsEmailMenu(!isOpenOptionsEmailMenu);
        setNewName(userSelected.name ? userSelected.name : "");
    };

    const showLinkedPhylomes = () => {
        setActionMenuNum(4);
        setSearchQuery("");
        setIsOpenOptionsEmailMenu(!isOpenOptionsEmailMenu);
        setNewName(userSelected.name ? userSelected.name : "");
    };

    const closeCross = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="currentColor"
            className="bi bi-x"
            viewBox="0 0 16 16"
        >
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
        </svg>
    );
    return (
        <div className="w-full ">
            <div className=" flex flex-row py-2 ">
                <button
                    data-cy="toggle-users-menu-button"
                    title="Toggle users menu"
                    className="w-auto p-2   border-slate-300 shadow-md justify-center items-center border-2 rounded-xl text-2xl bg-white text-black hover:bg-gray-50 hover:border-slate-900 hover:shadow-md transition-all duration-300 ease-in-out"
                    onClick={handleClick}
                >
                    {isMenuOpen ? chevronDownSVG : chevronRightSVG}
                </button>
            </div>
            {isMenuOpen && (
                <div>
                    <div className="sm:w-80  flex items-center gap-2 w-full ">
                        <select
                            data-cy="select-search-filter-user"
                            title="Filter value"
                            name="Filter"
                            id="filter"
                            className=" border-2 rounded-sm border-slate-300 shadow-md hover:border-slate-900 p-2 "
                            onChange={handleFilterChange}
                            value={filterField}
                        >
                            <option value="email">Email</option>
                            <option value="name">Name</option>
                        </select>
                        <input
                            data-cy="searchbar-users-input"
                            id="searchBar"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search by ${filterField}`}
                            className="w-full p-2 border-2 rounded-sm  border-slate-300 shadow-md hover:border-slate-900"
                            title={`Search by ${filterField}`}
                        />
                    </div>
                    <div
                        className="p-3 w-full border-slate-300   content-start items-start max-h-[500px] border-2 mt-2 rounded-sm overflow-y-auto overflow-x-hidden"
                        ref={divContentref}
                    >
                        {" "}
                        {filteredPrivatePhylomesData.length > 0 ? (
                            filteredPrivatePhylomesData.map(
                                (privatePhylomeData) => (
                                    <div
                                        className="w-full "
                                        key={
                                            privatePhylomeData.user_email_address
                                        }
                                    >
                                        <button
                                            data-cy="email-name-user-button"
                                            email-value={
                                                privatePhylomeData.user_email_address
                                            }
                                            name-value={
                                                privatePhylomeData.user_full_name
                                            }
                                            className="w-full h-full  box-border rounded-md hover:bg-gray-200 "
                                            onClick={() =>
                                                handleClickEmail(
                                                    privatePhylomeData.user_email_address,
                                                    privatePhylomeData.user_full_name,
                                                )
                                            }
                                        >
                                            {filterField === "email" && (
                                                <p
                                                    title={`Email ${privatePhylomeData.user_email_address}`}
                                                    className="  hover:scale-110 transition-transform duration-300 ease-in-out transform origin-left w-full h-full text-left px-4 py-2 mt-1 "
                                                >
                                                    <strong>Email:</strong>{" "}
                                                    {privatePhylomeData
                                                        .user_email_address
                                                        .length > 0
                                                        ? privatePhylomeData.user_email_address
                                                        : "No emails found"}
                                                </p>
                                            )}
                                            {filterField === "name" && (
                                                <p
                                                    title={`Name ${privatePhylomeData.user_full_name}`}
                                                    className=" hover:scale-110 transition-transform duration-300 ease-in-out transform origin-left w-full h-full text-left px-4 py-2 mt-1 "
                                                >
                                                    <strong>Name:</strong>{" "}
                                                    {
                                                        privatePhylomeData.user_full_name
                                                    }
                                                </p>
                                            )}
                                        </button>
                                    </div>
                                ),
                            )
                        ) : (
                            <p className="p-4 text-center text-gray-500">
                                {filterField === "email"
                                    ? "No emails found"
                                    : "No names found"}
                            </p>
                        )}
                    </div>
                    {isOpenOptionsEmailMenu ? (
                        <div data-cy="user-settings-modal">
                            <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center ">
                                <div
                                    className="bg-white p-5 rounded-md border-2 border-slate-300 shadow-md w-96 h-fit relative mb-16 top-96"
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
                                            setIsOpenOptionsEmailMenu(
                                                !isOpenOptionsEmailMenu,
                                            );
                                        }}
                                        className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 hover:scale-105 hover:bg-red-100"
                                    >
                                        {closeCross}
                                    </button>

                                    <h2 className="text-lg font-semibold mb-4">
                                        User Settings
                                    </h2>

                                    <div className="flex justify-center w-full">
                                        <input
                                            title="User email"
                                            name="email-input"
                                            disabled
                                            className="border-2 w-full rounded-md p-2 border-slate-300 shadow-md "
                                            type="text"
                                            value={userSelected.email}
                                        />
                                    </div>
                                    <div className="flex justify-center w-full">
                                        <input
                                            name="name-input"
                                            title="User name"
                                            disabled
                                            type="text"
                                            value={
                                                userSelected.name
                                                    ? userSelected.name
                                                    : ""
                                            }
                                            className={
                                                userSelected.name
                                                    ? "border-2 w-full rounded-md mt-1 p-2 border-slate-300 shadow-md"
                                                    : "hidden"
                                            }
                                        />
                                    </div>
                                    {/* TODO decide if its necessary this button , in modify all data button is same functionality */}
                                    {/* <button
                                        data-cy="modify-name-button-user"
                                        type="button"
                                        className="bg-green-500 text-white py-2 px-4 mt-2 rounded-md w-full  hover:bg-green-600 border-transparent border-2 hover:border-green-700"
                                        onClick={addNameToMailAllPhylomes}
                                        title="Modify name"
                                    >
                                        <p>Modify name</p>
                                    </button> */}
                                    <button
                                        data-cy="modify-user-all-phylomes-button"
                                        type="button"
                                        className="bg-blue-500 text-white py-2 px-4 mt-2 rounded-md w-full hover:bg-blue-600 border-transparent border-2 hover:border-blue-700"
                                        title="Modify email"
                                        onClick={editMailToAllPhylomes}
                                    >
                                        <p>Modify user for all phylomes</p>
                                    </button>
                                    <button
                                        data-cy="show-linked-phylomes-button"
                                        type="button"
                                        className="bg-blue-500 text-white py-2 px-4 mt-2 rounded-md w-full  hover:bg-blue-600 border-transparent border-2 hover:border-blue-700"
                                        onClick={showLinkedPhylomes}
                                        title="Show actual linked phylomes"
                                    >
                                        Show linked phylomes
                                    </button>
                                    <button
                                        data-cy="delete-user-button"
                                        type="button"
                                        className="bg-red-500 text-white py-2 px-4 mt-2 rounded-md w-full  hover:bg-red-600 border-transparent border-2 hover:border-red-700"
                                        onClick={deleteMailFromAllPhylomes}
                                        title="Delete user"
                                    >
                                        Remove User from all phylomes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    {/* //TODO decide if its necessary this menu , in edit all data menu this functinality is implemented check */}
                    {/* Name settings menu */}
                    {/* {actionMenuNum == 1 ? (
                        <ModifyUsernameMenu
                            newName={newName}
                            setIsOpenOptionsEmailMenu={
                                setIsOpenOptionsEmailMenu
                            }
                            setActionMenuNum={setActionMenuNum}
                            actionMenuNum={actionMenuNum}
                            closeCross={closeCross}
                            nameField={nameField}
                            setNewName={setNewName}
                            userSelected={userSelected}
                            setPhylomesData={setPhylomesData}
                            setErrorMessage={setErrorMessage}
                            setSuccessMessage={setSuccessMessage}
                            setUserSelected={setUserSelected}
                            phylomesData={phylomesData}
                        ></ModifyUsernameMenu>
                    ) : (
                        ""
                    )} */}

                    {/*MODIFY ALL DATA MENU*/}
                    {actionMenuNum == 2 ? (
                        <ModifyUserDataMenu
                            newName={newName}
                            setIsOpenOptionsEmailMenu={
                                setIsOpenOptionsEmailMenu
                            }
                            setActionMenuNum={setActionMenuNum}
                            closeCross={closeCross}
                            nameField={nameField}
                            emailField={emailField}
                            setNewName={setNewName}
                            newEmail={newEmail}
                            setNewEmail={setNewEmail}
                            userSelected={userSelected}
                            setPhylomesData={setPhylomesData}
                            setErrorMessage={setErrorMessage}
                            setSuccessMessage={setSuccessMessage}
                            setUserSelected={setUserSelected}
                            phylomesData={phylomesData}
                        ></ModifyUserDataMenu>
                    ) : (
                        ""
                    )}
                    {/*REMOVE USER FROM ALL PHYLOMES MENU*/}
                    {actionMenuNum == 3 ? (
                        <DeleteUserMenu
                            setActionMenuNum={setActionMenuNum}
                            closeCross={closeCross}
                            userSelected={userSelected}
                            setNewName={setNewName}
                            nameField={nameField}
                            emailField={emailField}
                            setIsOpenOptionsEmailMenu={
                                setIsOpenOptionsEmailMenu
                            }
                            setPhylomesData={setPhylomesData}
                            setSuccessMessage={setSuccessMessage}
                            setErrorMessage={setErrorMessage}
                            phylomesWithGivenMail={phylomesWithGivenMail}
                            phylomesData={phylomesData}
                        ></DeleteUserMenu>
                    ) : (
                        ""
                    )}
                    {/*Info About phylomes linked*/}
                    {actionMenuNum == 4 ? (
                        <ShowLinkedPhylomes
                            actionMenuNum={actionMenuNum}
                            setActionMenuNum={setActionMenuNum}
                            closeCross={closeCross}
                            userSelected={userSelected}
                            setNewName={setNewName}
                            nameField={nameField}
                            emailField={emailField}
                            setIsOpenOptionsEmailMenu={
                                setIsOpenOptionsEmailMenu
                            }
                            phylomesWithGivenMail={phylomesWithGivenMail}
                            searchLinkedPhylomeQuery={searchLinkedPhylomeQuery}
                            setSearchLinkedPhylomeQuery={
                                setSearchLinkedPhylomeQuery
                            }
                            phylomesWithGivenMailFiltered={
                                phylomesWithGivenMailFiltered
                            }
                            router={router}
                        ></ShowLinkedPhylomes>
                    ) : (
                        ""
                    )}
                </div>
            )}
        </div>
    );
}
