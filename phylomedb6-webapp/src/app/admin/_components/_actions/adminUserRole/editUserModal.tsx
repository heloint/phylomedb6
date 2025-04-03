import { Dispatch, SetStateAction } from "react";
import { AdminUserData } from "@/app/admin/_models/manageAdminUsers";

interface EditUserModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    selectedUser: AdminUserData | null;
    setSelectedUser: Dispatch<SetStateAction<AdminUserData | null>>;
    newUserData: { admin_email: string; admin_fullname: string };
    setNewUserData: Dispatch<
        SetStateAction<{ admin_email: string; admin_fullname: string }>
    >;
    setAdminUsers: Dispatch<SetStateAction<AdminUserData[]>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    setModalActionsOpen: Dispatch<SetStateAction<boolean>>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
    closeCross: JSX.Element;
}

export default function EditUserModal({
    isOpen,
    setIsOpen,
    selectedUser,
    setSelectedUser,
    newUserData,
    setNewUserData,
    setAdminUsers,
    setSuccessMessage,
    setModalActionsOpen,
    setErrorMessage,
    closeCross,
}: EditUserModalProps) {
    if (!isOpen || !selectedUser) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (
                newUserData.admin_email === selectedUser.admin_email &&
                newUserData.admin_fullname === selectedUser.admin_fullname
            ) {
                alert("The data can't be the same");
                return;
            }

            const response = await fetch("/api/admin/adminUsers", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: selectedUser.user_id,
                    admin_email: newUserData.admin_email,
                    admin_fullname: newUserData.admin_fullname,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error updating user");
            }

            setAdminUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.user_id === selectedUser.user_id
                        ? {
                              ...user,
                              admin_email: newUserData.admin_email,
                              admin_fullname: newUserData.admin_fullname,
                          }
                        : user,
                ),
            );

            setSuccessMessage(
                `Admin user ${selectedUser.admin_email} updated successfully`,
            );
            setErrorMessage("");

            setSelectedUser(null);
            setNewUserData({ admin_email: "", admin_fullname: "" });
        } catch (error) {
            setErrorMessage(`${error}`);
            setSuccessMessage("");
        }
        setIsOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center">
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
                    onClick={() => {
                        setModalActionsOpen(false);
                        setIsOpen(false);
                    }}
                    className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 hover:scale-105 hover:bg-red-100"
                >
                    {closeCross}
                </button>
                <h2 className="text-xl mb-4">Edit Admin User</h2>

                <form onSubmit={handleSubmit} className="space-y-2">
                    <input
                        data-cy="email-input-admin"
                        type="email"
                        name="admin_email"
                        placeholder="Email"
                        value={newUserData.admin_email}
                        onChange={handleChange}
                        required
                        className="block w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        data-cy="name-input-admin"
                        type="text"
                        name="admin_fullname"
                        placeholder="Full Name"
                        value={newUserData.admin_fullname}
                        onChange={handleChange}
                        required
                        className="block w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex justify-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setModalActionsOpen(true);
                            }}
                            className="bg-gray-500 text-white px-4 w-1/2 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            data-cy="confirm-update-button"
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 w-1/2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
