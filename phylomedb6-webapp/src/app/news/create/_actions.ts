"use server";
import persistentLocalDb from "@/persistentLocalDb";
import { news } from "@/persistentLocalDb/persistentLocalSchema";
import { revalidatePath } from "next/cache";

export type CreateNewsPostState = {
    message: string;
    error: string;
};

export async function createNewsPost(
    initialState: CreateNewsPostState,
    formData: FormData,
): Promise<any> {
    const title: string = formData.get("title") as string;
    const description: string = formData.get("description") as string;
    const content: string = formData.get("content") as string;

    if (!title) {
        return {
            message: null,
            error: "Invalid formdata was received! Missing 'title'.",
        };
    } else if (!description) {
        return {
            message: null,
            error: "Invalid formdata was received! Missing 'description'.",
        };
    } else if (!content) {
        return {
            message: null,
            error: "Invalid formdata was received! Missing 'content'.",
        };
    }

    try {
        const insertResult = await persistentLocalDb.insert(news).values({
            title: title,
            description: description,
            content: content,
        });
        revalidatePath("/", "page");
        revalidatePath("/news/all", "page");
    } catch (error) {
        return { message: null, error: "Error has occured during process." };
    }

    return { message: "Successfully created news post!", error: null };
}
