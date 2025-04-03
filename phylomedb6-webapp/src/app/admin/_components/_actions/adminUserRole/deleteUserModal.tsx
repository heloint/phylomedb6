import { Dispatch, SetStateAction } from "react";
import { AdminUserData } from "@/app/admin/_models/manageAdminUsers";

interface DeleteUserModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    userToDelete: AdminUserData | null;
    setAdminUsers: Dispatch<SetStateAction<AdminUserData[]>>;
    setModalActionsOpen: Dispatch<SetStateAction<boolean>>;
    setSuccessMessage: Dispatch<SetStateAction<string>>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
}

export default function DeleteUserModal({
    isOpen,
    setIsOpen,
    userToDelete,
    setAdminUsers,
    setModalActionsOpen,
    setSuccessMessage,
    setErrorMessage,
}: DeleteUserModalProps) {
    if (!isOpen || !userToDelete) return null;

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `/api/admin/adminUsers?user_email=${encodeURIComponent(JSON.stringify(userToDelete.admin_email))}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            setAdminUsers((prevUsers) =>
                prevUsers.filter(
                    (user) => user.admin_email !== userToDelete.admin_email,
                ),
            );
            setSuccessMessage(
                `Admin user ${userToDelete.admin_email} deleted successfully.`,
            );
            setErrorMessage("");
        } catch (error) {
            setSuccessMessage("");
            setErrorMessage(`Error deleting ${userToDelete.admin_email}.`);
        }
        setIsOpen(false);
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
                <h2 className="text-xl mb-4">Delete Admin User</h2>
                <p className="mb-4">
                    Are you sure you want to delete the admin user{" "}
                    <span className="font-semibold">
                        {userToDelete.admin_email}
                    </span>
                    ?
                    <br />
                    This action cannot be undone.
                </p>
                <form
                    onSubmit={handleDelete}
                    className="flex justify-center gap-2"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            setModalActionsOpen(true);
                        }}
                        className="bg-gray-500 text-white px-4 py-2 w-1/2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        data-cy="confirm-delete-admin-user-button"
                        type="submit"
                        className="bg-red-500 text-white px-4 py-2 w-1/2 rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                </form>
            </div>
        </div>
    );
}
