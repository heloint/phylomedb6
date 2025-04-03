import { redirect } from "next/navigation";

export const metadata = {
    title: "Edit PhylomeDB User Help Guide",
    description:
        "Edit the content and titles of items in the PhylomeDB User Help Guide.",
};

export default async function EditRedirect() {
    redirect("/help");
}
