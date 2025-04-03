export default function SpeciesAndTaxonomy({
    phylomeId,
}: {
    phylomeId: string | number;
}) {
    return (
        <>
            <div
                className="p-2 bg-white
         h-full flex flex-col-reverse lg:flex-row py-4 gap-2 sm:gap-4
         lg:gap-16 justify-center items-center lg:items-start rounded-b-xl "
            >
                <div>
                    <img
                        alt="species"
                        width={800}
                        height={800}
                        src={`/taxonomy-trees/${phylomeId}/circular`}
                    />
                </div>
                <div>
                    <img
                        alt="species"
                        width={500}
                        height={500}
                        src={`/taxonomy-trees/${phylomeId}/rectangular`}
                    />
                </div>
            </div>
        </>
    );
}
