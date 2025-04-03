"use client";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { CsvExportModule } from "@ag-grid-community/csv-export";

import ButtonWithClientCallback from "@/components/button/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportToPDF } from "../../../_components/gridExporter";
import { Proteome } from "../_models/proteomes";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

export default function ProteomesTable({
    proteomesData,
}: {
    proteomesData: Proteome[];
}) {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState(proteomesData);
    const defaultColDef = useMemo(() => {
        return {
            filter: "agTextColumnFilter",
            floatingFilter: true,
            autoHeight: true,
            wrapText: true,
            alignment: "center",
            minWidth: 70,
            filterParams: { buttons: ["clear", "apply"] },
        };
    }, []);

    const defaultColumnSettings = {
        suppressSizeToFit: true,
        filter: true,
        floatingFilter: true,
        flex: 1,
        cellClass: "flex justify-center items-center",
        cellStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        valueFormatter: (params: any) => decodeURIComponent(params.value),
        cellDataType: false,
    };
    const SmallTextComponent = (params: any) => {
        return (
            <div className="flex md:p-1 lg:p-3 justify-center items-center text-xs ">
                {params.value}
            </div>
        );
    };
    const IdButtonComponent = (params: any) => {
        return (
            <a
                data-cy="genomeId-button"
                custom-value={params.value}
                href={`/ete-smartview/proteomes/${params.value}`}
                className="flex flex-row justify-center items-center h-full text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white  hover:backdrop-opacity-60 border-2 border-slate-400
    border-solid m-1 hover:border-slate-700"
            >
                <button className="flex gap-4 items-center justify-center h-12 w-16">
                    <i className="text-green-900">
                        <u>{params.value}</u>
                    </i>
                </button>
            </a>
        );
    };

    const [columnDefs, setColumnDefs] = useState<any>([
        {
            headerName: "Genome ID",
            field: "genomeId",
            minWidth: 120,
            cellRenderer: IdButtonComponent,
            cellStyle: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            },
        },

        {
            headerName: "Taxonomy ID",
            field: "speciesTaxid",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            minWidth: 120,
            cellClass: "flex justify-center items-center",
        },
        {
            headerName: "Species Name",
            field: "speciesName",
            minWidth: 130,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 2,
        },
        {
            headerName: "External Genome ID",
            minWidth: 170,
            field: "externalGenomeId",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 2,
        },
        {
            headerName: "Source",
            minWidth: 80,
            field: "genomeSource",
            ...defaultColumnSettings,

            cellRenderer: SmallTextComponent,
            flex: 1,
        },
        {
            headerName: "Genome Version",
            field: "genomeVersion",
            minWidth: 150,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
        },

        {
            headerName: "Date",
            field: "genomeTimestamp",
            ...defaultColumnSettings,
            minWidth: 110,
            maxWidth: 130,
            cellRenderer: SmallTextComponent,
        },
        {
            headerName: "Isoform Count",
            field: "isoformCount",
            minWidth: 140,
            ...defaultColumnSettings,

            cellRenderer: SmallTextComponent,
            flex: 1,
        },
        {
            headerName: "Longest Isoforms Count",
            field: "longestIsoformCount",
            ...defaultColumnSettings,
            minWidth: 200,
            cellRenderer: SmallTextComponent,
            flex: 1,
        },
    ]);

    const onBtnExport = useCallback(() => {
        const params = {
            fileName: "phylomes.csv",
        };
        gridRef.current!.api.exportDataAsCsv(params);
    }, []);

    const onBtnExportPDF = useCallback(() => {
        if (!gridRef.current) return;
        exportToPDF(gridRef.current);
    }, []);

    useEffect(() => {
        const handleFontSize = () => {
            if (window.innerWidth <= 640) {
                const cells = document.querySelectorAll(".ag-theme-quartz");
                cells.forEach((cell) => {
                    (cell as HTMLElement).style.setProperty(
                        "--ag-font-size",
                        "0.8rem",
                    );
                });
            } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
                const cells = document.querySelectorAll(".ag-theme-quartz");
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
        <div className="overflow-x-scroll bg-white bg-opacity-50 rounded-xl">
            <div className="flex flex-col my-3 w-full ">
                <div className=" px-5 md:px-10 lg:px-20 backdrop-blur-lg">
                    <div className="py-1">
                        <div className="  py-3   sm:flex-row justify-center items-center">
                            <h1 className="text-xl font-semibold  decoration-solid">
                                Proteomes used in this phylome{" "}
                                <u>{proteomesData[0]?.phylomeId}</u>
                            </h1>
                            <p>
                                <i>
                                    * To download the proteome, click on the
                                    correponding <b>Genome ID</b> cell.
                                </i>
                            </p>
                        </div>

                        <div className="py-1  ">
                            <ButtonWithClientCallback
                                buttonID="exportButton"
                                onClickCallBack={onBtnExport}
                                buttonText="Download CSV"
                            ></ButtonWithClientCallback>
                            <ButtonWithClientCallback
                                buttonID="pdfExportButton"
                                onClickCallBack={onBtnExportPDF}
                                buttonText="Download PDF"
                            ></ButtonWithClientCallback>
                        </div>
                    </div>
                </div>

                <div className="ag-theme-quartz h-fit w-auto lg:w-full py-4 px-5 md:px-10 lg:px-20">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 20, 50]}
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
        </div>
    );
}
