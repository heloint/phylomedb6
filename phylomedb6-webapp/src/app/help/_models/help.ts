import persistentLocalDb from "@/persistentLocalDb";
import { help } from "@/persistentLocalDb/persistentLocalSchema";
import { eq } from "drizzle-orm";

export type HelpOption = {
    id: number;
    timestamp: string;
    title: string;
    content: string;
};

export async function getAllHelpOptions(): Promise<HelpOption[]> {
    const result = await persistentLocalDb.select().from(help);
    const data = result;
    return data;
}
export async function getHelpOptionById(
    helpOptionId: string,
): Promise<HelpOption> {
    const result = await persistentLocalDb
        .select()
        .from(help)
        .where(eq(help.id, Number(helpOptionId)))
        .limit(1);
    const data = result[0];
    return data;
}

export async function addHelpOption(
    newTitle: string,
    newContent: string,
): Promise<{}> {
    const result = await persistentLocalDb
        .insert(help)
        .values({ title: newTitle, content: newContent })
        .returning({ insertedId: help.id });
    const data = result;
    return data;
}

export async function deleteHelpOption(helpOptionId: string): Promise<{}> {
    const result = await persistentLocalDb
        .delete(help)
        .where(eq(help.id, Number(helpOptionId)));
    const count = result.changes;
    const deleted = count > 0;

    return { deleted, count };
}

export async function editHelpOption(
    helpOptionId: string,
    newTitle: string,
    newContent: string,
): Promise<{}> {
    const result = await persistentLocalDb
        .update(help)
        .set({
            title: newTitle,
            content: newContent,
        })
        .where(eq(help.id, Number(helpOptionId)))
        .returning({ updatedId: help.id });

    const data = result[0];
    return data;
}
