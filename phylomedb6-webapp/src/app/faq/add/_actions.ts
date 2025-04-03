"use server";
import { revalidatePath } from "next/cache";
import { addFaqOption } from "../_models/faq";

export type CreateFaqState = {
    message: string | null;
    error: string | null;
};

export async function createNewFaq(
    initialState: CreateFaqState,
    formData: FormData,
): Promise<CreateFaqState> {
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
        const insertResult = await addFaqOption(title, content);
        revalidatePath("/faq", "page");
    } catch (error: any) {
        if (error.message === "UNIQUE constraint failed: faq.title") {
            return {
                message: null,
                error: `FAQ with title: ${title}, already exists in the database.`,
            };
        }
        return { message: null, error: "Error has occured during process." };
    }

    return { message: "Successfully created new faq guide!", error: null };
}
