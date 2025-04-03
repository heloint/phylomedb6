/* global d3 */
/* global heatmapButtons */
/* global heatmapFilterBar */
/* global */

// #########################################
// FILENAME: heatmap_builds.json
// AUTHOR:   Daniel Majer
// EMAIL:    majerdaniel93@gmail.com
// GITHUB:   heloint
//
// DESCRIPTION:
// This file contains all the explorer functions
// to build the dendrogram and the heatmap.
// #########################################

// Global color scale used for the heatmap coloring.
const hexColorScale = [
        '#caf38c', '#aded4b', '#92d133', '#71c430',
        '#68b12f', '#609e2e', '#568f29', '#457d18',
        '#3b7d07', '#295904'
];

// ##########################
// PANEL CREATION FUNCTIONS!
// ##########################

/* Count the number of panels needed to fetch from the "heatmapJSON".
 * @param heatmapJSON object Json received from the server
 *                           with all the data to create the "explorer"
 *                           (heatmap, dendrogram, tabs, etc..)
 * @return int
 * */
async function countPanelsNeeded(heatmapJSON){
    // Counts the number of panels needed to create.
    //
    let panelCounter = 0;
    Object.keys(heatmapJSON).forEach((e) => {
        if (e.includes('matrix_')) {
            panelCounter++;
        }
    })
    return panelCounter;
}

/* Injects the main container for the heatmap panels.
 * @param className string The identifier of the parent element
 *                         to where we want to inject the container.
 * @return void
 * */
function injectPanelMainContainer(className){
    Array.from(document.querySelectorAll(className))
         .forEach((e) => {
            e.innerHTML += '<div class="heatmap-panels"> </div>';
    })
}

/* Injects the heatmap panel in empty state.
 * @param containerClass string The identifier of the parent element
         *                      to where we want to inject the container.
 * @param instanceNumber int How many panels are needed.
 * @return void
 * */
function injectEmptyHeatmapPanel(containerClass, instanceNumber){
    // Creates the empty DIVs for the panels
    const panelContainer = document.querySelector(containerClass);
    for(let i = 1; i <= instanceNumber; i++){
        panelContainer.innerHTML += `<div id="heatmap_${i}" class="heatmap-panel" width="100%" height="100%"></div>`;
    }
}

/* Leaves the first heatmap panel displayed, but hides the rest.
 * @return void
 * */
function showFirstPanel(){
    // "Resets all the heatmap panels. => Hides all of them."
    const allPanels = document.querySelectorAll('[id^="heatmap_"]');

    allPanels.forEach((panel) => {
        const panelNumber = panel.id[panel.id.length - 1];
        if (panelNumber > 1){
            panel.classList.add('hidden_heatmap');
        }
    })
}

/* Fetches / construct the view of the heatmapJSON in the empty heatmap panels.
 * @param panelCounter int The number of empty panels already created.
 * @param heatmapJSON object Json received from the server
 *                           with all the data to create the "explorer"
 *                           (heatmap, dendrogram, tabs, etc..)
 * @return void
 * */
function createHeatmapPanels(panelCounter, heatmapJSON){
    // Builds the heatmap panels.
    for(let i = 1; i <= panelCounter; i++){
        buildHeatmap(heatmapJSON, i);
    }
}

// ###########################################################################################
// HEATMAP FUNCTIONS WITH VANILLA JS AND D3.JS
// ###########################################################################################

/* Activates the color changing of the heatmap cells.
 * On click it highlights the entire row and the row label.
 * @return void
 * */
function activateChangeCellColor() {
    const cells = document.querySelectorAll("rect");
    cells.forEach(cell => {

        cell.addEventListener('click', () => {
            const cellTaxID = cell.attributes.taxid.value;

            // Change the cell highlighting first.
            Array.from(document.querySelectorAll(`.cell[taxid="${cellTaxID}"]`),
                (e) => {

                    if (e.style.stroke != 'rgb(76, 2, 110)') {
                        e.style.stroke = 'rgb(76, 2, 110)';
                        e.style.strokeWidth = '0.8px';
                    } else {
                        e.style.stroke = '';
                        e.style.strokeWidth = '';
                    }
                });

            // Change the row label's highlight, as well.
            const rowLabelWithTaxID = document.querySelector(`text[taxid="${cellTaxID}"]`);

            if (!rowLabelWithTaxID.classList.contains("highlighted")) {
                rowLabelWithTaxID.classList.add("highlighted");
                rowLabelWithTaxID.style.stroke = '#4c026e';
            } else {
                rowLabelWithTaxID.classList.remove("highlighted");
                rowLabelWithTaxID.style.stroke = '';
            }
        });
    })
}


