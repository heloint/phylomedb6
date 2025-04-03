import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * This function iterates over all of the columns to create a row of header cells
 */
const getHeaderToExport = (gridApi) => {
    const a = gridApi.api;
    const columns = a.getAllDisplayedColumns();

    return columns.map((column) => {
        const { field } = column.getColDef();
        const sort = column.getSort();
        // Enables export when row grouping
        const headerName = column.getColDef().headerName ?? field;
        const headerNameUppercase =
            headerName[0].toUpperCase() + headerName.slice(1);
        const headerCell = {
            text: headerNameUppercase + (sort ? ` (${sort})` : ""),

            // styles
            bold: true,
            margin: [0, 12, 0, 0],
        };
        return headerCell;
    });
};

/**
 * This function iterates over all of the rows and columns to create
 * a matrix of cells when pivoting is enabled
 */

const getRowsToExportPivot = (gridApi) => {
    const columns = gridApi.api.getAllDisplayedColumns();

    const getCellToExport = (column, node) => ({
        text: gridApi.api.getValue(column, node) ?? "",
        // styles
        ...column.getColDef().cellStyle,
    });

    const rowsToExport = [];
    gridApi.forEachNodeAfterFilterAndSort((node) => {
        if (node.group) {
            const rowToExport = columns.map((column) =>
                getCellToExport(column, node),
            );
            rowsToExport.push(rowToExport);
        }
    });

    return rowsToExport;
};

/**
 * This function iterates over all of the rows and columns to create
 * a matrix of cells
 */
const getRowsToExport = (gridApi) => {
    //Enables export when pivoting
    /*   if (gridApi.api.isPivotMode()) {
      return getRowsToExportPivot(gridApi);
    } */
    const columns = gridApi.api.getAllDisplayedColumns();

    const getCellToExport = (column, node) => ({
        text: gridApi.api.getValue(column, node) ?? "",
        // styles
        ...column.getColDef().cellStyle,
    });

    const rowsToExport = [];
    gridApi.api.forEachNodeAfterFilterAndSort((node) => {
        const rowToExport = columns.map((column) =>
            getCellToExport(column, node),
        );
        rowsToExport.push(rowToExport);
    });

    return rowsToExport;
};

// Row colors
const HEADER_ROW_COLOR = "#f8f8f8";
const EVEN_ROW_COLOR = "#fcfcfc";
const ODD_ROW_COLOR = "#fff";

const PDF_INNER_BORDER_COLOR = "#dde2eb";
const PDF_OUTER_BORDER_COLOR = "#babfc7";

const createLayout = (numberOfHeaderRows) => ({
    fillColor: (rowIndex) => {
        if (rowIndex < numberOfHeaderRows) {
            return HEADER_ROW_COLOR;
        }
        return rowIndex % 2 === 0 ? EVEN_ROW_COLOR : ODD_ROW_COLOR;
    },
    //vLineHeight not used here.
    vLineWidth: (rowIndex, node) =>
        rowIndex === 0 || rowIndex === node.table.widths.length ? 1 : 0,
    hLineColor: (rowIndex, node) =>
        rowIndex === 0 || rowIndex === node.table.body.length
            ? PDF_OUTER_BORDER_COLOR
            : PDF_INNER_BORDER_COLOR,
    vLineColor: (rowIndex, node) =>
        rowIndex === 0 || rowIndex === node.table.widths.length
            ? PDF_OUTER_BORDER_COLOR
            : PDF_INNER_BORDER_COLOR,
});

/**
 * Returns a pdfMake shaped config for export, for more information
 * regarding pdfMake configuration, please see the pdfMake documentation.
 */
const getDocument = (gridApi) => {
    const columns = gridApi.api.getAllDisplayedColumns();
    const headerRow = getHeaderToExport(gridApi);
    const rows = getRowsToExport(gridApi);

    return {
        pageOrientation: "landscape", // can also be 'portrait'
        content: [
            {
                table: {
                    // the number of header rows
                    headerRows: 1,

                    // the width of each column, can be an array of widths
                    widths: `${100 / columns.length}%`,

                    // all the rows to display, including the header rows
                    body: [headerRow, ...rows],

                    // Header row is 40px, other rows are 15px
                    heights: (rowIndex) => (rowIndex === 0 ? 40 : 15),
                },
                layout: createLayout(1),
            },
        ],
        pageMargins: [10, 10, 10, 10],
    };
};

export const exportToPDF = (gridApi) => {
    const doc = getDocument(gridApi);

    pdfMake.createPdf(doc).download();
};
