import persistentLocalDb from "@/persistentLocalDb";
import { phylomes_allowed_users } from "@/persistentLocalDb/persistentLocalSchema";
import { and, eq, inArray } from "drizzle-orm";

export type PhylomeAllowedUserData = {
    user_email_address: string;
    user_full_name: string | null;
    phylome_id: number;
};

export async function getEmailsByPhylomeId(
    phylomeIds: number[],
): Promise<{ phylome_id: number; user_email_address: string }[]> {
    const result = await persistentLocalDb
        .select({
            phylome_id: phylomes_allowed_users.phylome_id,
            user_email_address: phylomes_allowed_users.user_email_address,
        })
        .from(phylomes_allowed_users)
        .where(inArray(phylomes_allowed_users.phylome_id, phylomeIds));
    return result;
}

// delete by mail && phylome id
export async function removePhylomeByEmailAndId(
    user_email_address: string,
    phylomeIds: number,
) {
    await persistentLocalDb
        .delete(phylomes_allowed_users)
        .where(
            and(
                eq(
                    phylomes_allowed_users.user_email_address,
                    user_email_address,
                ),
                eq(phylomes_allowed_users.phylome_id, phylomeIds),
            ),
        );
}

export async function addPhylomeByEmailAndId(
    user_email_address: string,
    phylomeIds: number,
) {
    await persistentLocalDb.insert(phylomes_allowed_users).values({
        user_email_address: user_email_address,
        phylome_id: phylomeIds,
    });
}

export async function updateEmailByPhylomeId(
    user_email_address: string,
    new_email: string,
    phylomeIds: number,
) {
    await persistentLocalDb
        .update(phylomes_allowed_users)
        .set({ user_email_address: new_email })
        .where(
            and(
                eq(
                    phylomes_allowed_users.user_email_address,
                    user_email_address,
                ),
                eq(phylomes_allowed_users.phylome_id, phylomeIds),
            ),
        );
}

export async function getAllPhylomesData(): Promise<PhylomeAllowedUserData[]> {
    try {
        const result = await persistentLocalDb
            .select()
            .from(phylomes_allowed_users);
        return result;
    } catch (error) {
        throw new Error("Error fetching all phylomes");
    }
}

export async function getAllUniqueEmails(): Promise<string[]> {
    const result = await persistentLocalDb
        .select({
            user_email_address: phylomes_allowed_users.user_email_address,
        })
        .from(phylomes_allowed_users);
    const uniqueEmails = Array.from(
        new Set(result.map((row) => row.user_email_address)),
    );
    return uniqueEmails;
}

// Delete all rows containing the given email
export async function deleteAllRowsByEmail(user_email_address: string) {
    await persistentLocalDb
        .delete(phylomes_allowed_users)
        .where(
            eq(phylomes_allowed_users.user_email_address, user_email_address),
        );
}

// Get all phylomes associated with a given email
export async function getPhylomesByEmail(
    user_email_address: string,
): Promise<number[]> {
    const result = await persistentLocalDb
        .select({ phylome_id: phylomes_allowed_users.phylome_id })
        .from(phylomes_allowed_users)
        .where(
            eq(phylomes_allowed_users.user_email_address, user_email_address),
        );
    return result.map((row) => row.phylome_id);
}

export async function updateUserDataAcrossPhylomes(
    current_email: string,
    new_email: string,
    new_full_name: string,
) {
    await persistentLocalDb
        .update(phylomes_allowed_users)
        .set({ user_email_address: new_email, user_full_name: new_full_name })
        .where(eq(phylomes_allowed_users.user_email_address, current_email));
}

// Add a name for a given email
export async function addNameByEmail(full_name: string, email_address: string) {
    await persistentLocalDb
        .update(phylomes_allowed_users)
        .set({ user_full_name: full_name })
        .where(eq(phylomes_allowed_users.user_email_address, email_address));
}
