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
import { exportToPDF } from "./gridExporter";
import ButtonWithClientCallback from "@/components/button/button";
import Link from "next/link";
import { CustomCellRendererProps } from "@ag-grid-community/react";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

export default function NewsDataTable({ data }: { data: any[] }) {
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState(data);

    //pagination settings
    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50];

    //default cells settings
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

    //CSV export from the documentation example
    const gridRef = useRef<AgGridReact>(null);

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

    const SmallTextComponent = (params: any) => {
        return (
            <div className="flex md:p-1 lg:p-3 justify-center items-center text-xs ">
                {params.value}
            </div>
        );
    };

    const JobIDCell = (params: { jobID: number }) => {
        return (
            <Link
                data-cy="newsid-button"
                title="Click here to open the results of this analyses."
                className={`text-blue-900 py-2 px-4 border-2 border-slate-300 bg-black bg-opacity-20 rounded shadow-xl`}
                href={`/news/get/${params.jobID}`}
            >
                {params.jobID}
            </Link>
        );
    };

    // Column Definitions: Defines the columns to be displayed.
    const [columnDefs, setColumnDefs] = useState<any>([
        {
            headerName: "NewsId",
            field: "id",
            maxWidth: 100,
            filter: "agNumberColumnFilter",
            cellRenderer: function (cellRenderParams: CustomCellRendererProps) {
                return <JobIDCell jobID={cellRenderParams.value} />;
            },
        },
        {
            headerName: "Title",
            field: "title",
            filter: true,
            floatingFilter: true,
        },
        {
            headerName: "Description",
            field: "description",
            filter: true,
            floatingFilter: true,
        },
        {
            headerName: "Timestamp",
            field: "timestamp",
            maxWidth: 170,
            filter: "agDateColumnFilter",
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
                    <div className="py-1 bg-white bg-opacity-75">
                        <div className="  py-3  pl-5 md:pl-10 lg:pl-20 sm:flex-row justify-center items-center">
                            <h1 className="text-2xl font-semibold underline decoration-solid">
                                NEWS
                            </h1>
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
                        pagination={pagination}
                        paginationPageSize={paginationPageSize}
                        paginationPageSizeSelector={paginationPageSizeSelector}
                        defaultColDef={defaultColDef}
                        rowSelection="multiple"
                        suppressRowClickSelection={true}
                        onGridReady={(params) => params.api.sizeColumnsToFit()}
                        domLayout="autoHeight"
                    />
                </div>
            </div>
        </>
    );
}
