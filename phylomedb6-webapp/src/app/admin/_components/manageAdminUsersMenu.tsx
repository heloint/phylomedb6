"use client";

import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { AdminUserData } from "../_models/manageAdminUsers";
import AddUserModal from "./_actions/adminUserRole/addUserModal";
import EditUserModal from "./_actions/adminUserRole/editUserModal";
import DeleteUserModal from "./_actions/adminUserRole/deleteUserModal";

export default function AdminMenu({
    allAdminUsers,
}: {
    allAdminUsers: AdminUserData[];
}) {
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    return (
        <div className="flex flex-col gap-3  w-full items-center">
            {successMessage && (
                <SuccessMessageWindow operationTitle={successMessage} />
            )}
            {errorMessage && <ErrorMessageWindow errorMessage={errorMessage} />}
            <div className="flex  py-3 shadow-lg  px-3.5 md:px-7 lg:px-14 flex-col sm:flex-col bg-white justify-center items-center content-center border-2 rounded-md w-full">
                <div className="flex px-5 md:px-10 lg:px-20 flex-col sm:flex-col bg-white justify-center items-center content-center rounded-md lg:w-6/12 sm:w-8/12 mt-0 mb-4">
                    <h1 className="text-3xl underline decoration-solid min-w-60 text-center">
                        Manage Admin Users
                    </h1>
                </div>

                <div className="flex py-3 px-2.5 md:px-2.5 lg:px-5 flex-row sm:flex-row bg-white border-slate-300 shadow-md content-center border-2 rounded-md w-full">
                    <AdminUserMenu
                        initialAdminUsers={allAdminUsers}
                        isMenuOpen={isMenuOpen}
                        setIsMenuOpen={setIsMenuOpen}
                        setSuccessMessage={setSuccessMessage}
                        setErrorMessage={setErrorMessage}
                    />
                </div>
            </div>
        </div>
    );
}

