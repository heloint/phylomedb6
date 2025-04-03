"use server";
import persistentLocalDb from "@/persistentLocalDb";
import { news } from "@/persistentLocalDb/persistentLocalSchema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type UpdateNewsPostState = {
    message: string | null;
    error: string | null;
};

type DeleteNewsPostState = {
    error: string | null;
};

export async function updateNewsPost(
    initialState: UpdateNewsPostState,
    formData: FormData,
): Promise<any> {
    const newsId: string = formData.get("id") as string;
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
        const existingPost = await persistentLocalDb
            .select()
            .from(news)
            .where(eq(news.id, Number(newsId)));

        if (!existingPost || existingPost.length === 0) {
            return {
                message: null,
                error: "Post not found.",
            };
        }

        const currentPost = existingPost[0];

        if (
            currentPost.title === title &&
            currentPost.description === description &&
            currentPost.content === content
        ) {
            return {
                message: null,
                error: "No changes detected. Please modify at least one field.",
            };
        }

        await persistentLocalDb
            .update(news)
            .set({ title: title, description: description, content: content })
            .where(eq(news.id, Number(newsId)));

        revalidatePath("/", "page");
        revalidatePath("/news/all", "page");
    } catch (error) {
        return {
            message: null,
            error: "An error has occurred during the update process.",
        };
    }

    return { message: "Successfully updated post!", error: null };
}

export async function deleteNewsPost(
    initialState: DeleteNewsPostState,
    formData: FormData,
): Promise<any> {
    const newsId: string = formData.get("id") as string;
    if (!newsId) {
        return {
            message: null,
            error: "Invalid formdata was received! Missing 'id'.",
        };
    }
    try {
        await persistentLocalDb.delete(news).where(eq(news.id, Number(newsId)));
        revalidatePath("/", "page");
        revalidatePath("/news/all", "page");
    } catch (error) {
        return {
            message: null,
            error: "An error has occurred during the delete process.",
        };
    }

    redirect("/news/all");
}
