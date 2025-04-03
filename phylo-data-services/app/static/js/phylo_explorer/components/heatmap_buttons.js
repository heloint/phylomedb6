// #########################################
// FILENAME: heatmap_buttons.json
// AUTHOR:   Daniel Majer
// EMAIL:    majerdaniel93@gmail.com
// GITHUB:   heloint
//
// DESCRIPTION:
// Containing all the function of the buttons
// on top of the heatmap's page.
// #########################################

// ============================================================
// GENERAL BUTTON FUNCTIONS
// ============================================================

/* Removes all elements from the DOM by their class.
 * @return void
 */
function removeElemsByClass(elemsToRemove) {
  document.querySelectorAll(elemsToRemove.join(",")).forEach((e) => e.remove());
}

/* Fetch and returning json wrapped with the loading GIF animation.
 * @return object
 */
async function getAPI(url) {
  document.querySelector("#loadingGIF").style.display = "block";
  const init_response = await fetch(url);
  const data = await init_response.json();
  document.querySelector("#loadingGIF").style.display = "none";

  return data;
}

/* Changes the 'selection' appearence of the tab buttons depending on their state.
 * @return void
 */
function deselectTabButtons() {
  document
    .querySelectorAll(".heatmap-tab")
    .forEach((e) => e.classList.remove("active-tab-button"));
}

/* "Resets all the heatmap panels. => Hides all of them."
 * @return void
 * */
function resetAllPanels() {
  document
    .querySelectorAll('[id^="heatmap_"]')
    .forEach((panel) => panel.classList.add("hidden_heatmap"));
}

/* Adds 'expanded' class to the '#expandButton'.
 * When expanded the button text is => 'Collapse Dendrogram'.
 * When NOT expanded the button text is => 'Expand Dendrogram'.
 *
 * @return int
 */
function addExpandedClass() {
  const expandButton = document.querySelector("#expandButton");

  let shiftValue;

  if (!expandButton.classList.contains("expanded")) {
    expandButton.classList.add("expanded");
    expandButton.innerText = "Truncate Dendrogram";
    shiftValue = 100;
  } else {
    expandButton.classList.remove("expanded");
    expandButton.innerText = "Show full dendrogram";
    shiftValue = -100;
  }
  return shiftValue;
}

/* Mutates the transform attribute of the element and shifts it on the x-axis of the DOM.
 * @param  className  string Identifier of the element we wish to shift horizontally.
 * @param  shiftValue int    Amount of the shifting.
 * @return void
 * */
function changeTransformXAttribute(className, shiftValue) {
  const element = document.querySelectorAll(className);

  Array.from(element).forEach(function (e) {
    const transformAttribute = e.attributes.transform;

    // Regular expression to get values between parentheses.
    const regExp = /\(([^)]+)\)/;
    const xY = regExp.exec(transformAttribute.value)[1].split(",");
    const transformX = parseInt(xY[0]);
    const transformY = parseInt(xY[1]);

    transformAttribute.value = `translate(${transformX + shiftValue}, ${transformY})`;
  });
}

/* Shift the dendrogram on the x-axis.
 * @param  shiftValue int Amount of the shifting.
 * @return void
 */
function shiftDendrogram(shiftValue) {
  changeTransformXAttribute(".rtree", shiftValue);
}

/* Shift the row labels on the x-axis.
 * @param  shiftValue int Amount of the shifting.
 * @return void
 */
function shiftRowLabels(shiftValue) {
  changeTransformXAttribute(".node", shiftValue);
}

/* Shift the column labels on the x-axis.
 * @param  shiftValue int Amount of the shifting.
 * @return void
 * */
function shiftColLabels(shiftValue) {
  //
  changeTransformXAttribute(".colLabelID", shiftValue);
  const colLabels = document.querySelectorAll(".colLabelID");

  // An extra attr manipulation to keep to column labels 90 degrees rotated.
  Array.from(colLabels).forEach(function (e) {
    e.attributes.transform.value += "rotate (-90)";
  });
}

/* Shift the heatmap matrix on the x-axis.
 * @param  shiftValue int Amount of the shifting.
 * @return void
 */
function shiftHeatmapCells(shiftValue) {
  const cells = document.querySelectorAll(".cell");

  Array.from(cells).forEach(function (e) {
    let xAttr = e.attributes.x;
    xAttr.value = (parseInt(xAttr.value) + shiftValue).toString();
  });
}

// ============================================================
// INJECT BUTTONS
// ============================================================

/* Creates the color code <div> element as a string.
 * @param hexColor string
 * @param codeValues int / float
 * @return string
 * */
