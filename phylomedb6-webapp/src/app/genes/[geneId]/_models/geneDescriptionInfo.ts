import { genes, genomes, species } from "@/remoteDb/schema";
import remoteDb from "@/remoteDb";
import { eq } from "drizzle-orm";

export type GeneDescriptionData = {
    gene_id: number;
    external_gene_id: string | null;
    contig_id: string | null;
    gene_name: string;
    source: string;
    strand: string | null;
    genome_id: number;
    external_genome_id: string | null;
    species_taxid: number;
    species_name: string;
};

export async function getGeneDescriptionDataByGeneId(
    geneId: string | number,
): Promise<GeneDescriptionData> {
    const geneGeneDescriptionData = await remoteDb
        .select({
            gene_id: genes.gene_id,
            external_gene_id: genes.external_gene_id,
            contig_id: genes.contig_id,
            gene_name: genes.gene_name,
            source: genes.source,
            strand: genes.strand,
            genome_id: genes.genome_id,
            external_genome_id: genomes.external_genome_id,
            species_taxid: genomes.taxid,
            species_name: species.name,
        })
        .from(genes)
        .innerJoin(genomes, eq(genomes.genome_id, genes.genome_id))
        .innerJoin(species, eq(genomes.taxid, species.taxid))
        .where(eq(genes.gene_id, Number(geneId)))
        .orderBy(genes.gene_id);

    return geneGeneDescriptionData[0];
}
