import { PhylomeDTO } from "@/_models/phylomes/phylomes";

import {
    genes,
    genomes,
    phylome_contents,
    phylomes,
    proteins,
    species,
} from "@/remoteDb/schema";
import remoteDb from "@/remoteDb";
import { eq } from "drizzle-orm";

export type GeneProteinData = {
    protein_id: number;
    external_protein_id: string;
    description: string | null;
    gene_id: number;
    external_gene_id: string | null;
    contig_id: string | null;
    gene_name: string;
    source: string;
};

export async function getGeneProteinDataByProteinId(
    proteinId: string | number,
): Promise<GeneProteinData> {
    const geneProteinData = await remoteDb
        .select({
            protein_id: proteins.protein_id,
            external_protein_id: proteins.external_protein_id,
            description: proteins.description,
            gene_id: proteins.gene_id,
            external_gene_id: genes.external_gene_id,
            contig_id: genes.contig_id,
            gene_name: genes.gene_name,
            source: genes.source,
        })
        .from(proteins)
        .innerJoin(genes, eq(proteins.gene_id, genes.gene_id))
        .where(eq(proteins.protein_id, Number(proteinId)))
        .orderBy(proteins.protein_id);

    return geneProteinData[0];
}

export async function getPhylomesByProteinId(
    proteinId: string | number,
): Promise<PhylomeDTO[]> {
    const phylomesData = await remoteDb
        .select({
            phylome_id: phylomes.phylome_id,
            species_taxid: species.taxid,
            species_name: species.name,
            name: phylomes.name,
            description: phylomes.description,
            comments: phylomes.comments,
            responsible: phylomes.responsible,
            timestamp: phylomes.timestamp,
            is_public: phylomes.is_public,
            pubmed_link: phylomes.pubmed_link,
            pubmed_title: phylomes.pubmed_title,
        })
        .from(proteins)
        .innerJoin(genes, eq(proteins.gene_id, genes.gene_id))
        .innerJoin(
            phylome_contents,
            eq(genes.genome_id, phylome_contents.genome_id),
        )
        .innerJoin(
            phylomes,
            eq(phylome_contents.phylome_id, phylomes.phylome_id),
        )
        .innerJoin(genomes, eq(genes.genome_id, genomes.genome_id))
        .innerJoin(species, eq(species.taxid, genomes.taxid))
        .where(eq(proteins.protein_id, Number(proteinId)))
        .orderBy(phylomes.phylome_id);

    return phylomesData;
}