function createColorCodeElem(hexColor, codeValues) {
  const colorCodeContent = `
                <div class="color-code"
                     style="display: flex;
                            gap: 1rem;
                            align-content: center;
                            margin: 0.3rem 0;
                           ">
                    <div class="color-code-circle"
                         style="display: inline-block;
                                height: 15px;
                                background-color: ${hexColor};
                                border: 1px solid black;
                                border-radius: 50%;
                                width: 15px;
                                margin: 0 3rem 0;
                               ">
                    </div>

                    <span style="display: block; margin-top: 0.1rem;">
                        ${codeValues}
                    </span>

                </div>
            `;
  return colorCodeContent;
}

/* Injects the explanation of the color codes found on the heatmap.
 * @param colorCodeWrapper string The identifier of the target <div>.
 * @param hexColorScale array<string>
 * @return void
 * */
function injectColorCodes(colorCodeWrapper, hexColorScale) {
  const wrapper = document.querySelector(colorCodeWrapper);

  let colorCodeContent;

  hexColorScale.forEach((e, index) => {
    colorCodeContent = createColorCodeElem(
      e,
      `${index * 10} - ${(index + 1) * 10}%`,
    );
    wrapper.innerHTML += `${colorCodeContent} `;
  });

  colorCodeContent = createColorCodeElem("#000000", "100%", "");
  wrapper.innerHTML += `${colorCodeContent} `;

  colorCodeContent = createColorCodeElem("#dc143c", "Seed (100%)", "");
  wrapper.innerHTML += `${colorCodeContent} `;
}

/* Injects the heatmap's information modal.
 * @param hexColorScale {array}
 * @return              {void}
 * */
function injectInfoModal(hexColorScale) {
  const heatmapInfo = document.querySelector(".heatmap-function-buttons");

  heatmapInfo.innerHTML =
    `
        <button id="heatmap-information-button"
                title="Usage information"
                type="button">
            <img src="/static/images/information_icon.png" style="width:2rem; height:2rem">
            <div class="heatmap-info-modal"
             style="
                    display: none;
                    width:60rem;
                    height:34rem;
                    border:1px solid black;
                    background: #EDE9E8;
                    overflow-y: scroll;
                    border-style: outset;
                    box-shadow: rgba(0, 0, 0, 0.45) 0px 10px 10px -2px;
                    position: absolute;
                    z-index: 30;
                    justify-content: space-evenly;
                    font-size: 10pt;
                ">
           <div id="heatmap-general-info" style="width:65%;padding:1rem;">
               <p> - Click on cells or dendrogram labels to mark your species of interest, then select the "Get phylome table" button to query them in a data table.</p>
               <p> - To narrow down further the explorer, use the "Filter for species" bar to add more species to the already included ones. Search by taxonomy identifier or name, then add the species of interest from the dropdown suggestion list to your filter.</p>
               <p> - You can visit a phylome's description by clicking on it's column label. </p>
               <p> - For a more extensive guide, you can visit our <a style="color:green" href="/help/8" target="_blank" ><u><b>HELP</b></u></a> section.</p>
               <p> - If you experience any issue with the explorer, you may can find solution for it in the <a style="color:green" href="/faq" target="_blank"><u><b>FAQ</b></u></a> section.</p>
           </div>

           <div class="modal-vertical-separator-container" style="height:100%; padding: 1rem 0;">
               <div class="modal-vertical-separator" style="width:0px; height:100%;box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.45);">
               </div>
           </div>

            <div id="color-codes" style="padding:1rem;">
                <span><u>Presence in the phylome's trees</u></span>
                <div id="color-code-list">
                </div>
            </div>

        </div>
        </button>
    ` + heatmapInfo.innerHTML;

  injectColorCodes("#color-code-list", hexColorScale);
}

/* Injects the main container for the button.
 * @param wrapperClass string The name for the class of the sub-container.
 * @return void
 * */
function injectButtonContainers(wrapperClass) {
  const wrapper = document.querySelector(wrapperClass);
  wrapper.innerHTML += `<span><i>TIP: *View is clipped and not visible? You can drag and scroll Phylo Explorer's view!</i></span><div class="heatmap-buttons-container"></div>`;

  const container = document.querySelector(".heatmap-buttons-container");
  container.innerHTML += '<div class="heatmap-function-buttons"></div>';
  // container.innerHTML += '<div class="heatmap-tab-buttons"><strong><u>Columns:</u></strong><br></div>';
  container.innerHTML += '<div class="heatmap-tab-buttons"></div>';
}

