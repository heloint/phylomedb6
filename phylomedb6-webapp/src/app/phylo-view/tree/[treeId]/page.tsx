import EteSmartviewProxy from "./_components/EteSmartviewProxy";
import TreeDetailsHeaderLine from "./_components/TreeDetailsHeaderLine";

import { genes, genomes, proteins, species, trees } from "@/remoteDb/schema";
import remoteDb from "@/remoteDb";
import { eq } from "drizzle-orm";

export const metadata = {
    title: "Phylo view: Phylogenetic Tree",
    description:
        "Explore detailed information about phylogenetic tree by tree ID.",
};

export default async function Page({ params }: { params: { treeId: string } }) {
    const responseData = await remoteDb
        .select({
            phylome_id: trees.phylome_id,
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
        .innerJoin(genomes, eq(genes.genome_id, genes.genome_id))
        .innerJoin(species, eq(genomes.taxid, species.taxid))
        .where(eq(trees.tree_id, Number(Number(params.treeId))))
        .limit(1);
    const tableData = responseData[0];
    return (
        <div
            className="w-full flex justify-center items-center"
            id="tree-container"
        >
            <div className="sm:w-11/12 px-3 sm:px-10 overflow-x-scroll">
                <TreeDetailsHeaderLine tableData={tableData} />
                <EteSmartviewProxy treeViewId={params.treeId} />
            </div>
        </div>
    );
}