/* Check the cell's percentage value, and gets the corresponding color
 * from the "hexColorScale" global variable.
 * @param dValue        int   The percentage value of the cell.
 * @param ratioStep     int   Grouping the percentages by each 10%.
 * @param hexColorScale array The array of the color scale.
 * @return string Hex value of the corresponding cell color.
 * */
function getCellColorByValue(dValue, hexColorScale){

    if (dValue === 100) {
        return "#000000";
    }

    const ratioStep = 1 / hexColorScale.length;
    const scaleIndex = Math.floor((dValue / 100) / ratioStep);
    return hexColorScale[scaleIndex];
}

/* This "function" contains ALL the D3.js declarations for the followings:
 *      - Heatmap
 *      - Column labels
 *      - Row labels
 *      - Dendrogram (Taxonomy tree)
 *      - Events of the listed elements above.
 *      - Some other sub-functions. (Yes, they are nested function declarations. :-( )
 *
 * @param data object The "heatmapJSON" retreived from the back-end. Contains the following fields:
 *                          - matrix_<i>        array<array<float>> Matrix percentage values.
 *                          - colJSON_<i>       array<string>       Column names. (Phylome names.)
 *                          - colIDJSON_<i>     array<int>          Column IDs. (Phylome IDs.)
 *                          - dendrogram_tree   object<object ~..>  Multi-dimensional nested object.
 *                                                                  Representing a hierarchical dendrogram.
 *                          - rowLabelJSON      array<string>       Row names. (Taxonomy names.)
 *                          - rowlabelIDJSON    array<int>          Row IDs. (Taxonomy IDs.)
 * @ elemID int The index number of the empty heatmap panel to fetched.
 * @return void
 * */
