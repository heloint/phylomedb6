"use client";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { Gene } from "@/app/api/search/gene/[geneSearchValue]/_models/genes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/app/globals.css";

import { exportToPDF } from "@/app/phylomes/_components/gridExporter";

import ButtonWithClientCallback from "@/components/button/button";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

export default function GenesDatatable({ geneData }: { geneData: Gene[] }) {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Gene[]>(geneData);
    useEffect(() => setRowData(geneData), [geneData]);

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
            fileName: "genes.csv",
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
        return (
            <a
                data-cy="geneId-button"
                custom-value={params.value}
                target="_blank"
                href={`/genes/${params.value}`}
                className="flex flex-col justify-center items-center h-full text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white  hover:backdrop-opacity-60 border-2 border-slate-400
                           border-solid m-1 hover:border-slate-700"
            >
                <button className="flex gap-4 items-center justify-center h-10 w-full p-2">
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
        cellClass: "flex justify-start items-center content-center",
        cellDataType: false,
        valueFormatter: (params: any) => decodeURIComponent(params.value),
    };

    const [columnDefs, setColumnDefs] = useState<any>([
        {
            headerName: "Gene Id",
            field: "gene_id",
            ...defaultColumnSettings,
            cellRenderer: IdButtonComponent,
            minWidth: 120,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "External Gene Id",
            field: "external_gene_id",
            minWidth: 150,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Contig Id",
            field: "contig_id",
            minWidth: 130,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Name",
            field: "gene_name",
            minWidth: 110,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 2,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Genome ID",
            field: "genome_id",
            minWidth: 130,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
        },

        {
            headerName: "Source",
            field: "source",
            minWidth: 80,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 1,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "Start",
            field: "start",
            minWidth: 80,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 1,
            cellClass: "flex justify-center items-center content-center",
        },
        {
            headerName: "End",
            field: "end",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 1,
            cellClass: "flex justify-center items-center content-center",
        },

        {
            headerName: "Strand",
            field: "strand",
            minWidth: 80,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 1,
            cellClass: "flex justify-center items-center content-center",
        },

        {
            headerName: "Created",
            field: "timestamp",
            minWidth: 120,
            maxWidth: 130,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass: "flex justify-center items-center content-center",
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
            <div className="flex flex-col my-3 w-full ">
                <div className=" px-5 md:px-10 lg:px-20">
                    <div className="py-1 bg-white bg-opacity-75 rounded-lg">
                        <div className="  py-3  pl-5 md:pl-10 lg:pl-20 sm:flex-row justify-center items-center">
                            <h1
                                className="text-2xl font-semibold underline decoration-solid"
                                data-cy="header-genes-table"
                            >
                                Genes
                            </h1>
                            <p>* Click on the "Gene ID" to visit the Gene.</p>
                        </div>

                        <div className="py-1 pl-5 md:pl-10 lg:pl-20 ">
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
        </>
    );
}
