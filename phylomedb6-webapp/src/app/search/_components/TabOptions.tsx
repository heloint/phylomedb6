"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SessionData } from "@/auth/models/login_sessions";

export default function TabOptions({
    sessionData,
}: {
    sessionData: SessionData | null;
}) {
    let searchOptions;
    if (sessionData !== null) {
        searchOptions = ["gene", "sequence", "history"];
    } else {
        searchOptions = ["gene", "sequence"];
    }

    const router = useRouter();
    const pathname = usePathname();

    const [optionSelected, setOptionSelected] = useState(searchOptions[0]);

    useEffect(() => {
        console.log("refreshed");
        const currentOption = pathname.split("/").pop();
        if (currentOption && searchOptions.includes(currentOption)) {
            setOptionSelected(currentOption);
        }
    }, []);

    const handleTabClick = (key: string) => {
        setOptionSelected(key);
        router.push(`/search/${key.toLowerCase()}`);
        router.refresh();
    };

    return (
        <div className="px-1 sm:px-10 md:px-20 w-full flex flex-col gap-0 sm:flex-row justify-center items-center">
            {searchOptions.map((key, index) => (
                <button
                    key={index}
                    type="button"
                    className={`w-full sm:w-1/4 py-1 sm:py-3 rounded-t-lg text-black font-semibold
                        border-2 border-gray-400
                      ${
                          optionSelected === key
                              ? "sm:z-10 sm:-mb-2 backdrop-blur-sm sm:bg-white bg-slate-300 bg-opacity-75 border-t-gray-600 sm:border-b-0 sm:border-b-transparent border-b-gray-600 border-x-gray-600"
                              : "bg-zinc-100 hover:bg-white hover:border-solid hover:border-slate-700"
                      } `}
                    onClick={() => handleTabClick(key)}
                >
                    {capitalizeFirstLetter(key)}
                </button>
            ))}
        </div>
    );
}

function capitalizeFirstLetter(line: string) {
    return line.charAt(0).toUpperCase() + line.slice(1);
}
