"use client";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { PhylomeDTO } from "../../../_models/phylomes/phylomes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../globals.css";
import { exportToPDF } from "./gridExporter";
import ButtonWithClientCallback from "../../../components/button/button";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

export default function PhylomesDatatable({
    phylomeData,
}: {
    phylomeData: PhylomeDTO[];
}) {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, _setRowData] = useState<PhylomeDTO[]>(phylomeData);

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

    const DownloadTreesComponent = (params: any) => {
        return (
            <a
                href={`/phylome-downloads/phylomes/${params.value}/trees`}
                className="flex justify-center items-center h-full"
            >
                <button
                    className="flex gap-4 items-center justify-center"
                    data-cy="download-trees-button"
                    value={params.value}
                >
                    <img
                        src="/icons/download-cloud-icon.webp"
                        alt="Download Icon"
                        className="h-7 m-1"
                    />
                </button>
            </a>
        );
    };

    const DownloadAlignmentsComponent = (params: any) => {
        return (
            <a
                href={`/phylome-downloads/phylomes/${params.value}/alignments`}
                className="flex justify-center items-center h-full"
            >
                <div
                    className="flex gap-4 items-center justify-center"
                    data-cy="download-alignments-button"
                    custom-value={params.value}
                >
                    <img
                        src="/icons/download-cloud-icon.webp"
                        alt="Download Icon"
                        className="h-7 m-1"
                    />
                </div>
            </a>
        );
    };

    const DownloadOrthologsComponent = (params: any) => {
        return (
            <a
                target="_blank"
                href={`/phylomes/${params.value}/orthologs`}
                className="flex justify-center items-center h-full"
                data-cy="download-orthologs-button"
                custom-value={params.value}
            >
                <div className="flex gap-4 items-center justify-center">
                    <img
                        src="/icons/download-cloud-icon.webp"
                        alt="Download Icon"
                        className="h-7 m-1"
                    />
                </div>
            </a>
        );
    };

    const SmallTextComponent = (params: any) => {
        return (
            <div className="flex md:p-1 lg:p-3 justify-center items-center text-xs ">
                {params.value}
            </div>
        );
    };

    const SeedSpeciesTextComponent = (params: any) => {
        return (
            <a
                data-cy="seed-species-button"
                custom-value={params.data.species_taxid}
                href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${params.data.species_taxid}`}
                className="flex flex-col justify-center items-center h-full w-full text-green-900 rounded underline underline-offset-3 italic
    border-solid hover:border-slate-700 hover:text-blue-500 "
                target="_blank"
                rel="noopener noreferrer"
            >
                {params.value}
            </a>
        );
    };

    const PubMedComponent = (params: any) => {
        if (["NULL", "null", ""].includes(params.value) || !params.value) {
            return (
                <div
                    className="flex justify-center"
                    data-cy="pubmed-button"
                    custom-value={"null"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 10 32 25"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-8 h-8"
                    >
                        <text
                            x="15"
                            y="28"
                            textAnchor="middle"
                            fontSize="15"
                            fontWeight="light"
                            fill="currentColor"
                        >
                            N/A
                        </text>
                    </svg>
                </div>
            );
        }

        return (
            <a
                data-cy="pubmed-button"
                custom-value={params.value}
                href={`https://${params.value}`}
                className="flex flex-col justify-center items-center h-full w-full text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60
                           border-2 border-slate-400 border-solid hover:border-slate-700 px-1"
            >
                <button className="flex gap-4 items-center justify-center w-full ">
                    <img
                        src="/logos/pubmed.webp"
                        alt="PubMed Logo"
                        className="h-6 m-1 w-16"
                    />
                </button>
            </a>
        );
    };

    const IdButtonComponent = (params: any) => {
        return (
            <a
                href={`/phylomes/${params.value}/description`}
                className="flex flex-col justify-center items-center h-full text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white  hover:backdrop-opacity-60 border-2 border-slate-400
    border-solid m-1 hover:border-slate-700"
            >
                <button
                    className="flex gap-4 items-center justify-center h-12 w-12"
                    data-cy="phyid-button"
                    custom-value={params.value}
                >
                    <i className="text-green-900">
                        <u>{params.value}</u>
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
        cellClass: "flex justify-center items-center h-full content-center",
        valueFormatter: (params: any) => decodeURIComponent(params.value),
        cellDataType: false,
    };

    const [columnDefs, _setColumnDefs] = useState<any>([
        {
            headerName: "PhyID",
            field: "phylome_id",
            minWidth: 80,
            maxWidth: 80,
            cellRenderer: IdButtonComponent,
            cellStyle: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            },
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Name",
            field: "name",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            minWidth: 160,
            flex: 2,
        },
        {
            headerName: "Seed species",
            minWidth: 290,
            field: "species_name",
            ...defaultColumnSettings,
            cellRenderer: SeedSpeciesTextComponent,
            flex: 1,
        },
        {
            headerName: "Pubmed",
            field: "pubmed_link",
            minWidth: 110,
            cellRenderer: PubMedComponent,
            filter: false,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Trees",
            field: "phylome_id",
            width: 90,
            cellRenderer: DownloadTreesComponent,
            filter: false,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Alignments",
            field: "phylome_id",
            minWidth: 110,
            cellRenderer: DownloadAlignmentsComponent,
            filter: false,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Orthologs",
            field: "phylome_id",
            minWidth: 110,
            maxWidth: 110,
            cellRenderer: DownloadOrthologsComponent,
            filter: false,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Description",
            field: "description",
            minWidth: 115,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 3,
        },
        {
            headerName: "Created",
            field: "timestamp",
            minWidth: 120,
            maxWidth: 130,

            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
        },
    ]);

    useEffect(() => {
        // font size changing - depends on the screen size
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
                        "display:  ",
                        "none;",
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
            <div className="flex flex-col mb-3 w-full bg-white bg-opacity-20 ">
                <div className=" px-5 md:px-10 lg:px-20  ">
                    <div className="py-1 bg-white bg-opacity-75 rounded-lg mt-5">
                        <div className="py-3 md:pl-10 lg:pl-12 sm:flex-row justify-center items-center pl-6">
                            <h1 className="text-2xl  font-semibold underline decoration-solid">
                                Currently Available Phylomes
                            </h1>
                            <p>
                                <i>
                                    * Click on the "<b>PhyId</b>" to visit the
                                    Phylome.
                                </i>
                            </p>
                        </div>

                        <div className="py-1 pl-5 md:pl-10 lg:pl-12 ">
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
