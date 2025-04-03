import DefaultLoadingPage from "@/components/default-loading-page/DefaultLoadingPage";
import HelpPage from "./_components/helpPage";

import { Suspense } from "react";
import { getAllHelpOptions } from "./_models/help";
import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";
import "./tiptap-styles.css";

export const metadata = {
    title: "PhylomeDB User Help Guide",
    description: "Learn how to use PhylomeDB with our detailed User Guide.",
};
export default async function Help() {
    const help = await getAllHelpOptions();
    const isAdmin = await checkIsAuthenticatedAsAdmin();

    return (
        <div className=" max-w-7xl mx-auto bg-white mt-3  ">
            
                <HelpPage helpOptions={help} admin={isAdmin} />
            
        </div>
    );
}
