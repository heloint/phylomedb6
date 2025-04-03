import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import PrivatePhylomes from "./_components/privatePhylomesSelector";

import { Suspense } from "react";
import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkIsAuthenticated } from "@/auth/checkSession";

import AdminMenu from "./_components/manageAdminUsersMenu";
import UserEditMenu from "./_components/manageUserMenu";

import { getAllPrivatePhylomes } from "../../_models/admin/privatePhylomesLocal";
import { getAllPhylomesData } from "../../_models/admin/phylomes/privatePhylomesRelations";
import { getAllAdminUsers } from "./_models/manageAdminUsers";

export const metadata = {
    title: "PhylomeDB Admin Control Pannel",
    description:
        "The PhylomeDB Admin Control Panel provides a user-friendly interface for managing and organizing phylogenetic data. " +
        "It enables administrators to efficiently control user access, data visualization, and system management in a secure environment.",
};

export default async function Admin() {
    let phylomes = await getAllPrivatePhylomes();
    let allPrivatePhylomesData = await getAllPhylomesData();
    let allAdminUsers = await getAllAdminUsers();
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
                        <div className="flex px-0 py-0 sm:py-4 sm:px-10 min-h-80  justify-center flex-col   sm:backdrop-blur-sm bg-slate-100 bg-opacity-0 sm:bg-opacity-50 rounded-lg">
                            <PrivatePhylomes phylomesIds={phylomes} />
                            <UserEditMenu
                                allPrivatePhylomesData={allPrivatePhylomesData}
                            ></UserEditMenu>
                            <AdminMenu
                                allAdminUsers={allAdminUsers}
                            ></AdminMenu>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
