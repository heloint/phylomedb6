import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type TreeDetailsContent = {
    columnName: string;
    content: any;
};

type TableRowData = {
    phylome_id: number;
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

export default function TreeDetailsHeaderLine({
    tableData,
}: {
    tableData: TableRowData;
}) {
    if (!tableData) {
        return null;
    }
    const treeDetailsContent: TreeDetailsContent[] = [
        {
            columnName: "Method",
            content: tableData.method,
        },
        {
            columnName: "LK",
            content: tableData.lk,
        },
        {
            columnName: "PhylomeDB Seed Gene ID",
            content: tableData.gene_id,
        },
        {
            columnName: "PhylomeDB Seed Protein ID",
            content: tableData.seed_protein_id,
        },
        {
            columnName: "Contig ID",
            content: tableData.contig_id,
        },
        {
            columnName: "PhylomeDB Genome ID",
            content: tableData.genome_id,
        },
        {
            columnName: "External Genome ID",
            content: tableData.external_genome_id,
        },
    ];

    return (
        <div className="py-1 bg-white bg-opacity-75 p-2 rounded-t-lg mt-4">
            <h1 id="tree" className="text-2xl">
                Phylome: {tableData.phylome_id}
            </h1>
            <h2 className="text-xl">Tree: {tableData.tree_id}</h2>
            <span>
                <p className="py-1 text-sm">
                    * If the tree is too large, some items will be truncated to
                    avoid obstructing the overall view. For example, to display
                    the gene order, you can zoom in further using the mouse
                    scroll, and the aligned faces will become visible.
                </p>
                <p className="py-1 text-sm">
                    * Due to the tree-like nature of the data visualization in
                    PhylomeDB, this feature may not provide an optimal user
                    experience on mobile devices. It is recommended to use a
                    device with a screen size equivalent to or larger than a
                    tablet in horizontal layout for better usability.
                </p>
            </span>
            <div className="w-3/4">
                <p className="pt-4">
                    <b>Gene order arrows</b>
                </p>
                <p className="py-1 text-sm">
                    <img
                        className="py-1"
                        src="/icons/gene_order_seed_arrows.png"
                        alt="Seed neighbour arrows"
                    />
                    The gene arrows corresponding to the seed leaf are
                    consistently assigned distinct colors and serve as reference
                    genes for the remainder of the tree structure. In the
                    example provided, the enlarged red arrow represents the gene
                    associated with the leaf protein, while the surrounding
                    arrows indicate neighboring genes.
                </p>
                <p className="py-1 text-sm">
                    <img
                        className="py-1"
                        src="/icons/gene_order_other_arrows.png"
                        alt="Other neighbour arrows"
                    />
                    If homologous relationships exist between the genes in other
                    leaves and their neighboring genes with those in the seed
                    leaf's gene neighborhood, the corresponding genes will share
                    the same color as the reference gene. For orthologous
                    relationships, the gene's border is enlarged and displayed
                    in black; for homologous relationships the arrow will be
                    without border.
                </p>
            </div>
            <hr className="h-[2px] bg-gray-500 bg-opacity-75" />
            <Table>
                <TableHeader>
                    <TableRow>
                        {treeDetailsContent.map((item, idx) => (
                            <TableHead key={idx}>{item.columnName}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        {treeDetailsContent.map((item, idx) => (
                            <TableCell key={idx}>{item.content}</TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
