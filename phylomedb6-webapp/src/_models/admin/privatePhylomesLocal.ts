import persistentLocalDb from "@/persistentLocalDb";
import { private_phylomes } from "@/persistentLocalDb/persistentLocalSchema";
import { eq } from "drizzle-orm";

export type PrivatePhylomesData = {
    phylome_id: number;
};

export async function getAllPrivatePhylomes(): Promise<PrivatePhylomesData[]> {
    const result = await persistentLocalDb.select().from(private_phylomes);
    return result;
}

export async function addPrivatePhylome(phylome_id: number) {
    await persistentLocalDb.insert(private_phylomes).values({
        phylome_id: phylome_id,
    });
}

export async function deletePrivatePhylome(phylome_id: number) {
    const result = await persistentLocalDb
        .delete(private_phylomes)
        .where(eq(private_phylomes.phylome_id, phylome_id));
}
