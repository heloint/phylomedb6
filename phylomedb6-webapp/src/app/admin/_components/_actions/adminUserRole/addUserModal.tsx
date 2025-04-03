import { Dispatch, SetStateAction } from "react";
import { AdminUserData } from "@/app/admin/_models/manageAdminUsers";

interface AddUserModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    newUserData: { admin_email: string; admin_fullname: string };
    setNewUserData: Dispatch<
        SetStateAction<{ admin_email: string; admin_fullname: string }>
    >;
    setAdminUsers: Dispatch<SetStateAction<AdminUserData[]>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
}

export default function AddUserModal({
    isOpen,
    setIsOpen,
    newUserData,
    setNewUserData,
    setAdminUsers,
    setSuccessMessage,
    setErrorMessage,
}: AddUserModalProps) {
    if (!isOpen) return null;

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/admin/adminUsers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUserData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to add user");
            }

            setAdminUsers((prevUsers) => [
                ...prevUsers,
                {
                    user_id:
                        Math.max(...prevUsers.map((u) => u.user_id), 0) + 1,
                    admin_email: newUserData.admin_email,
                    admin_fullname: newUserData.admin_fullname,
                },
            ]);

            setSuccessMessage(
                `Admin user ${newUserData.admin_email} added successfully.`,
            );
            setErrorMessage("");
        } catch (error) {
            setSuccessMessage("");
            setErrorMessage(`Error ${newUserData.admin_email} already exists.`);
        }
        setNewUserData({ admin_email: "", admin_fullname: "" });
        setIsOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center">
            <div
                data-cy="add-admin-user-modal"
                className="bg-white p-5 rounded-md border-2 border-slate-300 shadow-lg w-96 h-fit relative mb-16 top-96"
                style={{
                    top:
                        window.innerWidth >= 768
                            ? `${window.scrollY + 100}px`
                            : `150px`,
                }}
            >
                <h2 className="text-xl mb-4">Add Admin User</h2>
                <form onSubmit={handleAddUser}>
                    <input
                        data-cy="email-input-admin"
                        type="email"
                        placeholder="Email"
                        value={newUserData.admin_email}
                        onChange={(e) =>
                            setNewUserData({
                                ...newUserData,
                                admin_email: e.target.value,
                            })
                        }
                        className="block w-full p-2 mb-2 border rounded"
                        required
                    />
                    <input
                        data-cy="name-input-admin"
                        type="text"
                        placeholder="Full Name"
                        value={newUserData.admin_fullname}
                        onChange={(e) =>
                            setNewUserData({
                                ...newUserData,
                                admin_fullname: e.target.value,
                            })
                        }
                        className="block w-full p-2 mb-4 border rounded"
                        required
                    />
                    <div className="flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setNewUserData({
                                    admin_email: "",
                                    admin_fullname: "",
                                });
                            }}
                            className="bg-gray-500 text-white w-1/2 px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            data-cy="confirm-add-new-admin-user-button"
                            type="submit"
                            className="bg-blue-500 text-white w-1/2 px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
