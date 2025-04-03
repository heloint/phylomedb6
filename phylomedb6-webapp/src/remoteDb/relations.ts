import { relations } from 'drizzle-orm/relations'
import {
	alignment_relations,
	alignments,
	coorthologs,
	genes,
	genomes,
	homologs,
	orthologs,
	phylome_contents,
	phylomes,
	protein_sequences,
	proteins,
	spe2ages_jsons,
	species,
	tree_contents,
	trees,
} from './schema'

export const alignment_relationsRelations = relations(
    alignment_relations,
    ({ one }) => ({
        alignment: one(alignments, {
            fields: [alignment_relations.alignment_md5_id],
            references: [alignments.alignment_md5_id],
        }),
        phylome: one(phylomes, {
            fields: [alignment_relations.phylome_id],
            references: [phylomes.phylome_id],
        }),
        protein: one(proteins, {
            fields: [alignment_relations.seed_protein_id],
            references: [proteins.protein_id],
        }),
    })
)

export const alignmentsRelations = relations(alignments, ({ many }) => ({
    alignment_relations: many(alignment_relations),
}))

export const phylomesRelations = relations(phylomes, ({ one, many }) => ({
    alignment_relations: many(alignment_relations),
    coorthologs: many(coorthologs),
    homologs: many(homologs),
    orthologs: many(orthologs),
    spe2ages_json: one(spe2ages_jsons, {
        fields: [phylomes.spe2ages_id],
        references: [spe2ages_jsons.spe2ages_id],
    }),
    phylome_contents: many(phylome_contents),
    trees: many(trees),
    tree_contents: many(tree_contents),
}))

export const proteinsRelations = relations(proteins, ({ one, many }) => ({
    alignment_relations: many(alignment_relations),
    coorthologs_protein_1: many(coorthologs, {
        relationName: 'coorthologs_protein_1_proteins_protein_id',
    }),
    coorthologs_protein_2: many(coorthologs, {
        relationName: 'coorthologs_protein_2_proteins_protein_id',
    }),
    homologs_protein_1: many(homologs, {
        relationName: 'homologs_protein_1_proteins_protein_id',
    }),
    homologs_protein_2: many(homologs, {
        relationName: 'homologs_protein_2_proteins_protein_id',
    }),
    orthologs_protein_1: many(orthologs, {
        relationName: 'orthologs_protein_1_proteins_protein_id',
    }),
    orthologs_protein_2: many(orthologs, {
        relationName: 'orthologs_protein_2_proteins_protein_id',
    }),
    gene: one(genes, {
        fields: [proteins.gene_id],
        references: [genes.gene_id],
    }),
    protein_sequences: many(protein_sequences),
    trees: many(trees),
    tree_contents_seed_protein_id: many(tree_contents, {
        relationName: 'tree_contents_seed_protein_id_proteins_protein_id',
    }),
    tree_contents_target_protein_id: many(tree_contents, {
        relationName: 'tree_contents_target_protein_id_proteins_protein_id',
    }),
}))

export const coorthologsRelations = relations(coorthologs, ({ one }) => ({
    phylome: one(phylomes, {
        fields: [coorthologs.phylome_id],
        references: [phylomes.phylome_id],
    }),
    protein_protein_1: one(proteins, {
        fields: [coorthologs.protein_1],
        references: [proteins.protein_id],
        relationName: 'coorthologs_protein_1_proteins_protein_id',
    }),
    protein_protein_2: one(proteins, {
        fields: [coorthologs.protein_2],
        references: [proteins.protein_id],
        relationName: 'coorthologs_protein_2_proteins_protein_id',
    }),
}))

export const genesRelations = relations(genes, ({ one, many }) => ({
    genome: one(genomes, {
        fields: [genes.genome_id],
        references: [genomes.genome_id],
    }),
    proteins: many(proteins),
}))

export const genomesRelations = relations(genomes, ({ one, many }) => ({
    genes: many(genes),
    species: one(species, {
        fields: [genomes.taxid],
        references: [species.taxid],
    }),
    phylome_contents: many(phylome_contents),
}))

export const speciesRelations = relations(species, ({ many }) => ({
    genomes: many(genomes),
}))

export const homologsRelations = relations(homologs, ({ one }) => ({
    phylome: one(phylomes, {
        fields: [homologs.phylome_id],
        references: [phylomes.phylome_id],
    }),
    protein_protein_1: one(proteins, {
        fields: [homologs.protein_1],
        references: [proteins.protein_id],
        relationName: 'homologs_protein_1_proteins_protein_id',
    }),
    protein_protein_2: one(proteins, {
        fields: [homologs.protein_2],
        references: [proteins.protein_id],
        relationName: 'homologs_protein_2_proteins_protein_id',
    }),
}))

export const orthologsRelations = relations(orthologs, ({ one }) => ({
    phylome: one(phylomes, {
        fields: [orthologs.phylome_id],
        references: [phylomes.phylome_id],
    }),
    protein_protein_1: one(proteins, {
        fields: [orthologs.protein_1],
        references: [proteins.protein_id],
        relationName: 'orthologs_protein_1_proteins_protein_id',
    }),
    protein_protein_2: one(proteins, {
        fields: [orthologs.protein_2],
        references: [proteins.protein_id],
        relationName: 'orthologs_protein_2_proteins_protein_id',
    }),
}))

export const spe2ages_jsonsRelations = relations(
    spe2ages_jsons,
    ({ many }) => ({
        phylomes: many(phylomes),
    })
)

export const phylome_contentsRelations = relations(
    phylome_contents,
    ({ one }) => ({
        phylome: one(phylomes, {
            fields: [phylome_contents.phylome_id],
            references: [phylomes.phylome_id],
        }),
        genome: one(genomes, {
            fields: [phylome_contents.genome_id],
            references: [genomes.genome_id],
        }),
    })
)

export const protein_sequencesRelations = relations(
    protein_sequences,
    ({ one }) => ({
        protein: one(proteins, {
            fields: [protein_sequences.protein_id],
            references: [proteins.protein_id],
        }),
    })
)

export const treesRelations = relations(trees, ({ one }) => ({
    phylome: one(phylomes, {
        fields: [trees.phylome_id],
        references: [phylomes.phylome_id],
    }),
    protein: one(proteins, {
        fields: [trees.seed_protein_id],
        references: [proteins.protein_id],
    }),
}))

export const tree_contentsRelations = relations(tree_contents, ({ one }) => ({
    phylome: one(phylomes, {
        fields: [tree_contents.phylome_id],
        references: [phylomes.phylome_id],
    }),
    protein_seed_protein_id: one(proteins, {
        fields: [tree_contents.seed_protein_id],
        references: [proteins.protein_id],
        relationName: 'tree_contents_seed_protein_id_proteins_protein_id',
    }),
    protein_target_protein_id: one(proteins, {
        fields: [tree_contents.target_protein_id],
        references: [proteins.protein_id],
        relationName: 'tree_contents_target_protein_id_proteins_protein_id',
    }),
}))
