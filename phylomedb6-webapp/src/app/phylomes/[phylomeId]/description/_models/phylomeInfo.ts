import remoteDb from "@/remoteDb";
import { phylomes } from "@/remoteDb/schema";
import { eq } from "drizzle-orm";

export type PhylomeInfo = {
    phylome_id: number;
    seed_genome_id: number;
    name: string;
    description: string;
    comments: string | null;
    responsible: string;
    modification_time: string | null;
    timestamp: string | null;
    spe2ages_id: number | null;
    is_public: number;
    pubmed_link: string | null;
    pubmed_title: string | null;
};

export async function getPhylomeInfoByPhylomeId(
    phylomeId: string | number,
): Promise<PhylomeInfo> {
    const result = await remoteDb
        .select()
        .from(phylomes)
        .where(eq(phylomes.phylome_id, Number(phylomeId)))
        .limit(1);
    const data = result[0];
    return data;
}
