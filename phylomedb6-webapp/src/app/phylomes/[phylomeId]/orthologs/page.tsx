import DownloadLoading from "./_components/DownloadLoading";

export const metadata = {
    title: "Phylome Orthologs",
    description:
        "Orthologs report for a specific phylome in the PhylomeDB database.",
};
export default function Page({ params }: { params: { phylomeId: string } }) {
    return <DownloadLoading phylomeId={params.phylomeId} />;
}
