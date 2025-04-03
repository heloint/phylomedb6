"use server";
import { deleteHelpOption, editHelpOption } from "../../_models/help";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

export type CreateHelpGuideState = {
    message: string;
    error: string;
};

export async function editHelpGuide(
    initialState: CreateHelpGuideState,
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
                await editHelpOption(id, title, content);
                revalidatePath(`/help/edit/${id}`);
            } catch (error) {
                return {
                    message: null,
                    error: "Error has occured during process.",
                };
            }

            return { message: "Successfully edited help guide!", error: null };

        case "delete":
            if (!id) {
                return {
                    message: null,
                    error: "Invalid formdata was received! Missing 'id' .",
                };
            }

            try {
                await deleteHelpOption(id);
                revalidatePath("/help");
            } catch (error) {
                return {
                    message: null,
                    error: "Error has occured during process.",
                };
            }
            redirect("/help", RedirectType.replace);
    }
}
