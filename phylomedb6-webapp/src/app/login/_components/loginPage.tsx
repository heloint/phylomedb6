"use client";

import { useEffect, useState } from "react";
import { handleLoginRequest } from "@/auth/sendLoginRequest";
import ErrorMessage from "@/components/errorMessage/errorMessage";
import { useRouter, useSearchParams } from "next/navigation";
import { validateLoginRequest } from "@/auth/validateLoginRequest";
import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import SuccessMessageWindow from "@/components/success-message-window/SuccessMessageWindow";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
    const searchParams = useSearchParams();
    const router = useRouter();
    let token = searchParams.get("login_token");

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [emailValidationMessage, setEmailValidationMessage] = useState("");

    useEffect(() => {
        if (token) {
            validateToken(token);
        }
        setIsLoading(false);
    }, [token]);

    async function validateToken(token: string) {
        const validationResult = await validateLoginRequest(token);
        if (!validationResult.error) {
            router.push("/");
        } else {
            // Without this else during the validation process, the message below (session is no longer active) appears.
            setMessage(`Your session is no longer active. Please log in.
          <a href="${loginLink}" style="color: blue; text-decoration: underline;">Login</a>`);
        }
    }

    function validateEmail() {
        const emailPattern =
            /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;
        if (emailPattern.test(email)) {
            setEmailValidationMessage("");
            return true;
        }
        setEmailValidationMessage("Please enter a valid email address");
        return false;
    }

    async function sendLoginRequest() {
        if (validateEmail()) {
            const result = await handleLoginRequest(email);

            if (result.error) {
                setMessage("Failed to send email. Please try again later.");
            }
            setMessage(result.message);
        }
        setIsLoading(false);
    }

    if (isLoading) {
        return <DefaultLoadingPage />;
    }

    if (token) {
        return message ? (
            <div className="flex flex-col justify-center items-center mt-6">
                <div className="flex flex-row my-6 w-1/3 bg-white bg-opacity-75 rounded-lg gap-3 justify-center items-center">
                    <div
                        className="flex flex-col text-center gap-3 my-6 "
                        dangerouslySetInnerHTML={{ __html: message }}
                    />
                </div>
            </div>
        ) : null;
    }

    if (message) {
        return (
            <div className="flex w-full justify-center items-center my-9">
                <SuccessMessageWindow operationTitle={message} />
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col justify-center items-center my-3">
                <div className="flex flex-row my-3 m:w-1/3 lg:w-1/3 bg-white bg-opacity-75 rounded-lg gap-3 justify-center items-center">
                    <div className="flex flex-col text-center gap-3">
                        <h1 className="text-2xl px-10 pt-4 font-semibold underline decoration-solid">
                            Login
                        </h1>
                        <p className="px-10 pt-2">
                            Enter your email below to login to your account
                        </p>
                        <form
                            onSubmit={(e) => {
                                setIsLoading(true);
                                e.preventDefault();
                                sendLoginRequest();
                            }}
                        >
                            <div className="flex flex-col gap-2 p-4">
                                <div>
                                    <input
                                        data-cy="email-input"
                                        id="email"
                                        name="email"
                                        type="email"
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Enter your email"
                                        required
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-black-500 border-black-500 block w-full p-2.5"
                                    />
                                    <ErrorMessage
                                        message={emailValidationMessage}
                                    />
                                </div>
                            </div>

                            <button
                                data-cy="submit"
                                type="submit"
                                className="py-2 px-2 w-1/3 my-4 text-md text-gray-900 rounded bg-gray-200
                   backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60 border-2 hover:border-solid border-slate-700"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