async function buildHeatmap(data, elemID) {

    // Makes the #sendButton element appear. Serves as the search trigger.
    document.querySelector("#sendButton").style.display = "initial";

    // The index number of the empty heatmap panel to fetched.
    const parent = `#heatmap_${elemID}`

    // ###########################################
    // GENERAL DECLARATIONS
    // (sizes, json values to variables, matrix array re-assigning (making sure about the correct format))
    // ###########################################
    let svg = d3.select(parent)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "150px")

    let clusterSpace = 150, // size of the cluster tree
        matrixData = eval(`data.matrix_${elemID}`),
        cellSize = 12,
        colNumber = matrixData[0].length,
        rowNumber = matrixData.length,
        // width = cellSize * colNumber + clusterSpace,
        height = cellSize * rowNumber + clusterSpace,

        rowCluster = d3.layout.cluster()
        .separation((a, b) => { return a.parent == b.parent ? 1 : 1; })
        .size([height - clusterSpace, clusterSpace*1.5]),

        rowNodes = rowCluster.nodes(data.dendrogram_tree),

        rowLabelID = data.rowLabelIDJSON,
        rowLabelName = data.rowLabelJSON,

        colLabelID =   eval(`data.colIDJSON_${elemID}`),
        colLabelName = eval(`data.colJSON_${elemID}`);

    let matrix = [], min = 0, max = 0;
    for (let r = 0; r < rowNumber; r++) {
        for (let c = 0; c < colNumber; c++) {
            matrix.push({row: r +1 , col: c + 1, value: matrixData[r][c]});
            min = Math.min(min, matrixData[r][c]);
            max = Math.max(max, matrixData[r][c]);
        }
    }

    // Set the sizes of the SVG canvas.
    svg.attr("width", "100%")
        .attr("height", height);

    // ###########################################
    // ROW LABELS
    // Set the row label's content / css / tooltip
    // ###########################################
    let node = svg.selectAll(".node")
        .data(rowNodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform",(d) => {
            return `translate(${(d.y + (13*cellSize))},${(d.x + (12 * 3.37))})`;
        })

        node.append("text")
        .attr("dx",(d) => { return d.children ? -8 : 8 })
        .attr("dy", 3)
        .attr("font-size", "9pt")
        .attr("font-family", "courier")
        .attr('cursor', 'context-menu')
        .attr('stroke', (d) => {

            let queriedTaxIDs = sessionStorage['queriedTaxIDs']
                                                .split(',')
                                                .map((e) => parseInt(e));

            if (queriedTaxIDs.includes(d.name[0])) { return '#050385'; }
            return '';

        })
        .attr('stroke-width', '0.8px')
        .attr("taxid", (d) => {
            if (d.name[0] != 'node'){
                return d.name[0];
            }})
        .style("text-anchor", "end")
        .text((d) => {
            if (d.name != 'node') {
                let taxaNameIndex = rowLabelID.indexOf(d.name[0]);
                let taxaName = rowLabelName[taxaNameIndex];

                let reducedName = taxaName.split(' ').slice(0,2).join(' ');
                return reducedName;
            }
        })
        // Click events for the highlighting
        // #############################################
        .on("click", function (d){
            const cells = document.querySelectorAll('.g3 rect');


            if (!d3.select(this).classed("highlighted")) {
                d3.select(this).classed("highlighted", true);

                cells.forEach((cell) => {
                    if (cell.attributes.taxid.value == d.name[0]){
                        cell.style.stroke = '#4c026e';
                        cell.style.strokeWidth = '0.8px';
                        d3.select(this).style('stroke', '#4c026e');
                    }
                })

            } else {
                d3.select(this).classed("highlighted", false);

                cells.forEach((cell) => {
                    if (cell.attributes.taxid.value == d.name[0]){
                        cell.style.stroke = '';
                        cell.style.strokeWidth = '';
                        d3.select(this).style('stroke', '');
                        d3.select(this).style('stroke-width', '');
                    }
                })
            }
        })

        // Mouseover events for the tooltip
        // #############################################
        .on("mouseover", (d) => {

            d3.select(this).classed("cell-hover", true);
            //Update the tooltip position and value
            d3.select("#d3tooltip")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY + 12) + "px")
                .select("#value")
                .html(() => {
                    const taxaName = rowLabelName[rowLabelID.indexOf(d.name[0])]

                    return 'Taxonomy ID: ' + d.name[0] + '<br>' +
                           'Species name: <i>' + taxaName + '</i><br><br>'+
                           '* Click to mark row.';
                });

            //Show the tooltip
            d3.select("#d3tooltip").transition()
                .duration(200)
                .style("opacity", .9)
                .style("width", "fit-content");

            d3.select(this).style("cursor", "context-menu");
        })
        .on("mouseout", function (d) {

            d3.select(this).classed("cell-hover", false);
            d3.selectAll(".rowLabelID").classed("text-highlight", false);
            d3.selectAll(".colLabelID").classed("text-highlight", false);
            d3.select("#d3tooltip").transition()
                .duration(200)
                .style("opacity", 0)
        });

        // ###########################################
        // COLUMN LABELS
        // Set the column label's content / css / tooltip
        // ###########################################
        svg.append("g")
        .selectAll(".colLabelg")
        .data(colLabelID)
        .enter()
        .append("text")
        .text((d) => { return d; })
        .attr("x", 0)
        .attr("y", (d, i) => { return (i) * cellSize; })
        .style("text-anchor", "start")
        .attr("transform", `translate(${(cellSize * 34.2)}, ${(cellSize * 3)} ) rotate (-90)` )
        .attr("class", (d, i) => { return "colLabelID mono c" + i; })
        .style("cursor", "pointer")
        .on("click", (d) => {
            window.open(`http://phylomedb.org/phylome_${d}`);
        })
        .on("mouseover", (d) => {

            //Update the tooltip position and value
            d3.select("#d3tooltip")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 10) + "px")
                .select("#value")
                .html(function () {
                    let currentIndex = colLabelID.indexOf(d)
                    return 'Phylome ID: ' + d + "<br>" +
                           'Phylome name: ' + colLabelName[currentIndex] + "<br>" +
                           '<sup>*</sup> Click to visit this phylome';
                });

            //Show the tooltip
            d3.select("#d3tooltip").transition()
                .duration(200)
                .style("opacity", .9)
                .style("width", "fit-content");

        })
        .on("mouseout",() => {
            d3.select(this).classed("cell-hover", false);
            d3.selectAll(".rowLabelID").classed("text-highlight", false);
            d3.selectAll(".colLabelID").classed("text-highlight", false);
            d3.select("#d3tooltip").transition()
                .duration(200)
                .style("opacity", 0);
        });

        // ###########################################
        // HEATMAP MATRIX
        // Set the heatmap matrix's content / css / tooltip
        // ###########################################
        svg.append("g").attr("class", "g3")
        .selectAll(".cellg")
        .data(matrix, (d) => { return d.row + ":" + d.col; })
        .enter()
        .append("rect")
        .attr("x", (d) => { return d.col * cellSize + clusterSpace; })
        .attr("y", (d) => { return d.row * cellSize + clusterSpace; })
        .attr("class", (d) => { return `cell cell-border cr${(d.row - 1)} cc${(d.col - 1)}`; })
        .attr("transform", `translate(${20*cellSize}, ${-(10 * cellSize)})`)
        .attr("taxid",(d) => {return `${rowLabelID[d.row - 1]}`})
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", (d) => {
            if (d.value < 0){
                return '#dc143c'
            } else if (d.value == 0){
                return '#E8E8E8'} else {

                    return getCellColorByValue(d.value, hexColorScale);
            }
        })
        .on("mouseover", function (d) {
            d3.select(this).classed("cell-hover", true);

            // Slightly highlight the whole row & column to be read easier.
            // This block should stay as compact as it is, because of the performance.
            // The received data can be too much on lower end devices,
            // so must stay the most optimized as possible.
            // First it queries the heatmap-panel(s) which are not hidden,
            // then checks for the cross matching of the columns and rows of the pointed area.
            // ==============================================================
            Array.from(
                document.querySelector('.heatmap-panel:not(.hidden_heatmap)')
                        .querySelectorAll(`.cr${d.row - 1}, .cc${d.col -1}`),
                                         (e) => e.style.strokeWidth = '0.8px'
            );

            // ==============================================================

            //Update the tooltip position and value
            d3.select("#d3tooltip")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 10) + "px")
                .select("#value")
                .html(function () {
                    let seed_text = '';
                    let cooccurrence_text = '';


                    if (d.value != 0) {
                        if (d.value > 0){
                            cooccurrence_text = `<br> Present in ${d.value.toFixed(4)} % of all trees.`;
                        } else if (d.value < 0) {
                            seed_text  = "<br> * This is the phylome seed.";
                        } else {
                            cooccurrence_text = `<br> Not present in any of the trees.`;
                        }

                    }

                    return "Phylome: " + colLabelName[d.col-1] +
                           "<br>Phylome ID: " + colLabelID[d.col-1] +
                           "<br>Species: <i>" + rowLabelName[d.row-1] + '</i>' +
                           "<br>Taxonomy ID: " + rowLabelID[d.row-1] +
                           cooccurrence_text +
                           seed_text;
                });

            //Show the tooltip
            d3.select("#d3tooltip")
                .style("opacity", .9)
                .style("width", "fit-content");
        })

        .on("mouseout", function (d) {

            Array.from(
                document.querySelector('.heatmap-panel:not(.hidden_heatmap)')
                        .querySelectorAll(`.cr${d.row - 1}, .cc${d.col -1}`), (e) => {
                                           if (e.style.stroke == 'rgb(76, 2, 110)') {
                                               e.style.strokeWidth = '0.8px';
                                           } else {
                                               e.style.strokeWidth = '';
                                           }
            });
            // ---

            d3.select(this).classed("cell-hover", false);
            d3.selectAll(".rowLabelID").classed("text-highlight", false);
            d3.selectAll(".colLabelID").classed("text-highlight", false);
            d3.select("#d3tooltip").style("opacity", 0);
        })


    // ###########################################
    // HEATMAP MATRIX
    // Set the taxonomy dendrogram's content / css / tooltip
    // ###########################################

    /* Calculates the coordinates of the "elbow" of the nodes in the dendrogram.
     * @param d object Contains positional values
     *                 (d.source/target.x, d.source/target.y)
     * @return string Contatenated coordinates as a string.
     * */
    function elbow(d) {
        // Count the "elbow" the dendrogram branches.

        let mValue = `M${d.source.y}, ${d.source.x}`;
        let vValue = `V${d.target.x}`;
        let hValue = `H${d.target.y}`;

        if (!d.target.children){
            let taxID = d.target.name[0];

            let complementRLabel   = document.querySelector(`.node text[taxid="${taxID}"]`);
            let complementRLabelDX = complementRLabel.attributes.dx.value;
            let complementRLabelX  = complementRLabel.getBoundingClientRect().x;
            let extendedLength     =  complementRLabelX + (complementRLabelDX * 4);

            hValue = `H${extendedLength}`;
        }

        let elbowValue = mValue + vValue + hValue;

        return elbowValue;
    }

    /* Finds the species to where the current branch is pointing.
     * @param object The chunk of a branch represented as an object.
     * @return string The species name.
     * */
    function findLastNode(obj) {
        // Finds the last node's name in a nested object.
        // Used in: "rlink" setup (rlink belongs to the taxonomy dendrogram...)
        if (obj.children){
            return findLastNode(obj.children[0]);
        } else {
            return obj.name[0];
        }
    }

    // Build the actual dendrogram and adding the events.
    let rTree = svg.append("g")
        .attr("class", "rtree")
        // .attr("transform", "translate (" + (-cellSize * 3.75) + ", " + (cellSize * 3.25) + ")");
        .attr("transform", `translate (${(-cellSize * 5)}, ${(cellSize * 3.25)})`);

        rTree.selectAll(".rlink")
        .data(rowCluster.links(rowNodes))
        .enter().append("path")
        .attr("class", "rlink")
        .attr("d", elbow)
        .on("mouseover", function (d) {
            d3.select(this).classed("cell-hover", true);

            //Update the tooltip position and value
            d3.select("#d3tooltip")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 10) + "px")
                .select("#value")
                .html(function () {
                    const taxID = findLastNode(d.source);
                    const indexOfTaxaName = rowLabelID.indexOf(taxID);
                    const taxaName= rowLabelName[indexOfTaxaName];

                    return 'Taxonomy ID: ' + taxID + '<br>' +
                           'Taxonomy name: ' + taxaName + '<br>';
                });
            //Show the tooltip
            d3.select("#d3tooltip").transition()
                .duration(200)
                .style("opacity", .9);

            d3.select(this).style("cursor", "context-menu");
        })
        .on("mouseout", () => {
            d3.select(this).classed("cell-hover", false);
            d3.selectAll(".rowLabelID").classed("text-highlight", false);
            d3.selectAll(".colLabelID").classed("text-highlight", false);
            d3.select("#d3tooltip").transition()
                .duration(200)
                .style("opacity", 0);
        });
}


