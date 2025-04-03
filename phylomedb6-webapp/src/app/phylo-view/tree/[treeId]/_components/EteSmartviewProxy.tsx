"use client";

import LoadingSpinner1 from "@/components/loading-spinner/LoadingSpinner1";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { LocalStorageCache } from "@/lib/localStorageUtils";

export default function EteSmartviewProxy({
    treeViewId,
}: {
    treeViewId: string;
}) {
    const [smartviewUrl, setSmartviewUrl] = useState<string | null>(null);

    useEffect(() => {
        getTreeViewLink(treeViewId, setSmartviewUrl);
    }, [treeViewId]);

    if (!smartviewUrl) {
        return (
            <div className="w-full flex justify-center items-center">
                <LoadingSpinner1 />
            </div>
        );
    }

    return (
        <iframe
            onMouseEnter={(e) => {
                // Avoid the host page scrolling.
                document.body.style.overflow = "hidden";
            }}
            onMouseLeave={(e) => {
                // Allow scrolling again of the host page.
                document.body.style.overflow = "";
            }}
            key={treeViewId}
            src={smartviewUrl}
            className="w-full h-[50rem]"
        />
    );
}

const TreeViewLocalStorageCache = {
    init() {
        const cache = LocalStorageCache.getCache("treeUrlCaches");
        if (!cache) {
            LocalStorageCache.setCache("treeUrlCaches", {});
        }
        return this;
    },
    getCachedTreeViewUrl(treeViewId: string): string | null {
        if (!window) {
            return null;
        }
        const treeUrlCaches: Record<string, string> | null =
            LocalStorageCache.getCache("treeUrlCaches");
        if (!treeUrlCaches) {
            throw Error(
                "TreeViewLocalStorageCache is not initialized. Use the 'TreeViewLocalStorageCache.init' method!",
            );
        }
        const result = treeUrlCaches[treeViewId];
        if (!result) {
            return null;
        }
        return result;
    },
    setCachedTreeViewUrl(treeViewId: string, url: string) {
        if (!window) {
            return null;
        }
        const treeUrlCaches: Record<string, string> | null =
            LocalStorageCache.getCache("treeUrlCaches");
        if (!treeUrlCaches) {
            throw Error(
                "TreeViewLocalStorageCache is not initialized. Use the 'TreeViewLocalStorageCache.init' method!",
            );
        }
        treeUrlCaches[treeViewId] = url;
        LocalStorageCache.setCache("treeUrlCaches", treeUrlCaches);
    },
    async fetchNewTreeViewUrl(treeViewId: string): Promise<string> {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/ete-smartview/get/${treeViewId}`,
        );
        const url = res.url;
        return url;
    },
    async verifyTreeViewId(treeId: string): Promise<boolean> {
        const result = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/ete-smartview/check-cache/${treeId}`,
        );
        const data = await result.json();
        return data["exists"];
    },
    async getUrl(treeViewId: string): Promise<string> {
        let cacheResult = this.getCachedTreeViewUrl(treeViewId);
        if (!cacheResult) {
            const newUrl = await this.fetchNewTreeViewUrl(treeViewId);
            this.setCachedTreeViewUrl(treeViewId, newUrl);
            return newUrl;
        }
        const url = new URL(cacheResult);
        const treeName: string | null = url.searchParams.get("tree");
        if (!treeName) {
            const newUrl = await this.fetchNewTreeViewUrl(treeViewId);
            this.setCachedTreeViewUrl(treeViewId, newUrl);
            return newUrl;
        }
        const treeId: string = treeName.replace("tree-", "").trim();
        const treeIdExists: boolean = await this.verifyTreeViewId(treeId);
        if (!treeIdExists) {
            const newUrl = await this.fetchNewTreeViewUrl(treeViewId);
            this.setCachedTreeViewUrl(treeViewId, newUrl);
            return newUrl;
        }
        return cacheResult;
    },
};

async function getTreeViewLink(
    treeViewId: string,
    setSmartviewUrl: Dispatch<SetStateAction<string | null>>,
) {
    const treeViewCache = TreeViewLocalStorageCache.init();
    const url = await treeViewCache.getUrl(treeViewId);
    setSmartviewUrl(url);
}
