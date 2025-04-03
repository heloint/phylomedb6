import {
    mysqlTable,
    unique,
    char,
    timestamp,
    int,
    mysqlEnum,
    index,
    varchar,
    longtext,
    float,
    tinyint,
    bigint,
} from 'drizzle-orm/mysql-core'

export const alignments = mysqlTable(
    'alignments',
    {
        alignment_md5_id: char('alignment_md5_id', { length: 32 }).notNull(),
        // Warning: Can't parse mediumblob from database
        // mediumblobType: mediumblob("alignment"),
        sha1: char('sha1', { length: 40 })
            .default('sha(`alignment`)')
            .notNull(),
        timestamp: timestamp('timestamp', { mode: 'string' }).default(
            'current_timestamp()'
        ),
        seqs_numb: int('seqs_numb').notNull(),
        residues_numb: int('residues_numb').notNull(),
        alignment_type: mysqlEnum('alignment_type', ['raw', 'clean', 'other'])
            .default('raw')
            .notNull(),
    },
    (table) => {
        return {
            sha1: unique('sha1').on(table.sha1),
        }
    }
)

export const alignment_relations = mysqlTable(
    'alignment_relations',
    {
        alignment_md5_id: char('alignment_md5_id', { length: 32 })
            .notNull()
            .references(() => alignments.alignment_md5_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        phylome_id: int('phylome_id')
            .notNull()
            .references(() => phylomes.phylome_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        seed_protein_id: int('seed_protein_id')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
    },
    (table) => {
        return {
            phylome_id: index('phylome_id').on(table.phylome_id),
            seed_protein_id: index('seed_protein_id').on(table.seed_protein_id),
        }
    }
)

export const coorthologs = mysqlTable(
    'coorthologs',
    {
        phylome_id: int('phylome_id')
            .notNull()
            .references(() => phylomes.phylome_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        protein_1: int('protein_1')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        protein_2: int('protein_2')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
    },
    (table) => {
        return {
            phylome_id_seed_protein_id_target_protein_id_idx: index(
                'phylome_id_seed_protein_id_target_protein_id_idx'
            ).on(table.phylome_id, table.protein_1, table.protein_2),
            protein_1: index('protein_1').on(table.protein_1),
            protein_2: index('protein_2').on(table.protein_2),
        }
    }
)

export const genes = mysqlTable(
    'genes',
    {
        gene_id: int('gene_id').autoincrement().notNull(),
        external_gene_id: varchar('external_gene_id', { length: 200 }).default(
            'NULL'
        ),
        contig_id: varchar('contig_id', { length: 200 }).default('NULL'),
        gene_name: varchar('gene_name', { length: 200 }).notNull(),
        source: varchar('source', { length: 200 }).notNull(),
        start: int('start').notNull(),
        end: int('end').notNull(),
        relative_contig_gene_order: int('relative_contig_gene_order').notNull(),
        strand: mysqlEnum('strand', ['+', '-', '?']),
        timestamp: timestamp('timestamp', { mode: 'string' }).default(
            'current_timestamp()'
        ),
        genome_id: int('genome_id')
            .notNull()
            .references(() => genomes.genome_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
    },
    (table) => {
        return {
            idx_contig_id: index('idx_contig_id').on(table.contig_id),
            idx_contig_id_start_end: index('idx_contig_id_start_end').on(
                table.contig_id,
                table.start,
                table.end
            ),
            genome_id: index('genome_id').on(table.genome_id),
        }
    }
)

export const genomes = mysqlTable(
    'genomes',
    {
        genome_id: int('genome_id').autoincrement().notNull(),
        external_genome_id: varchar('external_genome_id', {
            length: 50,
        }).default('NULL'),
        taxid: int('taxid')
            .notNull()
            .references(() => species.taxid, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        version: int('version').notNull(),
        source: varchar('source', { length: 200 }).notNull(),
        uploaded_by: varchar('uploaded_by', { length: 20 }).notNull(),
        comments: varchar('comments', { length: 200 }).default('NULL'),
        timestamp: timestamp('timestamp', { mode: 'string' }).default(
            'current_timestamp()'
        ),
    },
    (table) => {
        return {
            taxid: index('taxid').on(table.taxid),
            external_genome_id: unique('external_genome_id').on(
                table.external_genome_id
            ),
        }
    }
)

export const homologs = mysqlTable(
    'homologs',
    {
        phylome_id: int('phylome_id')
            .notNull()
            .references(() => phylomes.phylome_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        protein_1: int('protein_1')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        protein_2: int('protein_2')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
    },
    (table) => {
        return {
            phylome_id_seed_protein_id_target_protein_id_idx: index(
                'phylome_id_seed_protein_id_target_protein_id_idx'
            ).on(table.phylome_id, table.protein_1, table.protein_2),
            protein_1: index('protein_1').on(table.protein_1),
            protein_2: index('protein_2').on(table.protein_2),
        }
    }
)

export const isoforms = mysqlTable('isoforms', {
    sequence_id: int('sequence_id').default(0).notNull(),
    protein_id: int('protein_id').default(0).notNull(),
    external_protein_id: varchar('external_protein_id', {
        length: 200,
    }).notNull(),
    description: varchar('description', { length: 500 }).default('NULL'),
    gene_id: int('gene_id').default(0).notNull(),
    protein_sequence_timestamp: timestamp('protein_sequence_timestamp', {
        mode: 'string',
    }).default('current_timestamp()'),
    sequence: longtext('sequence').notNull(),
    genome_id: int('genome_id').default(0).notNull(),
    source: varchar('source', { length: 200 }).notNull(),
    genome_timestamp: timestamp('genome_timestamp', { mode: 'string' }).default(
        'current_timestamp()'
    ),
    taxid: int('taxid').notNull(),
    version: int('version').notNull(),
    name: varchar('name', { length: 500 }).notNull(),
})

export const longest_isoforms = mysqlTable('longest_isoforms', {
    sequence_id: int('sequence_id').default(0).notNull(),
    protein_id: int('protein_id').default(0).notNull(),
    external_protein_id: varchar('external_protein_id', {
        length: 200,
    }).notNull(),
    description: varchar('description', { length: 500 }).default('NULL'),
    gene_id: int('gene_id').default(0).notNull(),
    protein_sequence_timestamp: timestamp('protein_sequence_timestamp', {
        mode: 'string',
    }).default('current_timestamp()'),
    sequence: longtext('sequence').notNull(),
    genome_id: int('genome_id').default(0).notNull(),
    source: varchar('source', { length: 200 }).notNull(),
    genome_timestamp: timestamp('genome_timestamp', { mode: 'string' }).default(
        'current_timestamp()'
    ),
    taxid: int('taxid').notNull(),
    version: int('version').notNull(),
    name: varchar('name', { length: 500 }).notNull(),
    longest_isoform_length: bigint('longest_isoform_length', {
        mode: 'number',
    }),
})

export const orthologs = mysqlTable(
    'orthologs',
    {
        phylome_id: int('phylome_id')
            .notNull()
            .references(() => phylomes.phylome_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        protein_1: int('protein_1')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        protein_2: int('protein_2')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        relation_type: mysqlEnum('relation_type', [
            'one-to-one',
            'one-to-many',
            'many-to-one',
            'many-to-many',
        ]).notNull(),
        consistency_score: float('consistency_score').notNull(),
        number_of_trees: int('number_of_trees').notNull(),
    },
    (table) => {
        return {
            phylome_id_seed_protein_id_target_protein_id_idx: index(
                'phylome_id_seed_protein_id_target_protein_id_idx'
            ).on(table.phylome_id, table.protein_1, table.protein_2),
            protein_1: index('protein_1').on(table.protein_1),
            protein_2: index('protein_2').on(table.protein_2),
        }
    }
)

export const phylomes = mysqlTable(
    'phylomes',
    {
        phylome_id: int('phylome_id').autoincrement().notNull(),
        seed_genome_id: int('seed_genome_id').notNull(),
        name: varchar('name', { length: 200 }).notNull(),
        description: varchar('description', { length: 500 }).notNull(),
        comments: varchar('comments', { length: 500 }).default('NULL'),
        responsible: varchar('responsible', { length: 200 }).notNull(),
        modification_time: timestamp('modification_time', {
            mode: 'string',
        }).default('NULL'),
        timestamp: timestamp('timestamp', { mode: 'string' }).default(
            'current_timestamp()'
        ),
        spe2ages_id: int('spe2ages_id').references(
            () => spe2ages_jsons.spe2ages_id,
            { onDelete: 'restrict', onUpdate: 'cascade' }
        ),
        is_public: tinyint('is_public').default(0).notNull(),
        pubmed_link: varchar('pubmed_link', { length: 500 }).default('NULL'),
        pubmed_title: varchar('pubmed_title', { length: 500 }).default('NULL'),
    },
    (table) => {
        return {
            spe2ages_id: index('spe2ages_id').on(table.spe2ages_id),
            name: unique('name').on(table.name),
        }
    }
)

export const phylome_contents = mysqlTable(
    'phylome_contents',
    {
        phylome_id: int('phylome_id')
            .notNull()
            .references(() => phylomes.phylome_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        genome_id: int('genome_id')
            .notNull()
            .references(() => genomes.genome_id, {
                onDelete: 'restrict',
                onUpdate: 'cascade',
            }),
    },
    (table) => {
        return {
            genome_id: index('genome_id').on(table.genome_id),
        }
    }
)

export const proteins = mysqlTable(
    'proteins',
    {
        protein_id: int('protein_id').autoincrement().notNull(),
        external_protein_id: varchar('external_protein_id', {
            length: 200,
        }).notNull(),
        description: varchar('description', { length: 500 }).default('NULL'),
        gene_id: int('gene_id')
            .notNull()
            .references(() => genes.gene_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
    },
    (table) => {
        return {
            gene_id: index('gene_id').on(table.gene_id),
        }
    }
)

export const protein_sequences = mysqlTable(
    'protein_sequences',
    {
        sequence_id: int('sequence_id').autoincrement().notNull(),
        sequence: longtext('sequence').notNull(),
        sha256sum: char('sha256sum', { length: 64 }).default(
            'sha2(`sequence`,256)'
        ),
        timestamp: timestamp('timestamp', { mode: 'string' }).default(
            'current_timestamp()'
        ),
        protein_id: int('protein_id')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
    },
    (table) => {
        return {
            protein_id: index('protein_id').on(table.protein_id),
            sha256sum: unique('sha256sum').on(table.sha256sum),
        }
    }
)

export const spe2ages_jsons = mysqlTable(
    'spe2ages_jsons',
    {
        spe2ages_id: int('spe2ages_id').autoincrement().notNull(),
        json_content: longtext('json_content').notNull(),
        json_content_md5: char('json_content_md5', { length: 32 }).default(
            'NULL'
        ),
    },
    (table) => {
        return {
            json_content_md5: unique('json_content_md5').on(
                table.json_content_md5
            ),
        }
    }
)

export const species = mysqlTable(
    'species',
    {
        // @ts-ignore
        taxid: int('taxid').default('crc32(`name`)').notNull(),
        name: varchar('name', { length: 500 }).notNull(),
        has_fake_taxid: tinyint('has_fake_taxid').default(0).notNull(),
    },
    (table) => {
        return {
            name: unique('name').on(table.name),
        }
    }
)

export const trees = mysqlTable(
    'trees',
    {
        tree_id: int('tree_id').autoincrement().notNull(),
        phylome_id: int('phylome_id')
            .notNull()
            .references(() => phylomes.phylome_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        seed_protein_id: int('seed_protein_id')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        method: varchar('method', { length: 200 }).notNull(),
        lk: float('lk').notNull(),
        newick: longtext('newick').notNull(),
    },
    (table) => {
        return {
            idx_phylome_id: index('idx_phylome_id').on(table.phylome_id),
            idx_phylome_id_seed_protein_id: index(
                'idx_phylome_id_seed_protein_id'
            ).on(table.phylome_id, table.seed_protein_id),
            seed_protein_id: index('seed_protein_id').on(table.seed_protein_id),
        }
    }
)

export const tree_contents = mysqlTable(
    'tree_contents',
    {
        phylome_id: int('phylome_id')
            .notNull()
            .references(() => phylomes.phylome_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        seed_protein_id: int('seed_protein_id')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        target_protein_id: int('target_protein_id')
            .notNull()
            .references(() => proteins.protein_id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
    },
    (table) => {
        return {
            phylome_id_idx: index('phylome_id_idx').on(table.phylome_id),
            seed_protein_id_idx: index('seed_protein_id_idx').on(
                table.seed_protein_id
            ),
            target_protein_id_idx: index('target_protein_id_idx').on(
                table.target_protein_id
            ),
            phylome_id_seed_protein_id_target_protein_id_idx: index(
                'phylome_id_seed_protein_id_target_protein_id_idx'
            ).on(
                table.phylome_id,
                table.seed_protein_id,
                table.target_protein_id
            ),
        }
    }
)

export const uniprot_id_mappings = mysqlTable(
    'uniprot_id_mappings',
    {
        uniprotkb_ac_id: varchar('uniprotkb_ac_id', { length: 50 }).notNull(),
        id_type: varchar('id_type', { length: 50 }).notNull(),
        external_gene_id: varchar('external_gene_id', {
            length: 200,
        }).notNull(),
    },
    (table) => {
        return {
            external_gene_id: unique('external_gene_id').on(
                table.external_gene_id
            ),
        }
    }
)
