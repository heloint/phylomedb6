import remoteDb from "@/remoteDb";
import {
    genomes,
    phylomes,
    species,
    trees,
    alignment_relations,
    phylome_contents,
    genes,
} from "@/remoteDb/schema";
import { eq, inArray, sql, and } from "drizzle-orm";

export type PhylomeDTO = {
    phylome_id: number;
    species_taxid: number;
    species_name: string;
    name: string;
    description: string;
    comments: string | null;
    responsible: string;
    timestamp: string | null;
    is_public: number;
    pubmed_link: string | null;
    pubmed_title: string | null;
};

export const PhylomesModel = {
    async getNonEmptyPhylomesData(): Promise<PhylomeDTO[]> {
        const phylomeIdsWithTrees = this.getPhylomeIdsWithTrees();
        const phylomeIdsWithAlignments = this.getPhylomeIdsWithAlignments();
        const resolvedPhylomeIdQueries = await Promise.all([
            phylomeIdsWithTrees,
            phylomeIdsWithAlignments,
        ]);
        const phylomesIds = Array.from(
            new Set(
                resolvedPhylomeIdQueries
                    .flat(1)
                    .map((entry) => entry.phylome_id),
            ),
        );

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
            .from(phylomes)
            .innerJoin(genomes, eq(genomes.genome_id, phylomes.seed_genome_id))
            .innerJoin(species, eq(species.taxid, genomes.taxid))
            .where(inArray(phylomes.phylome_id, phylomesIds));

        return phylomesData;
    },
    async getPhylomeIdsWithTrees(): Promise<
        {
            phylome_id: number;
        }[]
    > {
        const data = await remoteDb
            .select({
                phylome_id: sql<number>`distinct ${trees.phylome_id}`,
            })
            .from(trees);
        return data;
    },
    async getPhylomeIdsWithAlignments(): Promise<
        {
            phylome_id: number;
        }[]
    > {
        const data = await remoteDb
            .select({
                phylome_id: sql<number>`distinct ${alignment_relations.phylome_id}`,
            })
            .from(alignment_relations);
        return data;
    },

    async getNonEmptyPhylomesDataByGeneId(
        geneId: string | number,
    ): Promise<PhylomeDTO[]> {
        const phylomeIdsWithTrees = this.getPhylomeIdsWithTrees();
        const phylomeIdsWithAlignments = this.getPhylomeIdsWithAlignments();
        const resolvedPhylomeIdQueries = await Promise.all([
            phylomeIdsWithTrees,
            phylomeIdsWithAlignments,
        ]);
        const phylomesIds = Array.from(
            new Set(
                resolvedPhylomeIdQueries
                    .flat(1)
                    .map((entry) => entry.phylome_id),
            ),
        );

        const phylomesData = await remoteDb
            .select({
                phylome_id: phylomes.phylome_id,
                name: phylomes.name,
                species_taxid: species.taxid,
                species_name: species.name,
                description: phylomes.description,
                comments: phylomes.comments,
                responsible: phylomes.responsible,
                timestamp: phylomes.timestamp,
                is_public: phylomes.is_public,
                pubmed_link: phylomes.pubmed_link,
                pubmed_title: phylomes.pubmed_title,
            })
            .from(phylomes)
            .innerJoin(
                phylome_contents,
                eq(phylomes.phylome_id, phylome_contents.phylome_id),
            )
            .innerJoin(
                genomes,
                eq(phylome_contents.genome_id, genomes.genome_id),
            )
            .innerJoin(genes, eq(genomes.genome_id, genes.genome_id))
            .innerJoin(species, eq(species.taxid, genomes.taxid))
            .where(
                and(
                    eq(genes.gene_id, Number(geneId)),
                    inArray(phylomes.phylome_id, phylomesIds),
                ),
            )
            .orderBy(phylomes.phylome_id);

        return phylomesData;
    },
};
