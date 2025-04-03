"use client";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/app/globals.css";

import { exportToPDF } from "@/app/phylomes/_components/gridExporter";
import ButtonWithClientCallback from "@/components/button/button";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

export type Sequence = {
    protein_id: number;
    external_protein_id: string;
    external_genome_id: string;
    taxonomy_id: number;
    species_name: string;
    description: string | null;
    similarity_percentage: number;
    e_value: string;
    bitscore: number;
};

export default function SequenceDatatable({
    sequenceData,
}: {
    sequenceData: Sequence[];
}) {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Sequence[]>(sequenceData);
    useEffect(() => setRowData(sequenceData), [sequenceData]);

    const defaultColDef = useMemo(
        () => ({
            filter: "agTextColumnFilter",
            floatingFilter: true,
            autoHeight: true,
            wrapText: true,
            alignment: "center",
            minWidth: 70,
            filterParams: { buttons: ["clear", "apply"] },
        }),
        [],
    );

    const onBtnExport = useCallback(() => {
        const params = {
            fileName: "sequences.csv",
        };
        gridRef.current!.api.exportDataAsCsv(params);
    }, []);

    const onBtnExportPDF = useCallback(() => {
        if (!gridRef.current) return;
        exportToPDF(gridRef.current);
    }, []);

    const SmallTextComponent = (params: any) => {
        return (
            <div className="flex md:p-1 lg:p-3 justify-center items-center text-xs ">
                {params.value}
            </div>
        );
    };

    const IdButtonComponent = (params: any) => {
        console.log("==> ", params);
        return (
            <a
                data-cy="protein-id-button"
                custom-value={params.value}
                target="_blank"
                href={`/proteins/${params.value}`}
                className="flex flex-col justify-center items-center h-full text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white  hover:backdrop-opacity-60 border-2 border-slate-400
                           border-solid m-1 hover:border-slate-700"
            >
                <button className="flex gap-4 items-center justify-center h-10 w-full p-2">
                    <i className="text-green-900">
                        <u>{params.data.external_protein_id}</u>
                    </i>
                </button>
            </a>
        );
    };

    const defaultColumnSettings = {
        suppressSizeToFit: true,
        filter: true,
        floatingFilter: true,
        flex: 1,
        cellClass: "flex justify-start items-center content-center",
        cellDataType: false,
        valueFormatter: (params: any) => decodeURIComponent(params.value),
    };

    const [columnDefs] = useState<any>([
        {
            headerName: "Protein ID",
            field: "protein_id",
            ...defaultColumnSettings,
            cellRenderer: IdButtonComponent,
            cellClass: "flex justify-center items-center content-center",
            minWidth: 200,
        },
        {
            headerName: "Genome ID",
            field: "external_genome_id",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
            minWidth: 120,
        },
        {
            headerName: "Taxonomy ID",
            field: "taxonomy_id",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
            minWidth: 120,
        },
        {
            headerName: "Species Name",
            field: "species_name",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
            minWidth: 150,
        },
        {
            headerName: "Description",
            field: "description",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 2,
            cellClass: "flex justify-center items-center content-center",
            minWidth: 150,
        },
        {
            headerName: "Similarity Percentage",
            field: "similarity_percentage",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
            minWidth: 180,
        },
        {
            headerName: "E-value",
            field: "e_value",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
            minWidth: 180,
        },
        {
            headerName: "Bitscore",
            field: "bitscore",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
            minWidth: 180,
        },
    ]);

    useEffect(() => {
        const handleFontSize = () => {
            const cells = document.querySelectorAll(".ag-theme-quartz");
            if (window.innerWidth <= 640) {
                cells.forEach((cell) => {
                    (cell as HTMLElement).style.setProperty(
                        "--ag-font-size",
                        "0.8rem",
                    );
                });
            } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
                cells.forEach((cell) => {
                    (cell as HTMLElement).style.setProperty(
                        "--ag-font-size",
                        "0.9rem",
                    );
                });
            }
        };

        window.addEventListener("resize", handleFontSize);
        handleFontSize();

        return () => {
            window.removeEventListener("resize", handleFontSize);
        };
    }, []);

    return (
        <>
            <div className="flex flex-col my-3 w-full">
                <div className="px-5 md:px-10 lg:px-20">
                    <div className="py-1 bg-white bg-opacity-75">
                        <div className="py-3 pl-5 md:pl-10 lg:pl-20 sm:flex-row justify-center items-center">
                            <h1 className="text-2xl font-semibold underline decoration-solid">
                                Found proteins
                            </h1>
                        </div>

                        <div className="py-1 pl-5 md:pl-10 lg:pl-20 ">
                            <ButtonWithClientCallback
                                buttonID="exportButton"
                                onClickCallBack={onBtnExport}
                                buttonText="Download CSV"
                            />
                            <ButtonWithClientCallback
                                buttonID="pdfExportButton"
                                onClickCallBack={onBtnExportPDF}
                                buttonText="Download PDF"
                            />
                        </div>
                    </div>
                </div>

                <div
                    className="ag-theme-quartz h-fit w-auto lg:w-full py-4 px-5 md:px-10 lg:px-20"
                    data-cy="found-proteins-table-div"
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        defaultColDef={defaultColDef}
                        rowSelection="multiple"
                        suppressRowClickSelection={true}
                        enableCellTextSelection={true}
                        ensureDomOrder={true}
                        onGridReady={(params) => params.api.sizeColumnsToFit()}
                        domLayout="autoHeight"
                    />
                </div>
            </div>
        </>
    );
}
