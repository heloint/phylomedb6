"use client";

import { useState } from "react";
import Box1 from "@/components/box1/box1";
import Box2 from "@/components/box2/box1";

export default function HomeWelcomeBox({ className }: { className?: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleText = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Box1 extraClasses={`${className} flex flex-col gap-5`}>
            <div className="flex flex-col gap-3 justify-start">
                <h1 className="font-mono text-3xl font-bold">
                    Welcome To PhylomeDB6!
                </h1>
                <p>Your catalog of gene phylogenies.</p>
                <h3 className="text-xl font-bold mt-3">What is phylomeDB?</h3>
                <p
                    className={` text-justify ${
                        isExpanded ? "" : "max-h-36 overflow-hidden"
                    } sm:max-h-none sm:overflow-visible`}
                >
                    PhylomeDB is a public database for complete catalogs of gene
                    phylogenies (phylomes). It allows users to interactively
                    explore the evolutionary history of genes through the
                    visualization of phylogenetic trees and multiple sequence
                    alignments. Moreover, phylomeDB provides genome-wide
                    orthology and paralogy predictions which are based on the
                    analysis of the phylogenetic trees. The automated pipeline
                    used to reconstruct trees aims at providing a high-quality
                    phylogenetic analysis of different genomes, including
                    Maximum Likelihood tree inference, alignment trimming and
                    evolutionary model testing.
                </p>
                <button onClick={toggleText} className="text-blue-500 ">
                    {isExpanded ? (
                        <span className="sm:hidden  pr-2 flex justify-start">
                            Collapse
                        </span>
                    ) : (
                        <span className="sm:hidden  pr-2 flex justify-start">
                            More...
                        </span>
                    )}
                </button>
            </div>

            <Box2 extraClasses="flex flex-col justify-center items-center gap-2">
                <div className="grid justify-center items-center">
                    <div className="flex flex-col justify-center items-center gap-3">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-3">
                            <img
                                alt="phylomedb icon"
                                width={100}
                                height={100}
                                src="/icons/anouncment-icon.webp"
                                className="mb-5"
                            />
                            <img
                                alt="phylomedb icon"
                                width={100}
                                height={100}
                                src="/logos/phylomedb-logo-lg.webp"
                                className="mb-5"
                            />
                        </div>

                        <h1 className="text-2xl text-center overflow-visible">
                            ERGA PHYLOMES INICIATIVE
                        </h1>
                        <h2 className="text-xl text-center overflow-visible">
                            Call for collaborative projects proposal
                        </h2>
                    </div>
                </div>
            </Box2>
        </Box1>
    );
}
