"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import GenesDatatable from "./GenesTable";
import ErrorMessageWindow from "@/components/error-message-window/ErrorMessageWIndow";
import LoadingSpinner1 from "@/components/loading-spinner/LoadingSpinner1";

export default function GeneSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchGene = searchParams.get("gene");
    const searchHistory = searchParams.get("history");
    const [searchGeneValue, setSearchGeneValue] = useState<string | null>(
        searchGene,
    );
    const [errorText, setErrorText] = useState<string>("");
    const [geneData, setGeneData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Memoizar la función de búsqueda para evitar recreaciones innecesarias
    const doSearchByGene = useCallback(async (geneValue: string | null) => {
        if (!geneValue) {
            setIsLoading(false);
            return;
        }
        
        try {
            const response = await fetch(
                `/api/search/gene/${geneValue}`,
                {
                    cache: "no-store",
                },
            );

            if (!response.ok) {
                setErrorText("No data found");
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            
            // Registrar en historial solo si hay resultados y no viene de historial
            if (data.length !== 0 && searchHistory !== "true") {
                await fetch(
                    `/api/search/history/history?searchGeneValue=${geneValue}`,
                    { cache: "no-store" },
                );
            }
            
            setGeneData(data);
            setErrorText("");
            setIsLoading(false);
            
            // Actualizar URL sólo si es necesario
            const currentUrlGene = searchParams.get("gene");
            if (currentUrlGene !== geneValue) {
                const newParams = new URLSearchParams(searchParams.toString());
                if (geneValue && geneValue.trim()) {
                    newParams.set("gene", geneValue);
                } else {
                    newParams.delete("gene");
                }
                
                // Crear nueva URL sin provocar recargas
                const newUrl = pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
                router.replace(newUrl, { scroll: false });
            }
        } catch (error) {
            setErrorText(`Error has occured`);
            setIsLoading(false);
        }
    }, [pathname, router, searchHistory, searchParams]);

    // Función para iniciar búsqueda
    const launchSearch = useCallback((geneValue: string | null) => {
        if (!geneValue) {
            return;
        }
        setIsLoading(true);
        doSearchByGene(geneValue);
    }, [doSearchByGene]);

    // Efecto para la carga inicial basada en URL
    useEffect(() => {
        // Solo ejecutar en la carga inicial o cuando cambia searchGene en la URL
        if (isInitialLoad && searchGene) {
            setSearchGeneValue(searchGene);
            launchSearch(searchGene);
            setIsInitialLoad(false);
        }
    }, [searchGene, launchSearch, isInitialLoad]);

    // Manejador para cambio de valor en ejemplos
    const handleExampleClick = (value: string) => {
        setSearchGeneValue(value);
        // No lanzar búsqueda automáticamente, dejar que el usuario haga clic en el botón
    };

    return (
        <>
            <div className="max-w-lg mx-auto px-4 gap-20">
                <label className="block mt-5 mb-2 text-m text-black font-bold">
                    Gene name*
                </label>
                <input
                    data-cy="search-gene-input"
                    type="text"
                    id="searchGeneValue"
                    name="geneToSearch"
                    value={searchGeneValue ? searchGeneValue : ""}
                    onChange={(e) => setSearchGeneValue(e.target.value)}
                    required
                    className="bg-gray-50 border-2 border-gray-400
                    text-gray-900 text-md rounded-lg focus:ring-black-500
                    focus:border-black-500 block w-full p-2.5"
                    placeholder="TP63"
                />

                <p className="my-4 text-md text-black ">
                    <b>
                        <u>Examples:</u>
                    </b>{" "}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleExampleClick("fam169b");
                        }}
                        className="font-medium text-black hover:underline"
                    >
                        fam169b
                    </a>
                    ,{" "}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleExampleClick("pop4");
                        }}
                        className="font-medium text-black hover:underline"
                    >
                        pop4
                    </a>
                </p>

                <button
                    data-cy="confirm-search-button"
                    type="button"
                    className="py-2 px-4 text-md text-gray-900 rounded bg-green-200 backdrop-opacity-60 hover:bg-green-400 hover:backdrop-opacity-60 border-2 hover:border-solid border-gray-400 hover:border-gray-700"
                    onClick={() => launchSearch(searchGeneValue)}
                >
                    Search
                </button>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <LoadingSpinner1 />
                </div>
            ) : (
                <SearchResultDisplay
                    errorText={errorText}
                    geneData={geneData}
                />
            )}
        </>
    );
}

function SearchResultDisplay(params: { errorText: string; geneData: any[] }) {
    return (
        <div>
            {params.errorText ? (
                <div className="flex justify-center items-center">
                    <ErrorMessageWindow
                        errorTitle={params.errorText}
                        errorMessage=""
                    />
                </div>
            ) : params.geneData && params.geneData.length > 0 ? (
                <div className="">
                    <GenesDatatable geneData={params.geneData} />
                </div>
            ) : null}
        </div>
    );
}