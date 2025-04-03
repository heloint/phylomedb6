import { Suspense } from "react";
import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import { checkIsAuthenticated } from "@/auth/checkSession";
import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";
import PrivatePhylomesMenu from "./_components/PrivatePhylomesMenu";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = {
    title: "Phylomes admin page",
    description: "Manage access to private phylomes",
};

export default async function Page() {
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    const isAuthenticated = await checkIsAuthenticated();

    if (!isAdmin || !isAuthenticated) {
        revalidatePath("/", "layout");
        return redirect("/");
    }

    return (
        <Suspense fallback={<DefaultLoadingPage />}>
            <div className="pt-2  pb-6 px-4 sm:px-8 lg:px-32 mx-auto bg-slate-200 bg-opacity-40 w-full ">
                <div className="h-full flex flex-col  mt-3  ">
                    <div className="h-full flex flex-col ">
                        <div className="flex px-0 py-0 sm:py-4 sm:px-10 min-h-96  justify-center    sm:backdrop-blur-sm bg-slate-100 bg-opacity-0 sm:bg-opacity-50 rounded-lg">
                            <PrivatePhylomesMenu
                                sessionData={isAuthenticated}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
