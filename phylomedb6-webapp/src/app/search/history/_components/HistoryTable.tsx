"use client";

import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { useEffect, useMemo, useRef, useState } from "react";
import "@/app/globals.css";
import { HistoryOption } from "../../../../_models/history/history";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function HistoryDataTable({
    historyData,
}: {
    historyData: HistoryOption[];
}) {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<HistoryOption[]>(historyData);
    useEffect(() => setRowData(historyData), [historyData]);

    const defaultColDef = useMemo(
        () => ({
            floatingFilter: true,
            autoHeight: true,
            wrapText: true,
            alignment: "end",
            minWidth: 1,
            filterParams: { buttons: ["clear", "apply"] },
        }),
        [],
    );

    const SmallTextComponent = (params: any) => {
        const isTextLong = params.value && params.value.length > 25;
        return (
            <div className="flex md:p-1 lg:p-3 justify-center items-center text-xs ">
                <p
                    className={`${
                        isTextLong
                            ? "text-ellipsis overflow-hidden whitespace-nowrap"
                            : ""
                    }`}
                >
                    {params.value}
                </p>
            </div>
        );
    };

    const SelectComponent = () => {
        const [selectedOption, setSelectedOption] = useState("del");

        const handleSelectChange = (event: any) => {
            setSelectedOption(event.target.value);
        };

        const handleButtonClick = async () => {
            if (selectedOption !== "del") {
                alert("Select valid option!");
                return;
            }

            let rows = getSelectedRows();
            if (!rows || (rows && rows.length < 1)) {
                alert("No rows selected!");
                return;
            }

            for (let row of rows) {
                const response = await fetch(
                    `/api/search/history/${row["search_id"]}`,
                    {
                        method: "DELETE",
                    },
                );
                await response.json();
            }
            location.reload();
        };

        return (
            <div className="flex items-center gap-2 w-64">
                <select
                    data-cy="select-action-history"
                    name="menu_opt"
                    id="optmn"
                    value={selectedOption}
                    onChange={handleSelectChange}
                    className="block w-full px-4 py-2 mb-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="del">Delete</option>
                </select>
                <button
                    data-cy="confirm-action-button"
                    onClick={handleButtonClick}
                    className="px-4 py-2 mb-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Confirm
                </button>
            </div>
        );
    };

    const GoButtonComponent = (params: {
        data: HistoryOption;
        value: string;
    }) => {
        const router = useRouter();

        if (params.data["search_type"] == "gene") {
            return (
                <a
                    target="_blank"
                    href={`/search/gene?gene=${params.value}&history=true`}
                    className="flex flex-col justify-center items-center h-full text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white  hover:backdrop-opacity-60 border-2 border-slate-400
                               border-solid m-1 hover:border-slate-700  "
                >
                    <button className="flex gap-4 items-center justify-center h-10 w-10 p-2">
                        <i className="text-blue-900">
                            <u className="text-lg no-underline">{"→"}</u>
                        </i>
                    </button>
                </a>
            );
        } else if (params.data["search_type"] == "sequence") {
            const handleClick = () => {
                if (!params.value) {
                    return;
                }
                localStorage.setItem("query_sequence", params.value);
                localStorage.setItem("history", "true");
                router.push(`/search/sequence`);
            };

            return (
                <div
                    onClick={handleClick}
                    className="flex flex-col justify-center items-center h-full text-gray-900 rounded bg-gray-200 backdrop-opacity-60 hover:bg-white hover:backdrop-opacity-60 border-2 border-slate-400
                               border-solid m-1 hover:border-slate-700 cursor-pointer content-center"
                >
                    <button className="flex gap-4 items-center justify-center h-10 w-10 p-2">
                        <i className="text-blue-900">
                            <u className="text-lg no-underline">{"→"}</u>
                        </i>
                    </button>
                </div>
            );
        }
    };

    const defaultColumnSettings = {
        suppressSizeToFit: true,
        filter: false,
        floatingFilter: true,
        flex: 1,
        cellClass: "flex justify-start items-center content-center",
        cellDataType: false,
        valueFormatter: (params: any) => decodeURIComponent(params.value),
    };

    const [columnDefs] = useState<any>([
        {
            headerName: "Search id",
            field: "search_id",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass:
                "flex justify-center items-center text-ellipsis  content-center overflow-hidden ...",
            minWidth: 100,
            maxWidth: 100,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Search type",
            field: "search_type",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass:
                "flex justify-center items-center  content-center text-ellipsis overflow-hidden ...",
            minWidth: 120,
            maxWidth: 120,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Input",
            field: "input_data",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            cellClass:
                "flex justify-center items-center content-center text-ellipsis overflow-hidden ...",
            minWidth: 180,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Search date",
            field: "timestamp",
            ...defaultColumnSettings,
            cellRenderer: SmallTextComponent,
            minWidth: 115,
            maxWidth: 140,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Go",
            field: "input_data",
            ...defaultColumnSettings,
            cellRenderer: GoButtonComponent,
            maxWidth: 80,
            minWidth: 80,
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

    const rowSelection: any = useMemo(
        () => ({
            mode: "multiRow",
            selectAll: "filtered",
            enableClickSelection: true,
        }),
        [],
    );

    const selectionColumnDef = useMemo(() => {
        return {
            sortable: true,
            cellClass: "flex justify-center items-center content-center",
            maxWidth: 35,
        };
    }, []);

    const getSelectedRows = (): HistoryOption[] | undefined => {
        const selectedNodes = gridRef.current?.api.getSelectedNodes();
        const selectedData = selectedNodes?.map((node) => node.data);
        return selectedData;
    };

    return (
        <>
            <div className="flex flex-col my-3 w-full">
                <div className="px-5 md:px-10 lg:px-20">
                    <div className="py-1 bg-white bg-opacity-75 rounded-lg border-2 border-gray-400 ">
                        <div className="py-3  md:pl-3 lg:pl-3 sm:flex-row justify-center items-center">
                            <h2 className="text-2xl font-semibold underline decoration-solid p-4">
                                Latests searches
                            </h2>
                        </div>
                    </div>
                </div>

                <div
                    className="ag-theme-quartz h-fit w-auto lg:w-full py-4 px-5 md:px-10 lg:px-20"
                    data-cy="table-div-history"
                >
                    <SelectComponent />
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        defaultColDef={defaultColDef}
                        suppressRowClickSelection={true}
                        enableCellTextSelection={true}
                        ensureDomOrder={true}
                        onGridReady={(params) => params.api.sizeColumnsToFit()}
                        domLayout="autoHeight"
                        rowSelection={rowSelection}
                        selectionColumnDef={selectionColumnDef}
                    />
                </div>
            </div>
        </>
    );
}
