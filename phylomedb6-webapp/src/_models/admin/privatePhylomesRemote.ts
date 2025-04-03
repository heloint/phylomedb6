import remoteDb from "@/remoteDb";
import { phylomes } from "@/remoteDb/schema";
import { eq, sql } from "drizzle-orm";

export const PhylomesModel = {
    async existsPhylome(phylome_id: number): Promise<boolean> {
        const data = await remoteDb
            .select({
                exists: sql<boolean>`exists (
                    select 1
                    from ${phylomes}
                    where ${phylomes.phylome_id} = ${phylome_id}
                )`,
            })
            .from(phylomes);
        return data[0]?.exists ?? false;
    },
    async isPhylomePrivate(phylome_id: number): Promise<boolean> {
        const data = await remoteDb
            .select({
                is_public: phylomes.is_public,
            })
            .from(phylomes)
            .where(eq(phylomes.phylome_id, phylome_id));

        return data[0]?.is_public == 1;
    },
};
