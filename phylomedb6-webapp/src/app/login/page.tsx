import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import LoginPage from "./_components/loginPage";

import { Suspense } from "react";

import { checkIsAuthenticated } from "@/auth/checkSession";
import { redirect } from "next/navigation";

export default async function Login() {
    const isLoggedIn = await checkIsAuthenticated();
    if (isLoggedIn) {
        return redirect("/");
    }
    return (
        <div >
            <LoginPage />
        </div>
    );
}