/* Inject the expand / truncate button for the dendrogram into the main button container.
 * @return void
 * */
function injectExpandButton() {
  // Inject expand button into the '.heatmap-function-buttons' <DIV>.
  const heatmapSearchWrapper = document.querySelectorAll(
    ".heatmap-function-buttons",
  );
  Array.from(heatmapSearchWrapper).forEach(function (e) {
    e.innerHTML =
      `<button id="expandButton"
                               type="button">
                                    Show full dendrogram
                       </button>` + e.innerHTML;
  });
}

/* Inject the search button, which gets the phylomes table
 * after the user selected the species to be searched in our database.
 * @return void
 * */
function injectSearchButton() {
  // Inject the search button of the heatmap matrix to the '.heatmap-function-buttons' <DIV>.
  const heatmapSearchWrapper = document.querySelectorAll(
    ".heatmap-function-buttons",
  );
  Array.from(heatmapSearchWrapper).forEach(function (e) {
    e.innerHTML =
      `<button type="button"
                               id="sendButton">
                                    Get phylome table
                       </button>` + e.innerHTML;
  });
}

/* Inject the resetting button.
 * This button resets the state to the very first search.
 *
 * @return void
 * */
function injectResetInitialButton() {
  let heatmapSearchWrapper = document.querySelectorAll(
    ".heatmap-function-buttons",
  );
  Array.from(heatmapSearchWrapper).forEach(function (e) {
    e.innerHTML =
      `<button id="reset-initial-button"
                               title="Resets the search to the very first one."
                               type="button">Reset to initial
                       </button>` + e.innerHTML;
  });
}

/* Injects the tab buttons for the heatmap, so they can be switched.
 * @param  numberOfTabs int For the func. to know how many buttons are needed.
 * @return void
 * */
function injectPanelTabs(numberOfTabs) {
  // Creates the html tabs.
  if (numberOfTabs > 0) {
    let tabContainer = document.querySelector(".heatmap-tab-buttons");

    tabContainer.innerHTML += `
            <button class="heatmap-tab prev-tab" type="button"> < </button>
        `;

    let i;
    for (i = 1; i <= numberOfTabs; i++) {
      if (i == 1) {
        tabContainer.innerHTML += `<button class="heatmap-tab
                                                          active-tab-button ${i}"
                                                   type="button">
                                                        ${i}
                                           </button>`;
      } else {
        tabContainer.innerHTML += `<button class="heatmap-tab ${i}"
                                                   type="button">
                                                        ${i}
                                           </button>`;
      }
    }

    tabContainer.innerHTML += `
            <button class="heatmap-tab next-tab" type="button"> > </button>
        `;
  }
}

// ============================================================
// ACTIVATE THE INJECTED BUTTONS
// ============================================================

/* Activate the "#heatmap-information-button"'s events.
 * */
function activateInfoModalButton() {
  const modalButton = document.querySelector("#heatmap-information-button");
  const modal = document.querySelector(".heatmap-info-modal");

  modalButton.addEventListener("click", () => {
    let coordinates = modalButton.getBoundingClientRect();

    let xAxis = coordinates.left;
    let yAxis = coordinates.top;

    if (modal.style.display === "none") {
      modal.style.display = "flex";
    } else {
      modal.style.display = "none";
    }
  });
}

/* Activate the "#reset-initial-button"'s events.
 * @param initHeatmap_callback function Initialize the building of the heatmap .
 * @return void
 * */
function activateResetInitialButton(initHeatmap_callback) {
  // Waits for the reset button to be added to the DOM, then adds the event listener to it with the following script.
  const resetInitialButton = document.querySelector("#reset-initial-button");

  resetInitialButton.addEventListener("click", async () => {
    document.querySelector("#sub-filter-label").remove();
    removeElemsByClass([
      ".heatmap-buttons-container",
      ".sub-filter",
      ".heatmap-panels",
    ]);
    sessionStorage.queriedTaxIDs = sessionStorage.initialCollector;
    const url = sessionStorage["initialURL"];

    document.querySelector("#loadingGIF").style.display = "block";
    const init_response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search_taxids: sessionStorage.initialCollector
          .split(",")
          .map((item) => Number(item)),
        reduced_search: sessionStorage.initialReducedSearchVal,
      }),
    });
    const heatmapJSON = await init_response.json();
    document.querySelector("#loadingGIF").style.display = "none";

    // const heatmapJSON = await getAPI(url);
    initHeatmap_callback(await heatmapJSON);
  });
}

/* Activate the panel tab buttons.
 * @return void
 * */
