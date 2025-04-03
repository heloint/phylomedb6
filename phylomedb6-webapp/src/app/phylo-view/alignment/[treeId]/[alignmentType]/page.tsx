export const metadata = {
    title: "Phylo view: Alignment",
    description:
        "View the alignment of the phylogenetic tree by ID and alignment type.",
};

export const dynamic = "force-dynamic";
export default async function Page({
    params,
}: {
    params: { treeId: string; alignmentType: string };
}) {
    const alignmentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ete-smartview/alignment/${params.treeId}/${params.alignmentType}`;
    return (
        <div className="flex flex-col justify-center items-center ">
            <div className="py-2 px-2 lg:px-12 xl:px-24 flex-shrink-0 w-full">
                <iframe
                    key={alignmentUrl}
                    loading="lazy"
                    className="w-full h-[52rem]"
                    src={alignmentUrl}
                ></iframe>
            </div>
        </div>
    );
}
