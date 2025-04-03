import { genes, genomes, proteins, species, trees } from "@/remoteDb/schema";
import remoteDb from "@/remoteDb";
import { eq } from "drizzle-orm";

export type GeneTreesData = {
    tree_id: number;
    seed_protein_id: number;
    external_protein_id: string;
    protein_description: string | null;
    method: string;
    lk: number;
    gene_id: number;
    external_gene_id: string | null;
    contig_id: string | null;
    gene_name: string;
    source: string;
    genome_id: number;
    external_genome_id: string | null;
    taxid: Number;
    name: string;
};

export const GeneTreesModel = {
    async getGeneTreesDataByPhylomeId(
        phylomeId: Number,
    ): Promise<GeneTreesData[]> {
        const geneTreesData = await remoteDb
            .select({
                tree_id: trees.tree_id,
                seed_protein_id: trees.seed_protein_id,
                external_protein_id: proteins.external_protein_id,
                protein_description: proteins.description,
                method: trees.method,
                lk: trees.lk,
                gene_id: proteins.gene_id,
                external_gene_id: genes.external_gene_id,
                contig_id: genes.contig_id,
                gene_name: genes.gene_name,
                source: genes.source,
                genome_id: genomes.genome_id,
                external_genome_id: genomes.external_genome_id,
                taxid: genomes.taxid,
                name: species.name,
            })
            .from(trees)
            .innerJoin(proteins, eq(trees.seed_protein_id, proteins.protein_id))
            .innerJoin(genes, eq(proteins.gene_id, genes.gene_id))
            .innerJoin(genomes, eq(genes.genome_id, genomes.genome_id))
            .innerJoin(species, eq(genomes.taxid, species.taxid))
            .where(eq(trees.phylome_id, Number(phylomeId)))
            .orderBy(trees.tree_id);
        return geneTreesData;
    },
};
