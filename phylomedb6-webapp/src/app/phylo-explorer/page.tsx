import PhyloExplorerProxy from "./_components/PhyloExplorerProxy";
export const metadata = {
    title: "Phylo Explorer",
    description:
        "Browse phylomes interactively by including combinations of species.",
};

export default function Page() {
    return (
        <div className="w-full flex flex-col flex-shrink-0 justify-center items-center px-3 py-4 sm:px-8">
            <div className="overflow-x-scroll min-h-lvh  w-full h-fit">
                <PhyloExplorerProxy className="w-full min-h-lvh bg-white bg-opacity-65 shadow-inner backdrop-blur-lg rounded-3xl" />
            </div>
        </div>
    );
}
