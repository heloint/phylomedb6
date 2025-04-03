"use client";

import "@/app/globals.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { CsvExportModule } from "@ag-grid-community/csv-export";

import ButtonWithClientCallback from "@/components/button/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportToPDF } from "../../../_components/gridExporter";
import { GeneTreesData } from "../_models/geneTrees";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

export default function GeneTreesTable({
    phylomeId,
    tableData,
}: {
    phylomeId: string | number;
    tableData: GeneTreesData[];
}) {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState(tableData);

    const defaultColumnSettings = {
        suppressSizeToFit: true,
        filter: true,
        floatingFilter: true,
        flex: 1,
        cellStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px",
        },
        cellClass: "flex justify-start items-center ",
        valueFormatter: (params: any) => decodeURIComponent(params.value),
    };

    const SmallTextComponent = (params: any) => {
        return (
            <div className="flex md:p-1 lg:p-3 justify-center items-center text-xs ">
                {params.value}
            </div>
        );
    };

    const [columnDefs, setColumnDefs] = useState<any>([
        {
            headerName: "Tree ID",
            field: "tree_id",
            minWidth: 80,
            maxWidth: 100,
            cellStyle: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
            },
            floatingFilter: true,
            cellRenderer: TreeIdCellRenderer,
        },

        {
            headerName: "Tree",
            field: "tree_id",
            minWidth: 110,
            filter: false,
            maxWidth: 102,
            cellStyle: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
            },
            cellRenderer: TreeCellRenderer,
        },

        {
            headerName: "Alignment",
            field: "tree_id",
            minWidth: 110,
            filter: false,
            maxWidth: 102,
            cellStyle: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
            },
            cellRenderer: AlignmentCellRenderer,
        },
        {
            headerName: "Seed Species Name",
            minWidth: 175,
            field: "name",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
        },
        {
            headerName: "Seed Taxonomy ID",
            minWidth: 155,
            field: "taxid",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
        },
        {
            headerName: "Gene Name",
            minWidth: 110,
            field: "gene_name",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
        },
        {
            headerName: "External Gene ID",
            minWidth: 155,
            field: "external_gene_id",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
        },
        {
            headerName: "Protein Description",
            minWidth: 170,
            field: "protein_description",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            flex: 3,
        },

        {
            headerName: "External Protein ID",
            field: "external_protein_id",
            minWidth: 165,
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
        },

        {
            headerName: "Source",
            minWidth: 80,
            field: "source",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
        },
    ]);

    const onBtnExport = useCallback(() => {
        gridRef.current!.api.exportDataAsCsv({
            fileName: "phylomes.csv",
        });
    }, []);

    const onBtnExportPDF = useCallback(() => {
        if (!gridRef.current) return;
        exportToPDF(gridRef.current);
    }, []);

    return (
        <div className="overflow-x-scroll bg-white bg-opacity-50 rounded-xl">
            <div className="flex flex-col my-3 w-full">
                <div className=" px-5 md:px-10 lg:px-20 w-full backdrop-blur-lg">
                    <h1 className="px-1 text-2xl">
                        Phylome <u>{phylomeId}</u>
                    </h1>
                    <p>
                        <i>
                            * Click on the "<b>Tree</b>" icon to explore the
                            tree interactively.
                        </i>
                    </p>
                    <p>
                        <i>
                            * Click on the "<b>Alignment</b>" icon to visualize
                            the "raw" or "clean" version of the alignment.
                        </i>
                    </p>
                    <div className="py-3">
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

                <div className="ag-theme-quartz h-fit w-auto lg:w-full py-4 px-5 md:px-10 lg:px-20">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 20, 50]}
                        defaultColDef={useMemo(() => {
                            return {
                                filter: "agTextColumnFilter",
                                floatingFilter: true,
                                autoHeight: true,
                                wrapText: true,
                                alignment: "center",
                                minWidth: 70,
                                filterParams: { buttons: ["clear", "apply"] },
                            };
                        }, [])}
                        rowSelection="multiple"
                        suppressRowClickSelection={true}
                        onGridReady={(params) => params.api.sizeColumnsToFit()}
                        domLayout="autoHeight"
                        enableCellTextSelection={true}
                    />
                </div>
            </div>
        </div>
    );
}

const AlignmentCellRenderer = (params: any) => (
    <div
        className={`flex flex-col justify-center items-center h-14
                            text-gray-900 rounded bg-gray-200
                            backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60
                            border-2 border-slate-400 hover:border-solid
                            hover:border-slate-700 p-1 w-[4rem]`}
    >
        <a
            data-cy="alignment-button"
            className="w-[2rem] h-[1rem]"
            target="_blank"
            href={`/phylo-view/alignment/${params.value}/clean`}
        >
            <img
                className="w-full h-full"
                src="/icons/alignment-icon.webp"
                alt="alignment icon"
            />
        </a>
    </div>
);

const TreeCellRenderer = (params: any) => (
    <div
        className={`flex flex-col justify-center items-center h-14
                            text-gray-900 rounded bg-gray-200
                            backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60
                            border-2 border-slate-400 hover:border-solid
                            hover:border-slate-700 p-1 w-[4rem]`}
    >
        <a
            data-cy="tree-button"
            className="w-[2rem] h-[2rem]"
            target="_blank"
            href={`/phylo-view/tree/${params.value}`}
        >
            <img
                className="w-full h-full"
                src="/icons/phylo-tree-icon.webp"
                alt="phylo tree icon"
            />
        </a>
    </div>
);

const TreeIdCellRenderer = (params: any) => (
    <div
        className={`flex flex-col justify-center h-14 w-14
                            text-gray-900 rounded bg-gray-200
                            backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60
                            border-2 border-slate-400 hover:border-solid
                            hover:border-slate-700`}
    >
        <a
            data-cy="treeId-button"
            custom-value={params}
            className="text-center"
            target="_blank"
            href={`/phylo-view/tree/${params.value}`}
        >
            <button>
                <i className="text-green-900">
                    <u>{params.value}</u>
                </i>
            </button>
        </a>
    </div>
);