function AdminUserMenu({
    initialAdminUsers,
    isMenuOpen,
    setIsMenuOpen,
    setSuccessMessage,
    setErrorMessage,
}: {
    initialAdminUsers: AdminUserData[];
    isMenuOpen: boolean;
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
}) {
    const [adminUsers, setAdminUsers] =
        useState<AdminUserData[]>(initialAdminUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterField, setFilterField] = useState<"email" | "name">("email");
    const [isAddUserModalOpen, setIsAddUserModalOpen] =
        useState<boolean>(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] =
        useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(
        null,
    );
    const [userToDelete, setUserToDelete] = useState<AdminUserData | null>(
        null,
    );
    const [newUserData, setNewUserData] = useState({
        admin_email: "",
        admin_fullname: "",
    });
    const [isModalActionsOpen, setModalActionsOpen] = useState<boolean>(false);

    const filteredUsers = adminUsers.filter((user) => {
        const searchTerm = searchQuery.toLowerCase();
        return filterField === "email"
            ? user.admin_email.toLowerCase().includes(searchTerm)
            : user.admin_fullname.toLowerCase().includes(searchTerm);
    });
    const divContentref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (divContentref.current) {
            divContentref.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [isMenuOpen]);

    useEffect(() => {
        if (
            isAddUserModalOpen ||
            isEditUserModalOpen ||
            isDeleteModalOpen ||
            isModalActionsOpen
        ) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [
        isAddUserModalOpen,
        isEditUserModalOpen,
        isDeleteModalOpen,
        isModalActionsOpen,
    ]);

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

    const addUser = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="22"
            fill="currentColor"
            className="bi bi-person-plus"
            viewBox="0 0 16 16"
        >
            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            <path
                fillRule="evenodd"
                d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"
            />
        </svg>
    );

    return (
        <div className="w-full">
            <div className="flex flex-row ">
                <button
                    data-cy="toggle-admin-menu-button"
                    title="Toggle admin users menu"
                    className="w-auto p-2 ml-0.5  border-slate-300 shadow-md justify-center items-center border-2 rounded-xl text-2xl bg-white text-black hover:bg-gray-50 hover:border-slate-900 hover:shadow-md transition-all duration-300 ease-in-out"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? chevronDownSVG : chevronRightSVG}
                </button>
                <button
                    data-cy="create-new-admin-user-button"
                    title="Create new admin user"
                    className="w-auto ml-2 p-2  border-slate-300 shadow-md justify-center items-center border-2 rounded-xl text-2xl bg-white text-black hover:bg-gray-50 hover:border-slate-900 hover:shadow-md transition-all duration-300 ease-in-out"
                    onClick={() => setIsAddUserModalOpen(true)}
                >
                    {addUser}
                </button>
            </div>
            {isMenuOpen && (
                <div className="mt-4" ref={divContentref}>
                    <div className="mb-4 flex justify-between items-center">
                        <div className="flex gap-2 w-full sm:w-80">
                            <select
                                data-cy="select-filter-search-admin"
                                value={filterField}
                                onChange={(e) =>
                                    setFilterField(
                                        e.target.value as "email" | "name",
                                    )
                                }
                                className="p-2 rounded border-2 border-slate-300 shadow-lg hover:border-black"
                            >
                                <option value="email">Email</option>
                                <option value="name">Name</option>
                            </select>
                            <input
                                data-cy="searchbar-email-name-input"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search by ${filterField}`}
                                className="p-2 border-2 rounded border-slate-300 w-full shadow-lg hover:border-black"
                            />
                        </div>
                    </div>

                    <div className="rounded px-3 py-4 border-2 border-slate-300  ">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <div
                                    data-cy="email-name-div-filtered"
                                    key={user.user_id}
                                    className="flex justify-between items-center  hover:bg-gray-200 w-full cursor-pointer rounded-lg px-4 group"
                                    onClick={() => {
                                        setModalActionsOpen(true);
                                        setSelectedUser(user);
                                    }}
                                >
                                    <div className=" hover:scale-110 transition-transform p-2 duration-300 ease-in-out transform origin-left w-full h-full text-left  ">
                                        {filterField === "email" ? (
                                            <div>
                                                <strong>Email:</strong>{" "}
                                                {user.admin_email}
                                            </div>
                                        ) : (
                                            <div>
                                                <strong>Name:</strong>{" "}
                                                {user.admin_fullname}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className=" text-center py-2 text-gray-500">
                                No users found
                            </div>
                        )}
                    </div>

                    {isModalActionsOpen ? (
                        <div>
                            <div className="fixed inset-0 bg-white  bg-opacity-30 flex justify-center ">
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
                                            setModalActionsOpen(false);
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
                                            className="block w-full p-2 mb-2 border rounded "
                                            type="text"
                                            value={selectedUser?.admin_email}
                                        />
                                    </div>
                                    <div className="flex justify-center w-full">
                                        <input
                                            name="name-input"
                                            title="User name"
                                            disabled
                                            type="text"
                                            value={
                                                selectedUser?.admin_fullname
                                                    ? selectedUser?.admin_fullname
                                                    : ""
                                            }
                                            className={
                                                selectedUser?.admin_fullname
                                                    ? "block w-full p-2 mb-4 border rounded"
                                                    : "hidden"
                                            }
                                        />
                                    </div>

                                    <button
                                        data-cy="modify-admin-user-button"
                                        type="button"
                                        className="bg-blue-500 text-white py-2 px-4 mt-2 rounded-md w-full hover:bg-blue-600 border-transparent border-2 hover:border-blue-700"
                                        title="Modify email"
                                        onClick={() => {
                                            setNewUserData({
                                                admin_email: selectedUser
                                                    ? selectedUser.admin_email
                                                    : "",
                                                admin_fullname: selectedUser
                                                    ? selectedUser.admin_fullname
                                                    : "",
                                            });
                                            setIsEditUserModalOpen(true);
                                            setModalActionsOpen(
                                                !isModalActionsOpen,
                                            );
                                        }}
                                    >
                                        <p>Modify admin user</p>
                                    </button>

                                    <button
                                        data-cy="delete-admin-user-button"
                                        type="button"
                                        className="bg-red-500 text-white py-2 px-4 mt-2 rounded-md w-full  hover:bg-red-600 border-transparent border-2 hover:border-red-700"
                                        onClick={() => {
                                            setUserToDelete(selectedUser);
                                            setIsDeleteModalOpen(true);
                                            setModalActionsOpen(
                                                !isModalActionsOpen,
                                            );
                                        }}
                                        title="Delete user"
                                    >
                                        Remove admin user
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}

                    <EditUserModal
                        isOpen={isEditUserModalOpen}
                        setIsOpen={setIsEditUserModalOpen}
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                        newUserData={newUserData}
                        setNewUserData={setNewUserData}
                        setAdminUsers={setAdminUsers}
                        setSuccessMessage={setSuccessMessage}
                        setModalActionsOpen={setModalActionsOpen}
                        setErrorMessage={setErrorMessage}
                        closeCross={closeCross}
                    />

                    <DeleteUserModal
                        isOpen={isDeleteModalOpen}
                        setIsOpen={setIsDeleteModalOpen}
                        userToDelete={userToDelete}
                        setAdminUsers={setAdminUsers}
                        setSuccessMessage={setSuccessMessage}
                        setModalActionsOpen={setModalActionsOpen}
                        setErrorMessage={setErrorMessage}
                    />
                </div>
            )}{" "}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                setIsOpen={setIsAddUserModalOpen}
                newUserData={newUserData}
                setNewUserData={setNewUserData}
                setAdminUsers={setAdminUsers}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
            />
        </div>
    );
}
