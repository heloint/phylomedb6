-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `alignments` (
	`alignment_md5_id` char(32) NOT NULL,
	`alignment` mediumblob DEFAULT 'NULL',
	`sha256sum` longtext NOT NULL,
	`timestamp` timestamp DEFAULT 'current_timestamp()',
	`seqs_numb` int(6) NOT NULL,
	`residues_numb` int(6) NOT NULL,
	`alignment_type` enum('raw','clean','other') NOT NULL DEFAULT ''raw'',
	CONSTRAINT `sha256sum` UNIQUE(`sha256sum`)
);
--> statement-breakpoint
CREATE TABLE `alignment_relations` (
	`alignment_md5_id` char(32) NOT NULL,
	`phylome_id` int(20) unsigned NOT NULL,
	`seed_protein_id` int(20) unsigned NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fake_taxid_seq` (
	`next_not_cached_value` bigint(21) NOT NULL,
	`minimum_value` bigint(21) NOT NULL,
	`maximum_value` bigint(21) NOT NULL,
	`start_value` bigint(21) NOT NULL,
	`increment` bigint(21) NOT NULL,
	`cache_size` bigint(21) unsigned NOT NULL,
	`cycle_option` tinyint NOT NULL,
	`cycle_count` bigint(21) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `genes` (
	`gene_id` int(20) unsigned AUTO_INCREMENT NOT NULL,
	`external_gene_id` varchar(200) DEFAULT 'NULL',
	`contig_id` varchar(200) DEFAULT 'NULL',
	`gene_name` varchar(200) NOT NULL,
	`source` varchar(200) NOT NULL,
	`start` int(25) NOT NULL,
	`end` int(25) NOT NULL,
	`strand` enum('+','-') DEFAULT 'NULL',
	`timestamp` timestamp DEFAULT 'current_timestamp()',
	`genome_id` int(20) unsigned NOT NULL
);
--> statement-breakpoint
CREATE TABLE `genomes` (
	`genome_id` int(20) unsigned AUTO_INCREMENT NOT NULL,
	`external_genome_id` varchar(50) DEFAULT 'NULL',
	`taxid` int(20) unsigned NOT NULL,
	`version` int(10) unsigned NOT NULL,
	`source` varchar(200) NOT NULL,
	`uploaded_by` varchar(20) NOT NULL,
	`comments` varchar(200) DEFAULT 'NULL',
	`timestamp` timestamp DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `isoforms` (
	`sequence_id` int(30) unsigned NOT NULL DEFAULT 0,
	`protein_id` int(20) unsigned NOT NULL DEFAULT 0,
	`external_protein_id` varchar(200) NOT NULL,
	`description` varchar(500) DEFAULT 'NULL',
	`gene_id` int(20) unsigned NOT NULL DEFAULT 0,
	`protein_sequence_timestamp` timestamp DEFAULT 'current_timestamp()',
	`sequence` longtext NOT NULL,
	`genome_id` int(20) unsigned NOT NULL DEFAULT 0,
	`source` varchar(200) NOT NULL,
	`genome_timestamp` timestamp DEFAULT 'current_timestamp()',
	`taxid` int(20) unsigned NOT NULL,
	`version` int(10) unsigned NOT NULL,
	`name` varchar(500) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `longest_isoforms` (
	`sequence_id` int(30) unsigned NOT NULL DEFAULT 0,
	`protein_id` int(20) unsigned NOT NULL DEFAULT 0,
	`external_protein_id` varchar(200) NOT NULL,
	`description` varchar(500) DEFAULT 'NULL',
	`gene_id` int(20) unsigned NOT NULL DEFAULT 0,
	`protein_sequence_timestamp` timestamp DEFAULT 'current_timestamp()',
	`sequence` longtext NOT NULL,
	`genome_id` int(20) unsigned NOT NULL DEFAULT 0,
	`source` varchar(200) NOT NULL,
	`genome_timestamp` timestamp DEFAULT 'current_timestamp()',
	`taxid` int(20) unsigned NOT NULL,
	`version` int(10) unsigned NOT NULL,
	`name` varchar(500) NOT NULL,
	`longest_isoform_length` bigint(10) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `phylomes` (
	`phylome_id` int(20) unsigned AUTO_INCREMENT NOT NULL,
	`seed_genome_id` int(20) unsigned NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` varchar(500) NOT NULL,
	`comments` varchar(500) DEFAULT 'NULL',
	`responsible` varchar(200) NOT NULL,
	`modification_time` timestamp DEFAULT 'NULL',
	`timestamp` timestamp DEFAULT 'current_timestamp()',
	`spe2ages_id` int(20) unsigned DEFAULT 'NULL',
	`is_public` tinyint NOT NULL DEFAULT 0,
	`pubmed_link` varchar(500) DEFAULT 'NULL',
	`pubmed_title` varchar(500) DEFAULT 'NULL',
	CONSTRAINT `name` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `phylome_contents` (
	`phylome_id` int(20) unsigned NOT NULL,
	`genome_id` int(20) unsigned NOT NULL
);
--> statement-breakpoint
CREATE TABLE `proteins` (
	`protein_id` int(20) unsigned AUTO_INCREMENT NOT NULL,
	`external_protein_id` varchar(200) NOT NULL,
	`description` varchar(500) DEFAULT 'NULL',
	`gene_id` int(20) unsigned NOT NULL
);
--> statement-breakpoint
CREATE TABLE `protein_sequences` (
	`sequence_id` int(30) unsigned AUTO_INCREMENT NOT NULL,
	`sequence` longtext NOT NULL,
	`sha256sum` longtext DEFAULT 'NULL',
	`timestamp` timestamp DEFAULT 'current_timestamp()',
	`protein_id` int(20) unsigned NOT NULL,
	CONSTRAINT `sha256sum` UNIQUE(`sha256sum`)
);
--> statement-breakpoint
CREATE TABLE `spe2ages_jsons` (
	`spe2ages_id` int(20) unsigned AUTO_INCREMENT NOT NULL,
	`json_content` longtext NOT NULL,
	CONSTRAINT `json_content` UNIQUE(`json_content`)
);
--> statement-breakpoint
CREATE TABLE `species` (
	`taxid` int(20) unsigned NOT NULL DEFAULT 'nextval(`phylomedb6`.`fake_taxid_seq`)',
	`name` varchar(500) NOT NULL,
	`has_fake_taxid` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `name` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `trees` (
	`tree_id` int(20) unsigned AUTO_INCREMENT NOT NULL,
	`phylome_id` int(20) unsigned NOT NULL,
	`seed_protein_id` int(20) unsigned NOT NULL,
	`method` varchar(200) NOT NULL,
	`lk` float NOT NULL DEFAULT 0,
	`newick` longtext NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tree_contents` (
	`phylome_id` int(20) unsigned NOT NULL,
	`seed_protein_id` int(20) unsigned NOT NULL,
	`target_protein_id` int(20) unsigned NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uniprot_id_mappings` (
	`uniprotkb_ac_id` varchar(50) NOT NULL,
	`id_type` varchar(50) NOT NULL,
	`external_gene_id` varchar(200) NOT NULL,
	CONSTRAINT `external_gene_id` UNIQUE(`external_gene_id`)
);
--> statement-breakpoint
ALTER TABLE `alignment_relations` ADD CONSTRAINT `alignment_relations_ibfk_1` FOREIGN KEY (`alignment_md5_id`) REFERENCES `alignments`(`alignment_md5_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `alignment_relations` ADD CONSTRAINT `alignment_relations_ibfk_2` FOREIGN KEY (`phylome_id`) REFERENCES `phylomes`(`phylome_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `alignment_relations` ADD CONSTRAINT `alignment_relations_ibfk_3` FOREIGN KEY (`seed_protein_id`) REFERENCES `proteins`(`protein_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `genes` ADD CONSTRAINT `genes_ibfk_1` FOREIGN KEY (`genome_id`) REFERENCES `genomes`(`genome_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `genomes` ADD CONSTRAINT `genomes_ibfk_1` FOREIGN KEY (`taxid`) REFERENCES `species`(`taxid`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `phylomes` ADD CONSTRAINT `phylomes_ibfk_1` FOREIGN KEY (`spe2ages_id`) REFERENCES `spe2ages_jsons`(`spe2ages_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `phylome_contents` ADD CONSTRAINT `phylome_contents_ibfk_1` FOREIGN KEY (`phylome_id`) REFERENCES `phylomes`(`phylome_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `phylome_contents` ADD CONSTRAINT `phylome_contents_ibfk_2` FOREIGN KEY (`genome_id`) REFERENCES `genomes`(`genome_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `proteins` ADD CONSTRAINT `proteins_ibfk_1` FOREIGN KEY (`gene_id`) REFERENCES `genes`(`gene_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `protein_sequences` ADD CONSTRAINT `protein_sequences_ibfk_1` FOREIGN KEY (`protein_id`) REFERENCES `proteins`(`protein_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `trees` ADD CONSTRAINT `trees_ibfk_1` FOREIGN KEY (`phylome_id`) REFERENCES `phylomes`(`phylome_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `trees` ADD CONSTRAINT `trees_ibfk_2` FOREIGN KEY (`seed_protein_id`) REFERENCES `proteins`(`protein_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `tree_contents` ADD CONSTRAINT `tree_contents_ibfk_1` FOREIGN KEY (`phylome_id`) REFERENCES `phylomes`(`phylome_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `tree_contents` ADD CONSTRAINT `tree_contents_ibfk_2` FOREIGN KEY (`seed_protein_id`) REFERENCES `proteins`(`protein_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `tree_contents` ADD CONSTRAINT `tree_contents_ibfk_3` FOREIGN KEY (`target_protein_id`) REFERENCES `proteins`(`protein_id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `phylome_id` ON `alignment_relations` (`phylome_id`);--> statement-breakpoint
CREATE INDEX `seed_protein_id` ON `alignment_relations` (`seed_protein_id`);--> statement-breakpoint
CREATE INDEX `genome_id` ON `genes` (`genome_id`);--> statement-breakpoint
CREATE INDEX `taxid` ON `genomes` (`taxid`);--> statement-breakpoint
CREATE INDEX `spe2ages_id` ON `phylomes` (`spe2ages_id`);--> statement-breakpoint
CREATE INDEX `genome_id` ON `phylome_contents` (`genome_id`);--> statement-breakpoint
CREATE INDEX `gene_id` ON `proteins` (`gene_id`);--> statement-breakpoint
CREATE INDEX `protein_id` ON `protein_sequences` (`protein_id`);--> statement-breakpoint
CREATE INDEX `phylome_id` ON `trees` (`phylome_id`);--> statement-breakpoint
CREATE INDEX `seed_protein_id` ON `trees` (`seed_protein_id`);--> statement-breakpoint
CREATE INDEX `phylome_id_seed_protein_id_target_protein_id_idx` ON `tree_contents` (`phylome_id`,`seed_protein_id`,`target_protein_id`);--> statement-breakpoint
CREATE INDEX `seed_protein_id` ON `tree_contents` (`seed_protein_id`);--> statement-breakpoint
CREATE INDEX `target_protein_id` ON `tree_contents` (`target_protein_id`);
*/