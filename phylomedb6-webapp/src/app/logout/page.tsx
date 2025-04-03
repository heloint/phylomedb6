import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import LogoutConfirmationPage from "./_components/logout-confirmation-page";

import { Suspense } from "react";
import { checkIsAuthenticated } from "@/auth/checkSession";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function LogOut() {
    const isLoggedIn = await checkIsAuthenticated();

    if (!isLoggedIn) {
        revalidatePath("/", "layout");
        return redirect("/");
    }
    return (
        <Suspense fallback={<DefaultLoadingPage />}>
            <LogoutConfirmationPage />
        </Suspense>
    );
}
