"use server";
import { revalidatePath } from "next/cache";
import { addHelpOption } from "../_models/help";

export type CreateHelpGuideState = {
    message: string | null;
    error: string | null;
};

export async function createNewHelpGuide(
    initialState: CreateHelpGuideState,
    formData: FormData,
): Promise<CreateHelpGuideState> {
    const title: string = formData.get("title") as string;
    const content: string = formData.get("content") as string;

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
        const insertResult = await addHelpOption(title, content);
        revalidatePath("/help", "page");
    } catch (error: any) {
        if (error.message === "UNIQUE constraint failed: help.title") {
            return {
                message: null,
                error: `Guide with title: ${title}, already exists in the database.`,
            };
        }
        return { message: null, error: "Error has occured during process." };
    }

    return { message: "Successfully created new help guide!", error: null };
}
