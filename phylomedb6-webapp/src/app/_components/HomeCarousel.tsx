import Box1 from "@/components/box1/box1";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export default function HomeCarousel({ className }: { className?: string }) {
    return (
        <Box1 extraClasses={`${className} p-4`}>
            <div className="flex flex-col justify-center">
                <Carousel>
                    <CarouselContent>
                        <CarouselItem className="h-fit">
                            <div>
                                <h1 className="text-2xl font-bold pb-6 text-center">
                                    Phylogenetic trees
                                </h1>
                                <p className="pb-6 text-justify">
                                    Representing the evolutionary relationships
                                    of homologous genes are the entry point for
                                    many evolutionary analyses.
                                </p>
                                <span className="flex justify-center items-center">
                                    <img
                                        alt="tree example"
                                        width={1200}
                                        height={900}
                                        src="/home-swiper-images/tree-example.webp"
                                        className=""
                                    />
                                </span>
                            </div>
                        </CarouselItem>

                        <CarouselItem className="h-fit">
                            {" "}
                            <div>
                                <h1 className="text-2xl font-bold pb-6 text-center">
                                    Phylo Explorer
                                </h1>
                                <p className="pb-6 text-justify">
                                    Decide bettter which phylome suits your need
                                    by browsing a set of species that the result
                                    phylomes must contain.
                                </p>
                                <span className="flex justify-center items-center">
                                    <img
                                        alt="phylo explorer matrix"
                                        width={1200}
                                        height={900}
                                        src="/home-swiper-images/phylo-explorer-matrix.webp"
                                        className=""
                                    />
                                </span>
                            </div>
                        </CarouselItem>

                        <CarouselItem className="h-fit">
                            {" "}
                            <div>
                                <h1 className="text-2xl font-bold pb-6 text-center">
                                    Alignments
                                </h1>
                                <p className="pb-6 text-justify">
                                    PhylomeDB offers access to comprehensive
                                    multiple sequence alignments derived from
                                    phylogenetic analyses.
                                </p>
                                <span className="flex justify-center items-center">
                                    <img
                                        alt="alignment example"
                                        width={1200}
                                        height={900}
                                        src="/home-swiper-images/alignment-example.webp"
                                        className=""
                                    />
                                </span>
                            </div>
                        </CarouselItem>

                        <CarouselItem className="h-fit">
                            {" "}
                            <div>
                                <h1 className="text-2xl font-bold pb-6 text-center">
                                    Species and taxonomy
                                </h1>
                                <p className="pb-6 text-justify">
                                    PhylomeDB visually represents the
                                    relationships and classifications of various
                                    species within the NCBI taxonomy tree.
                                </p>
                                <span className="flex justify-center items-center">
                                    <img
                                        alt="tree example"
                                        width={1200}
                                        height={900}
                                        src="/home-swiper-images/species-taxonomy-example.webp"
                                        className=""
                                    />
                                </span>
                            </div>
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="w-16 h-16" />
                    <CarouselNext className="w-16 h-16" />
                </Carousel>
            </div>
        </Box1>
    );
}
