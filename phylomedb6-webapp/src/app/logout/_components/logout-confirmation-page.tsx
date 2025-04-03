"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutConfirmationPage() {
    const [message, setMessage] = useState("");
    const router = useRouter();

    const logoutUser = async () => {
        try {
            const response = await fetch(`/api/auth/logout`, {
                cache: "no-store",
            });
            if (response.ok) {
                // Leave the data commented out. For now we don't need it.
                // So it's unnecessary to parse the response json.
                // const data = await response.json();

                router.push("/");
                router.refresh();
            } else if (response.status === 401) {
                setMessage("You are already logged out");
            }
        } catch (error) {
            setMessage(`Error has occured during log out`);
        }
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center my-3">
                <div className="flex flex-row my-3 m:w-1/3 lg:w-1/3 bg-white bg-opacity-75 rounded-lg gap-3 justify-center items-center">
                    {message ? (
                        <div className="flex flex-col text-center gap-3">
                            <p className="p-10">{message}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col text-center gap-3">
                            <h1 className="text-2xl px-10 pt-4 font-semibold underline decoration-solid">
                                Logout
                            </h1>
                            <p className="px-10 pt-2">
                                Do you want to log out?
                            </p>

                            <div className="flex flex-row justify-center items-center my-2 gap-5">
                                <button
                                    className={
                                        "py-2 px-2 w-1/3 my-4 text-md text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60 border-2 hover:border-solid border-slate-700"
                                    }
                                    onClick={() => logoutUser()}
                                >
                                    {" "}
                                    Yes
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="py-2 px-2 w-1/3 my-4 text-md text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60 border-2 hover:border-solid border-slate-700"
                                >
                                    {" "}
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
