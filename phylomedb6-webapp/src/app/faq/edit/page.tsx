import { redirect } from "next/navigation";

export const metadata = {
    title: "Edit PhylomeDB Frequently Asked Questions",
    description:
        "Edit the content and titles of items in the PhylomeDB Frequently Asked Questions.",
};

export default function EditRedirect() {
    redirect("/faq");
}
