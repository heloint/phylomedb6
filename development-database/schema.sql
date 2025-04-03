DROP DATABASE IF EXISTS phylomedb6;

CREATE DATABASE IF NOT EXISTS phylomedb6;

USE phylomedb6;

-- TABLES
-- ===============================================================
CREATE TABLE IF NOT EXISTS spe2ages_jsons (
    spe2ages_id INT(20) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    json_content LONGTEXT NOT NULL,
    json_content_md5 CHAR(32) AS (MD5(json_content)) UNIQUE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS phylomes (
    phylome_id INT(20) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    seed_genome_id INT(20) UNSIGNED NOT NULL,
    name VARCHAR(200) UNIQUE NOT NULL,
    description VARCHAR(500) NOT NULL,
    comments VARCHAR(500),
    responsible VARCHAR(200) NOT NULL,
    modification_time TIMESTAMP,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    spe2ages_id INT(20) UNSIGNED,
    is_public TINYINT NOT NULL DEFAULT 0,
    pubmed_link VARCHAR(500),
    pubmed_title VARCHAR(500),
    FOREIGN KEY (spe2ages_id) REFERENCES spe2ages_jsons(spe2ages_id) ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS species (
    taxid INT(20) UNSIGNED PRIMARY KEY DEFAULT CRC32(name),
    name VARCHAR(500) UNIQUE NOT NULL,
    has_fake_taxid TINYINT NOT NULL DEFAULT 0
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS genomes (
    genome_id INT(20) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    external_genome_id VARCHAR(50) UNIQUE,
    taxid INT(20) UNSIGNED NOT NULL,
    version INT(10) UNSIGNED NOT NULL,
    source VARCHAR(200) NOT NULL,
    uploaded_by VARCHAR(20) NOT NULL,
    comments VARCHAR(200),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taxid) REFERENCES species(taxid) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS phylome_contents (
    phylome_id INT(20) UNSIGNED NOT NULL,
    genome_id INT(20) UNSIGNED NOT NULL,
    PRIMARY KEY (phylome_id, genome_id),
    FOREIGN KEY (phylome_id) REFERENCES phylomes(phylome_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (genome_id) REFERENCES genomes(genome_id) ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS genes (
    gene_id INT(20) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    external_gene_id VARCHAR(200),
    contig_id VARCHAR(200),
    gene_name VARCHAR(200) NOT NULL,
    source VARCHAR(200) NOT NULL,
    start INT(25) NOT NULL,
    end INT(25) NOT NULL,
    relative_contig_gene_order INT(25) NOT NULL,
    strand ENUM('+', '-', '?'),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    genome_id INT(20) UNSIGNED NOT NULL,
    INDEX idx_contig_id (contig_id),
    INDEX idx_contig_id_start_end (contig_id, start, end),
    FOREIGN KEY (genome_id) REFERENCES genomes(genome_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS proteins (
    protein_id INT(20) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    external_protein_id VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    gene_id int(20) UNSIGNED NOT NULL,
    FOREIGN KEY (gene_id) REFERENCES genes(gene_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS protein_sequences (
    sequence_id INT(30) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    sequence LONGTEXT NOT NULL,
    sha256sum CHAR(64) UNIQUE DEFAULT SHA2(sequence,256),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    protein_id INT(20) UNSIGNED NOT NULL,
    FOREIGN KEY (protein_id) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS uniprot_id_mappings (
    uniprotkb_ac_id VARCHAR(50) PRIMARY KEY NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    external_gene_id VARCHAR(200) UNIQUE NOT NULL
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS alignments (
    alignment_md5_id CHAR(32) PRIMARY KEY NOT NULL,
    alignment MEDIUMBLOB DEFAULT NULL,
    sha1 CHAR(40) UNIQUE DEFAULT SHA1(alignment) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seqs_numb INT(6) NOT NULL,
    residues_numb INT(6) NOT NULL,
    alignment_type ENUM('raw', 'clean', 'other') NOT NULL DEFAULT 'raw'
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS alignment_relations (
    alignment_md5_id CHAR(32) NOT NULL,
    phylome_id INT(20) UNSIGNED NOT NULL,
    seed_protein_id INT(20) UNSIGNED NOT NULL,
    PRIMARY KEY (alignment_md5_id, phylome_id, seed_protein_id),
    FOREIGN KEY (alignment_md5_id) REFERENCES alignments(alignment_md5_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (phylome_id) REFERENCES phylomes(phylome_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (seed_protein_id) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS trees (
    tree_id INT(20) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    phylome_id INT(20) UNSIGNED NOT NULL,
    seed_protein_id INT(20) UNSIGNED NOT NULL,
    method VARCHAR(200) NOT NULL,
    lk FLOAT NOT NULL DEFAULT 0,
    newick LONGTEXT NOT NULL,
    INDEX idx_phylome_id (phylome_id),
    INDEX idx_phylome_id_seed_protein_id (phylome_id, seed_protein_id),
    FOREIGN KEY (phylome_id) REFERENCES phylomes(phylome_id) ON UPDATE CASCADE  ON DELETE CASCADE,
    FOREIGN KEY (seed_protein_id) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS tree_contents (
    phylome_id INT(20) UNSIGNED NOT NULL,
    seed_protein_id INT(20) UNSIGNED NOT NULL,
    target_protein_id INT(20) UNSIGNED NOT NULL,
    INDEX phylome_id_idx (phylome_id),
    INDEX seed_protein_id_idx (seed_protein_id),
    INDEX target_protein_id_idx (target_protein_id),
    INDEX phylome_id_seed_protein_id_target_protein_id_idx (phylome_id, seed_protein_id, target_protein_id),
    FOREIGN KEY (phylome_id) REFERENCES phylomes(phylome_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (seed_protein_id) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (target_protein_id) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS homologs (
    phylome_id INT(20) UNSIGNED NOT NULL,
    protein_1 INT(20) UNSIGNED NOT NULL,
    protein_2 INT(20) UNSIGNED NOT NULL,
    INDEX phylome_id_seed_protein_id_target_protein_id_idx (phylome_id, protein_1, protein_2),
    FOREIGN KEY (phylome_id) REFERENCES phylomes(phylome_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (protein_1) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (protein_2) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS orthologs (
    phylome_id INT(20) UNSIGNED NOT NULL,
    protein_1 INT(20) UNSIGNED NOT NULL,
    protein_2 INT(20) UNSIGNED NOT NULL,
    relation_type ENUM('one-to-one', 'one-to-many', 'many-to-one', 'many-to-many') NOT NULL,
    consistency_score FLOAT NOT NULL,
    number_of_trees INT(20) UNSIGNED NOT NULL,
    INDEX phylome_id_seed_protein_id_target_protein_id_idx (phylome_id, protein_1, protein_2),
    FOREIGN KEY (phylome_id) REFERENCES phylomes(phylome_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (protein_1) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (protein_2) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS coorthologs (
    phylome_id INT(20) UNSIGNED NOT NULL,
    protein_1 INT(20) UNSIGNED NOT NULL,
    protein_2 INT(20) UNSIGNED NOT NULL,
    INDEX phylome_id_seed_protein_id_target_protein_id_idx (phylome_id, protein_1, protein_2),
    FOREIGN KEY (phylome_id) REFERENCES phylomes(phylome_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (protein_1) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (protein_2) REFERENCES proteins(protein_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

-- ===============================================================
-- PROCEDURES & TRIGGERS
-- =====================
DELIMITER //
CREATE PROCEDURE get_next_auto_version_increment(taxid_value INT, OUT next_version_value INT)
BEGIN
    SELECT
        COALESCE(MAX(version), 0) + 1 INTO next_version_value
    FROM
        genomes
    WHERE
    taxid = taxid_value;
END //
DELIMITER ;

DELIMITER //
CREATE OR REPLACE PROCEDURE GetGeneNeighbourhoodsByTreeId(IN query_tree_id INT, IN neighbour_num_range INT) BEGIN
WITH target_tree AS (
    SELECT * FROM trees WHERE tree_id=query_tree_id LIMIT 1
),
tree_target_genes AS (
        SELECT genes.*
        FROM tree_contents
        JOIN proteins
        ON (proteins.protein_id = tree_contents.target_protein_id)
        JOIN genes
        ON (proteins.gene_id = genes.gene_id)
        WHERE tree_contents.phylome_id=(SELECT phylome_id FROM target_tree) AND tree_contents.seed_protein_id=(SELECT seed_protein_id FROM target_tree)
),
sorted_genes_by_tree_gene_contigs AS (
    SELECT genes.*, proteins.protein_id, ROW_NUMBER() OVER (ORDER BY genes.contig_id, genes.start, genes.end) AS row_num
    FROM proteins
    JOIN genes
    ON (proteins.gene_id = genes.gene_id)
    WHERE genes.contig_id IN ( SELECT contig_id FROM tree_target_genes )
),
numbered_tree_target_genes AS (
    SELECT sorted_genes_by_tree_gene_contigs.*
    FROM sorted_genes_by_tree_gene_contigs
    JOIN tree_target_genes
    ON (tree_target_genes.gene_id=sorted_genes_by_tree_gene_contigs.gene_id)
)
SELECT
    sorted_genes_by_tree_gene_contigs.gene_id,
    numbered_tree_target_genes.gene_id AS main_contig_gene_id,
    sorted_genes_by_tree_gene_contigs.external_gene_id,
    sorted_genes_by_tree_gene_contigs.contig_id,
    sorted_genes_by_tree_gene_contigs.gene_name,
    sorted_genes_by_tree_gene_contigs.source,
    sorted_genes_by_tree_gene_contigs.start,
    sorted_genes_by_tree_gene_contigs.end,
    sorted_genes_by_tree_gene_contigs.relative_contig_gene_order,
    sorted_genes_by_tree_gene_contigs.strand,
    sorted_genes_by_tree_gene_contigs.timestamp,
    sorted_genes_by_tree_gene_contigs.genome_id,
    sorted_genes_by_tree_gene_contigs.protein_id
FROM sorted_genes_by_tree_gene_contigs
JOIN numbered_tree_target_genes
ON (sorted_genes_by_tree_gene_contigs.contig_id = numbered_tree_target_genes.contig_id)
WHERE ABS(sorted_genes_by_tree_gene_contigs.row_num - numbered_tree_target_genes.row_num) <= neighbour_num_range;
END //
DELIMITER ;


DELIMITER //
CREATE OR REPLACE PROCEDURE GetProteomeByPhylome(IN query_phylome_id INT) BEGIN
SELECT
    phylome_contents.phylome_id,
    genomes.taxid species_taxid,
    genomes.version AS genome_version,
    species.name AS species_name,
    genomes.source AS genome_source,
    genomes.timestamp AS genome_timestamp,
    genomes.genome_id,
    COUNT(proteins.protein_id) as isoform_count,
    COUNT(DISTINCT genes.gene_id) as longest_isoform_count
FROM
    genes
    JOIN genomes ON (genes.genome_id = genomes.genome_id)
    JOIN proteins ON (genes.gene_id = proteins.gene_id)
    JOIN protein_sequences ON (
        proteins.protein_id = protein_sequences.protein_id
    )
    JOIN species ON (species.taxid = genomes.taxid)
    JOIN phylome_contents ON(phylome_contents.genome_id = genomes.genome_id)
WHERE
    phylome_contents.phylome_id = query_phylome_id
GROUP BY
    genomes.genome_id;
END //
DELIMITER ;


DELIMITER //
CREATE OR REPLACE PROCEDURE GetLongestIsoformsByPhylome(IN query_phylome_id INT) BEGIN WITH RankedSequences AS (
    SELECT
        genomes.taxid,
        proteins.gene_id,
        proteins.protein_id,
        protein_sequences.sequence,
        ROW_NUMBER() OVER (
            PARTITION BY gene_id
            ORDER BY
                LENGTH(sequence) DESC
        ) AS rn
    FROM
        protein_sequences
        JOIN proteins ON (
            protein_sequences.protein_id = proteins.protein_id
        )
        JOIN genes ON (genes.gene_id = proteins.gene_id)
        JOIN genomes ON (genomes.genome_id = genes.genome_id)
        JOIN phylome_contents ON (phylome_contents.genome_id = genomes.genome_id)
    WHERE
        phylome_contents.phylome_id = query_phylome_id
)
SELECT
    taxid,
    gene_id,
    protein_id,
    sequence
FROM
    RankedSequences
WHERE
    rn = 1;
END //
DELIMITER ;


DELIMITER //
CREATE OR REPLACE PROCEDURE GetIsoformsByPhylome(IN query_phylome_id INT) BEGIN
SELECT
    genomes.taxid,
    proteins.gene_id,
    proteins.protein_id,
    protein_sequences.sequence
FROM
    protein_sequences
    JOIN proteins ON (
        protein_sequences.protein_id = proteins.protein_id
    )
    JOIN genes ON (genes.gene_id = proteins.gene_id)
    JOIN genomes ON (genomes.genome_id = genes.genome_id)
    JOIN phylome_contents ON (phylome_contents.genome_id = genomes.genome_id)
WHERE
    phylome_contents.phylome_id = query_phylome_id;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_insert_into_genomes BEFORE
INSERT
    ON genomes FOR EACH ROW BEGIN DECLARE next_auto_increment_version_num INT;

CALL get_next_auto_version_increment(NEW.taxid, next_auto_increment_version_num);

SET
    NEW.version = next_auto_increment_version_num;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_modification_time BEFORE
UPDATE
    ON phylomes FOR EACH ROW BEGIN
SET
    NEW.modification_time = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- =====================
-- VIEWS
-- ===================================================
CREATE OR REPLACE VIEW isoforms AS
SELECT
    protein_sequences.sequence_id,
    proteins.protein_id,
    proteins.external_protein_id,
    proteins.description,
    genes.gene_id,
    protein_sequences.timestamp AS protein_sequence_timestamp,
    protein_sequences.sequence,
    genomes.genome_id,
    genomes.source,
    genomes.timestamp AS genome_timestamp,
    genomes.taxid,
    genomes.version,
    species.name
FROM
    genes
    JOIN genomes ON (genes.genome_id = genomes.genome_id)
    JOIN proteins ON (genes.gene_id = proteins.gene_id)
    JOIN protein_sequences ON (
        proteins.protein_id = protein_sequences.protein_id
    )
    JOIN species ON (species.taxid = genomes.taxid);

CREATE
OR REPLACE VIEW longest_isoforms AS
SELECT
    *,
    MAX(LENGTH(sequence)) AS longest_isoform_length
FROM
    isoforms
GROUP BY
    gene_id;

-- -- ===================================================
-- -- DUMMY DATA
-- -- ===================================================
-- spe2ages_jsons
LOAD DATA INFILE "/tmp/development-data/spe2ages_jsons.tsv" INTO TABLE spe2ages_jsons;

-- species
LOAD DATA INFILE "/tmp/development-data/species.tsv" INTO TABLE species;

-- genomes
LOAD DATA INFILE "/tmp/development-data/genomes.tsv" INTO TABLE genomes;

-- genes
LOAD DATA INFILE "/tmp/development-data/gene_00.tsv" INTO TABLE genes;
LOAD DATA INFILE "/tmp/development-data/gene_01.tsv" INTO TABLE genes;

-- proteins
LOAD DATA INFILE "/tmp/development-data/protein_00.tsv" INTO TABLE proteins;
LOAD DATA INFILE "/tmp/development-data/protein_01.tsv" INTO TABLE proteins;

-- protein_sequences
LOAD DATA INFILE "/tmp/development-data/protein_sequences_00.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_01.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_02.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_03.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_04.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_05.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_06.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_07.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_08.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_09.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_10.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_11.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_12.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_13.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_14.tsv" INTO TABLE protein_sequences;
LOAD DATA INFILE "/tmp/development-data/protein_sequences_15.tsv" INTO TABLE protein_sequences;

-- phylomes
LOAD DATA INFILE "/tmp/development-data/phylomes.tsv" INTO TABLE phylomes;

-- phylome_contents
LOAD DATA INFILE "/tmp/development-data/phylome_contents.tsv" INTO TABLE phylome_contents;

-- trees
LOAD DATA INFILE "/tmp/development-data/tree_00.tsv" INTO TABLE trees;
LOAD DATA INFILE "/tmp/development-data/tree_01.tsv" INTO TABLE trees;
LOAD DATA INFILE "/tmp/development-data/tree_02.tsv" INTO TABLE trees;

-- tree_contents
LOAD DATA INFILE "/tmp/development-data/tree_contents.tsv" INTO TABLE tree_contents;

-- alignments
LOAD DATA INFILE "/tmp/development-data/alignment_00.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_01.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_02.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_03.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_04.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_05.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_06.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_07.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_08.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_09.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_10.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_11.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_12.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_13.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_14.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_15.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_16.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_17.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_18.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_19.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_20.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_21.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_22.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_23.tsv" INTO TABLE alignments;
LOAD DATA INFILE "/tmp/development-data/alignment_24.tsv" INTO TABLE alignments;

-- alignment_relations
LOAD DATA INFILE "/tmp/development-data/alignment_relations.tsv" INTO TABLE alignment_relations;

-- homologs
LOAD DATA INFILE "/tmp/development-data/homologs.tsv" INTO TABLE homologs;

-- orthologs
LOAD DATA INFILE "/tmp/development-data/orthologs.tsv" INTO TABLE orthologs;

-- coorthologs
LOAD DATA INFILE "/tmp/development-data/coorthologs.tsv" INTO TABLE coorthologs;
