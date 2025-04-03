"use client";

import { useEffect, useState } from "react";

type DownloadLoadingParams = {
    phylomeId: string;
};

export default function DownloadLoading(params: DownloadLoadingParams) {
    const [isFetching, setIsFetching] = useState(true);
    useEffect(() => {
        const orthologsUrlToFetch: string = `/phylome-downloads/phylomes/${params.phylomeId}/orthologs`;
        if (!window) {
            return;
        }
        const tmpAnchorTag = document.createElement("a") as HTMLAnchorElement;
        tmpAnchorTag.href = orthologsUrlToFetch;
        tmpAnchorTag.click();
        tmpAnchorTag.remove();
    }, [params.phylomeId]);
    return (
        <div className="w-full flex justify-center items-center gap-16 py-32">
            <div className="flex flex-col justify-center items-center gap-1 px-3 sm:px-12 md:px-16 lg:px-24 rounded-3xl bg-white bg-opacity-50 backdrop-blur-lg border-2 border-gray-500 pb-3">
                <img
                    alt="phylo explorer matrix"
                    width={80}
                    height={80}
                    src="/icons/color-bar-loader.gif"
                    className=""
                />
                <p className="text-lg">
                    Generating orthologs report for Phylome{" "}
                    <a
                        target="_blank"
                        href={`/phylomes/${params.phylomeId}/description`}
                    >
                        <u className="text-green-800">
                            <b>{params.phylomeId}</b>
                        </u>
                    </a>
                    .
                </p>
                <p>The file will be downloading soon.</p>
                <p className="text-md">
                    {" "}
                    If it takes too long and you think it's stuck, then you can
                    try manually to start the download.{" "}
                    <a
                        target="_blank"
                        href={`/phylome-downloads/phylomes/${params.phylomeId}/orthologs`}
                    >
                        <u className="text-green-800">
                            phylome_{params.phylomeId}_orthologs.txt.gz
                        </u>
                    </a>
                </p>
            </div>
        </div>
    );
}
