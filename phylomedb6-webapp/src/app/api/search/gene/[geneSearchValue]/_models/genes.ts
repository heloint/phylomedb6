"use server ";
import { genes } from "@/remoteDb/schema";
import remoteDb from "@/remoteDb";
import { eq } from "drizzle-orm";

export type Gene = {
    gene_id: number;
    external_gene_id: string | null;
    contig_id: string | null;
    gene_name: string;
    source: string;
    start: number;
    end: number;
    relative_contig_gene_order: number;
    strand: string | null;
    timestamp: string | null;
    genome_id: number;
};

export async function searchByGeneName(searchOption: string): Promise<Gene[]> {
    const result = await remoteDb
        .select()
        .from(genes)
        .where(eq(genes.gene_name, searchOption));
    const data = result;
    return data;
}

export const genesData = {
    async searchByGeneName(searchOption: string): Promise<Gene[]> {
        const genesByGeneName = await remoteDb
            .select()
            .from(genes)
            .where(eq(genes.gene_name, searchOption));
        return genesByGeneName;
    },

    async searchByGeneId(searchOption: string): Promise<Gene[]> {
        const castedSearchOption = Number(searchOption);
        if (Number.isNaN(castedSearchOption)) {
            return [];
        }
        const genesById = await remoteDb
            .select()
            .from(genes)
            .where(eq(genes.gene_id, Number(searchOption)));
        return genesById;
    },

    async searchByExternalGeneId(searchOption: string): Promise<Gene[]> {
        const genesByExternalGeneId = await remoteDb
            .select()
            .from(genes)
            .where(eq(genes.external_gene_id, searchOption));
        return genesByExternalGeneId;
    },

    async searchByContigId(searchOption: string): Promise<Gene[]> {
        const genesByContigId = await remoteDb
            .select()
            .from(genes)
            .where(eq(genes.contig_id, searchOption));
        return genesByContigId;
    },
};

export function getGeneRowData(searchOption: string) {
    const result = Promise.all([
        genesData.searchByGeneName(searchOption),
        genesData.searchByGeneId(searchOption),
        genesData.searchByExternalGeneId(searchOption),
        genesData.searchByContigId(searchOption),
    ]);
    return result;
}
