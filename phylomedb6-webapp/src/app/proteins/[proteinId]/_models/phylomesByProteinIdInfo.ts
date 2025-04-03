import { PhylomeDTO } from "@/_models/phylomes/phylomes";

import {
    alignment_relations,
    genes,
    genomes,
    phylome_contents,
    phylomes,
    proteins,
    species,
    trees,
} from "@/remoteDb/schema";
import remoteDb from "@/remoteDb";
import { and, eq, inArray, sql } from "drizzle-orm";

export const PhylomesModelByProteinId = {
    async getNonEmptyPhylomesData(
        proteinId: string | number,
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

        const phylomesContainingTargetProtein: number[] = (
            await remoteDb
                .select({
                    phylome_id: phylomes.phylome_id,
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
                .where(
                    and(
                        eq(proteins.protein_id, Number(proteinId)),
                        inArray(phylomes.phylome_id, phylomesIds),
                    ),
                )
                .orderBy(phylomes.phylome_id)
        ).map((e) => e.phylome_id);

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
            .where(
                inArray(phylomes.phylome_id, phylomesContainingTargetProtein),
            )
            .orderBy(phylomes.phylome_id);
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
};
