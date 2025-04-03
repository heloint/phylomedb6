"use server";

import { redirect, RedirectType } from "next/navigation";
import { deleteFaqOption, editFaqOption } from "../../_models/faq";
import { revalidatePath } from "next/cache";
export type CreateFAQGuideState = {
    message: string;
    error: string;
};

export async function editFaqGuide(
    initialState: CreateFAQGuideState,
    formData: FormData,
): Promise<any> {
    const action: string = formData.get("action") as string;
    const id: string = formData.get("id") as string;
    const title: string = formData.get("title") as string;
    const content: string = formData.get("content") as string;

    switch (action) {
        case "edit":
            if (
                (!title || /^\d+$/.test(title)) &&
                (!content || /^\d+$/.test(content))
            ) {
                return {
                    message: null,
                    error: "Invalid formdata was received! Missing 'title' and 'content'.",
                };
            } else if (!title || /^\d+$/.test(title)) {
                return {
                    message: null,
                    error: "Invalid formdata was received! Missing 'title'.",
                };
            } else if (!content || /^\d+$/.test(content)) {
                return {
                    message: null,
                    error: "Invalid formdata was received! Missing 'content'.",
                };
            }

            try {
                await editFaqOption(id, title, content);
                revalidatePath(`/faq/edit/${id}`);
            } catch (error) {
                return {
                    message: null,
                    error: "Error has occured during process.",
                };
            }

            return { message: "Successfully edited faq!", error: null };

        case "delete":
            if (!id) {
                return {
                    message: null,
                    error: "Invalid formdata was received! Missing 'id' .",
                };
            }

            try {
                await deleteFaqOption(id);
                revalidatePath("/faq");
            } catch (error) {
                return {
                    message: null,
                    error: "Error has occured during process.",
                };
            }
            redirect("/faq", RedirectType.replace);
    }
}
