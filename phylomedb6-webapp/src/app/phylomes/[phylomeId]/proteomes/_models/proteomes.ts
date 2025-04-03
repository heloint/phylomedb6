import remoteDb from "@/remoteDb";
import {
    genes,
    genomes,
    phylome_contents,
    protein_sequences,
    proteins,
    species,
} from "@/remoteDb/schema";
import { eq, sql } from "drizzle-orm";

export type Proteome = {
    phylomeId: number;
    speciesTaxid: number;
    genomeVersion: number;
    speciesName: string;
    genomeSource: string;
    genomeTimestamp: string | null;
    genomeId: number;
    externalGenomeId: string | null;
    isoformCount: unknown;
    longestIsoformCount: unknown;
};

export const ProteomesModel = {
    async getProteomesByPhylomeId(phylomeId: number): Promise<Proteome[]> {
        const result = await remoteDb
            .select({
                phylomeId: phylome_contents.phylome_id,
                speciesTaxid: genomes.taxid,
                genomeVersion: genomes.version,
                speciesName: species.name,
                genomeSource: genomes.source,
                genomeTimestamp: genomes.timestamp,
                genomeId: genomes.genome_id,
                externalGenomeId: genomes.external_genome_id,
                isoformCount: sql`COUNT(${proteins.protein_id})`.as(
                    "isoform_count",
                ),
                longestIsoformCount: sql`COUNT(DISTINCT ${genes.gene_id})`.as(
                    "longest_isoform_count",
                ),
            })
            .from(genes)
            .innerJoin(genomes, eq(genes.genome_id, genomes.genome_id))
            .innerJoin(proteins, eq(genes.gene_id, proteins.gene_id))
            .innerJoin(
                protein_sequences,
                eq(proteins.protein_id, protein_sequences.protein_id),
            )
            .innerJoin(species, eq(species.taxid, genomes.taxid))
            .innerJoin(
                phylome_contents,
                eq(phylome_contents.genome_id, genomes.genome_id),
            )
            .where(eq(phylome_contents.phylome_id, phylomeId))
            .groupBy(genomes.genome_id);
        return result;
    },
};
