import localDb from "@/localDb";
import { history } from "@/localDb/localSchema";
import { eq } from "drizzle-orm";

export type HistoryOption = {
    search_id: number;
    search_type: string;
    input_data: string;
    timestamp: string | null;
    user_email_address: string;
};

// Get all entries from the `history` table
export async function getAllHistoryOptions(
    userEmail: string,
): Promise<HistoryOption[]> {
    const result = await localDb
        .select()
        .from(history)
        .where(eq(history.user_email_address, userEmail));
    return result;
}

// Get a specific entry by `search_id`
export async function getHistoryOptionById(
    searchId: string,
): Promise<HistoryOption> {
    const result = await localDb
        .select()
        .from(history)
        .where(eq(history.search_id, Number(searchId)))
        .limit(1);
    return result[0];
}

// Add a new entry to `history`
export async function addHistoryOption(
    newSearchType: string,
    newInputData: string,
    userEmail: string,
) {
    await localDb.insert(history).values({
        search_type: newSearchType,
        input_data: newInputData,
        user_email_address: userEmail,
    });
}

// Delete an entry from `history` by `search_id`
export async function deleteHistoryOption(
    searchId: string,
): Promise<{ deleted: boolean; count: number }> {
    const result = await localDb
        .delete(history)
        .where(eq(history.search_id, Number(searchId)));
    const count = result.changes;
    const deleted = count > 0;
    return { deleted, count };
}
