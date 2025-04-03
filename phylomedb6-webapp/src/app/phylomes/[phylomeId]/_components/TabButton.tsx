"use client";

import { useRouter } from "next/navigation";

export function TabButton({
    index,
    phylomeId,
    selectedTabType,
    label,
    url,
}: {
    index: number;
    phylomeId: string;
    selectedTabType: string;
    label: string;
    url: string;
}) {
    const router = useRouter();
    return (
        <button
            key={index}
            type="button"
            className={`w-full sm:w-1/4 py-1 sm:py-3 rounded-t-lg text-black font-semibold
                      hover:bg-white border-2 hover:border-solid hover:border-slate-700
                       ${
                           selectedTabType === url
                               ? "sm:backdrop-blur-lg bg-gray-400 sm:bg-white bg-opacity-50 border-t-gray-600 border-b-transparent border-x-gray-600 shadow-inner"
                               : "bg-zinc-100 border-b-gray-600 border-gray-400"
                       } `}
            onClick={() => router.replace(`/phylomes/${phylomeId}/${url}`)}
        >
            {label}
        </button>
    );
}