/* Main function calling all the component functions as a group.
 * @param panelCounter int   The number of panels needed to fetch the "heatmapJSON".
 * @param heatmapJSON  object Data retreived from the back-end. Contains the following fields:
 *                              - matrix_<i>        array<array<float>> Matrix percentage values.
 *                              - colJSON_<i>       array<string>       Column names. (Phylome names.)
 *                              - colIDJSON_<i>     array<int>          Column IDs. (Phylome IDs.)
 *                              - dendrogram_tree   object<object ~..>  Multi-dimensional nested object.
 *                                                                      Representing a hierarchical dendrogram.
 *                              - rowLabelJSON      array<string>       Row names. (Taxonomy names.)
 *                              - rowlabelIDJSON    array<int>          Row IDs. (Taxonomy IDs.)
 * @return void
 * */
function initHeatmapPanels(panelCounter, heatmapJSON){
    injectEmptyHeatmapPanel('.heatmap-panels', panelCounter);
    createHeatmapPanels(panelCounter, heatmapJSON);
    activateChangeCellColor();
    showFirstPanel();
}

/* Calls everything in the correct order.
 * This function is the "main".
 * Being imported in the "/clustered_heatmap_explorer.js" main file.
 * @param heatmapJSON object Data retreived from the back-end. Contains the following fields:
 *                              - matrix_<i>        array<array<float>> Matrix percentage values.
 *                              - colJSON_<i>       array<string>       Column names. (Phylome names.)
 *                              - colIDJSON_<i>     array<int>          Column IDs. (Phylome IDs.)
 *                              - dendrogram_tree   object<object ~..>  Multi-dimensional nested object.
 *                                                                      Representing a hierarchical dendrogram.
 *                              - rowLabelJSON      array<string>       Row names. (Taxonomy names.)
 *                              - rowlabelIDJSON    array<int>          Row IDs. (Taxonomy IDs.)
 * @return void
 * */
export async function initHeatmap(heatmapJSON) {

    let panelCounter = await countPanelsNeeded(heatmapJSON);

    heatmapButtons.injectHeatmapButtons('.heatmap-search-wrapper', panelCounter, hexColorScale);

    // Filter bar.
    heatmapFilterBar.initFilterBar(initHeatmap);

    // Heatmap panels.
    injectPanelMainContainer('.heatmap-search-wrapper', panelCounter);
    initHeatmapPanels(panelCounter, await heatmapJSON);

    heatmapButtons.activateHeatmapButtons(initHeatmap);
}