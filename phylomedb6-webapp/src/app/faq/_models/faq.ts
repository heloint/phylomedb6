import persistentLocalDb from "@/persistentLocalDb";
import { faq } from "@/persistentLocalDb/persistentLocalSchema";
import { eq } from "drizzle-orm";

export type FaqOption = {
    id: number;
    timestamp: string;
    title: string;
    content: string;
};

export async function getAllFaqOptions(): Promise<FaqOption[]> {
    const result = await persistentLocalDb.select().from(faq);
    const data = result;
    return data;
}
export async function getFaqOptionById(
    faqOptionId: string,
): Promise<FaqOption> {
    const result = await persistentLocalDb
        .select()
        .from(faq)
        .where(eq(faq.id, Number(faqOptionId)))
        .limit(1);
    const data = result[0];
    return data;
}

export async function addFaqOption(
    newTitle: string,
    newContent: string,
): Promise<{}> {
    const result = await persistentLocalDb
        .insert(faq)
        .values({ title: newTitle, content: newContent })
        .returning({ insertedId: faq.id });
    const data = result;
    return data;
}

export async function deleteFaqOption(faqOptionId: string): Promise<{}> {
    const result = await persistentLocalDb
        .delete(faq)
        .where(eq(faq.id, Number(faqOptionId)));
    const count = result.changes;
    const deleted = count > 0;

    return { deleted, count };
}

export async function editFaqOption(
    faqOptionId: string,
    newTitle: string,
    newContent: string,
): Promise<{}> {
    const result = await persistentLocalDb
        .update(faq)
        .set({
            title: newTitle,
            content: newContent,
        })
        .where(eq(faq.id, Number(faqOptionId)))
        .returning({ updatedId: faq.id });

    const data = result[0];
    return data;
}
