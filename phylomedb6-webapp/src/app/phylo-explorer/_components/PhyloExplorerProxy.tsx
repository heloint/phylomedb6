export default function PhyloExplorerProxy({
    className,
}: {
    className?: string;
}) {
    return (
        <iframe
            id="phylo-explorer-iframe"
            src={`/phylo-explorer-service/phylo-explorer`}
            className={className}
        />
    );
}