function activatePanelTabs() {
  // Activates the functionality of the tabs. => Adds the event listener.
  var tabs = document.querySelectorAll(".heatmap-tab");
  tabs.forEach(function (e) {
    e.addEventListener("click", function (e) {
      if (
        !e.target.classList.contains("next-tab") &&
        !e.target.classList.contains("prev-tab")
      ) {
        deselectTabButtons();
        e.target.classList.add("active-tab-button");

        resetAllPanels();
        let selectedIndex = e.target.classList[1];
        let selectedHeatmapPanel = document.querySelector(
          `#heatmap_${selectedIndex}`,
        );
        selectedHeatmapPanel.classList.remove("hidden_heatmap");
      } else if (e.target.classList.contains("next-tab")) {
        const activeTabButtonID = Array.from(
          Array.from(tabs).filter((x) =>
            x.classList.contains("active-tab-button"),
          )[0].classList,
        ).filter((e) => {
          if (e != "active-tab-button" && e != "heatmap-tab") {
            return true;
          } else {
            return false;
          }
        })[0];

        const nextButton = Array.from(tabs).filter((e) =>
          e.classList.contains(`${parseInt(activeTabButtonID) + 1}`),
        )[0];
        const firstButton = Array.from(tabs).filter((e) =>
          e.classList.contains("1"),
        )[0];

        try {
          nextButton.click();
        } catch {
          firstButton.click();
        }
      } else if (e.target.classList.contains("prev-tab")) {
        const activeTabButtonID = Array.from(
          Array.from(tabs).filter((x) =>
            x.classList.contains("active-tab-button"),
          )[0].classList,
        ).filter((e) => {
          if (e != "active-tab-button" && e != "heatmap-tab") {
            return true;
          } else {
            return false;
          }
        })[0];

        const nextButton = Array.from(tabs).filter((e) =>
          e.classList.contains(`${parseInt(activeTabButtonID) - 1}`),
        )[0];
        const lastButton = tabs[tabs.length - 2];

        try {
          nextButton.click();
        } catch {
          lastButton.click();
        }
      }
    });
  });
}

/* Activate the expand / truncate button for the dendrogram.
 * @void return
 * */
function activateExpandButton() {
  // Waits for the '#expandButton' to be created in the DOM, then adds the event listener with the following script.
  let expandButton = document.querySelector("#expandButton");

  expandButton.addEventListener("click", function () {
    let shiftValue = addExpandedClass();

    shiftDendrogram(shiftValue);
    shiftRowLabels(shiftValue);
    shiftColLabels(shiftValue);
    shiftHeatmapCells(shiftValue);
  });
}

/* Inject the search button, which gets the phylomes table
 * after the user selected the species to be searched in our database.
 *
 * @return void
 * */
function activateSearchButton() {
  /* Loops through all the matrix cells, and if finds any "selected" class,
    collects the taxid attribute into an array,
    then sends the request for the result table. */

  const sendButton = document.querySelector("#sendButton");

  sendButton.addEventListener("click", async () => {
    const taxIDCollector = Array.from(
      document.querySelectorAll(".highlighted"),
    ).map((e) => {
      return e.attributes.taxid.value;
    });

    if (typeof taxIDCollector !== "undefined" && taxIDCollector.length > 0) {
      document.querySelector(
        ".error-message-container",
      ).children[0].textContent = "";
      document.querySelector(".error-message-container").style.display = "none";
      const url = `${window.origin}/phylomes?taxidFilters=${taxIDCollector.join(",")}`;
      window.open(url, "_blank");
    } else if (taxIDCollector.length === 0) {
      document.querySelector(
        ".error-message-container",
      ).children[0].textContent = `* There aren't any species selected.`;
      document.querySelector(".error-message-container").style.display =
        "block";
    }
  });
}

// ####################
// ALL BUTTONS MAIN!
// ####################

/* Encapsulation of all the functions to be initialized.
 * It is called in the HTML as text/javascript, and being called by the other components.
 * (Principally in the heatmap_build.js.)
 * */
class hmButtons {
  injectHeatmapButtons(targetContainer, panelCounter, hexColorScale) {
    injectButtonContainers(targetContainer);
    injectExpandButton();
    injectSearchButton();
    injectResetInitialButton();
    injectInfoModal(hexColorScale);
    injectPanelTabs(panelCounter);
  }

  activateHeatmapButtons(initHeatmap_callback) {
    activateInfoModalButton();
    activatePanelTabs();
    activateResetInitialButton(initHeatmap_callback);
    activateSearchButton();
    activateExpandButton();
  }
}

// Create the object to be used by other components.
const heatmapButtons = new hmButtons();
