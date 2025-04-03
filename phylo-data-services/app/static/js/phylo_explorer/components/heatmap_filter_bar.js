//######################################################################
// GENERAL FUNCTIONS!
//######################################################################

/* Removes all elements from the DOM by their class.
 * @param elemsToRemove array<string> An array of element identifiers.
 * @return void
 */
function removeElemsByClass(elemsToRemove) {
  elemsToRemove.forEach((elem) => {
    document.querySelectorAll(elem).forEach((e) => e.remove());
  });
}

/* Show the loading GIF.
 * @return void
 */
function displayLoadingGIF() {
  const loadingGIF = document.getElementById("loadingGIF");
  loadingGIF.style.display = "block";
}

/* Hide the loading GIF.
 * @return void
 */
function hideLoadingGIF() {
  const loadingGIF = document.getElementById("loadingGIF");
  loadingGIF.style.display = "none";
}

/* Fetches and returnes json wrapped with the loading GIF animation.
 * @param url string The url to fetch the data from.
 * @return object
 * */
async function getAPI(url) {
  displayLoadingGIF();
  const init_response = await fetch(url);
  const data = await init_response.json();
  hideLoadingGIF();

  return data;
}

// #########################################################3
// FILTER-BAR USER INTERACTION FUNCTIONS
// #########################################################3

/* Making sure if the user deletes everything from the input field,
 * then the suggestions will disappear as well.
 * @param searchInput object Element of the input text bar.
 * @param resultsWrapper object Wrapper of the search suggestions.
 */
function hideEmptyState(searchInput, resultsWrapper) {
  searchInput.addEventListener("keyup", () => {
    const isEmpty = (str) => !str.trim().length;

    if (isEmpty(searchInput.value)) {
      return resultsWrapper.classList.remove("show-suggestions");
    }
  });
}

// Linters will complain,
// because it is assigned "onclick" in html.
// So ignore your linter here.

/* It's used to scroll to element on click event.
 * @param event The event coming
 *              from the button to which it's assigned to in the html.
 * @return void
 * */
function jumpToRow(event) {
  // Linters will say it's not used,
  // but it is called in the renderFilterSuggestions
  // function's button HTML string.

  event.stopPropagation();

  const clickedListItem =
    event.target.parentNode.parentNode.parentNode.textContent;

  const regExp = /\[([^)]+)\]/;

  const selectedTaxID = regExp.exec(clickedListItem)[1];

  let elemToView = document.querySelector(
    `.node text[taxid="${selectedTaxID}"]`
  );

  elemToView.scrollIntoView({ behavior: "smooth", block: "center" });

  const cells = document.querySelectorAll(".g3 rect");
  if (!elemToView.classList.contains("highlighted")) {
    elemToView.classList.add("highlighted");

    cells.forEach((cell) => {
      if (cell.attributes.taxid.value == selectedTaxID) {
        cell.style.stroke = "#4c026e";
        cell.style.strokeWidth = "0.8px";
        elemToView.style.stroke = "#4c026e";
      }
    });
  }
}

/* Renders the autosuggestions below the search
 * Uses an unordered list as the container.
 *
 * @param resultsWrapper object Wrapper element of the suggestions from searching.
 * @param results array<string> Array of the species which can be searched / filtered.
 * @return void
 * */
function renderFilterSuggestions(
  searchInput,
  searchWrapper,
  resultsWrapper,
  results
) {
  if (!results.length) {
    return resultsWrapper.classList.remove("show-suggestions");
  }

  const content = results
    .map((item, index) => {
      let splitItem = item.split("->");
      let formatedItem = `${splitItem[0]} <b> ID:${splitItem[1].trim()} </b>`;

      let cl = "";
      if (index === 0) {
        cl = "active_search_item";
      }

      return `<li class="${cl}" tabindex="-1" >${formatedItem}
                        <div style="display: inline;">
                            <button title="Jump to species.."
                                    tabindex="-1"
                                    onclick="jumpToRow(event)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                                    </svg>
                            </button>

                            <button title="Add to filter.."
                                    tabindex="-1"
                                    class="addFilterButton" >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                                    </svg>
                            </button>

                        </div>
                    </li>`;
    })
    .join("");

  resultsWrapper.classList.add("show-suggestions");
  resultsWrapper.innerHTML = `<ul tabindex="0">${content}</ul>`;
}

/* Displays / injects the selected species into a container (ul).
 * @param content string The content to be fetched.
 * @param listElemCounter int An indexer for the elements.
 * @param taxid string The taxid to be assigned to the element as an attribute.
 * @return void
 * */
function displayFilterSelection(content, listElemCounter, taxid) {
  /* Append the selection list with the new item. */
  const collectorList = document.querySelector(".filterCollector ul");

  const contentBits = content.split("ID:");
  content = `<p>${contentBits[0]}</p> <b>ID:${contentBits[1]}</b>`;

  collectorList.innerHTML += `<li title="${contentBits[0]}
                                    Tax. ID:${contentBits[1]}"
                                    id="${listElemCounter}"
                                    value="${taxid}" >

                                    ${content}
                                    <button class="removeFilterButton" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                                        </svg>
                                    </button>
                                </li>`;

  // After adding an item, check if we need scroll buttons
  updateScrollButtons();
}

/* When starting to write, each time a key being pushed down,
 * it triggers the search in the initially fetched array
 * and renders the suggestions below the search bar
 * using the "renderSuggestions" function.
 *
 * @param searchInput object The text input element.
 * @param searchableSpecies array<string> The available / "searchable" species.
 * @param resultsWrapper object The wrapper to where the suggestions are fetched.
 * @return void
 */
function addFilterKeyDownTriggers(
  searchInput,
  searchableSpecies,
  searchWrapper,
  resultsWrapper
) {
  searchInput.addEventListener(
    "keyup",
    (e) => {
      let keysToIgnore = [40, 38, 13];

      if (e.which === 27) {
        resultsWrapper.classList.remove("show-suggestions");
      } else if (keysToIgnore.includes(e.which)) {
        resultsWrapper.addEventListener("focus", () => {
          resultsWrapper.style.outlineColor = "#152238";
          resultsWrapper.style.outline = "";
        });
        resultsWrapper.focus();
      } else if (!keysToIgnore.includes(e.keycode)) {
        let results = [];
        let input = searchInput.value;

        if (input.length) {
          results = searchableSpecies.filter((item) => {
            return item.toLowerCase().includes(input.toLowerCase());
          });
        }

        renderFilterSuggestions(
          searchInput,
          searchWrapper,
          resultsWrapper,
          results
        );

        const resultList = document.querySelectorAll(
          ".sub-filter-suggestions ul li"
        );
        const regExp = /\[([^)]+)\]/;

        let taxid;
        let listItems;
        let listElemCounter = 0;

        let collector;
        const isEmpty = (elem) => !elem.innerHTML.trim().length;

        resultList.forEach((elem) => {
          elem.addEventListener("click", async function () {
            let selections = Array.from(
              document.querySelectorAll(".filterCollector ul li")
            ).map((e) => {
              return e.attributes.value.value;
            });

            // Get taxid from string.
            taxid = regExp.exec(elem.outerText)[1];

            if (!selections.includes(taxid)) {
              document.querySelector(".filterCollectorWrapper").style.display =
                "flex";

              displayFilterSelection(elem.outerText, listElemCounter, taxid);
              listElemCounter++;

              // Update the array of querySelector after each append.
              listItems = document.querySelectorAll(".filterCollector ul li");

              // Re-add the remove eventlisteners for the new list items
              listItems.forEach((elem) => {
                let removeButton = elem.querySelector(".removeFilterButton");

                removeButton.addEventListener("click", function () {
                  const regExp = /\[([^)]+)\]/;
                  taxid = regExp.exec(elem.outerText)[1];
                  elem.parentNode.removeChild(elem);

                  collector = document.querySelector(
                    ".filterCollectorWrapper ul"
                  );
                  if (isEmpty(collector)) {
                    collector.parentElement.parentElement.style.display =
                      "none";
                  }

                  // After removing an item, update scroll buttons
                  updateScrollButtons();
                });
              });
            }
          });
        });
      }
    },
    true
  );
}

/* Removes all the "active" classes from the "ul".
   This function is used by: "changeSelection"
 *
 * @param x array<object> Array of elements.
 * @return void
 */
function removeActive(x) {
  for (let i = 0; i < x.length; i++) {
    x[i].classList.remove("active_search_item");
  }
}

/* Swaps the "active" class to the previous or next selection in the "ul".
   This function is used by: "addFilterMovementTriggers"
 *
 * @param x object List element to be selected by keyboard interaction.
 * @param currentFocus int The index of list element which is currently focused on.
 * @return int Index of the new focused element.
 * */
function changeSelection(x, currentFocus) {
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;

  removeActive(x);
  x[currentFocus].classList.add("active_search_item");

  return currentFocus;
}

/* Adds interaction keys (like arrows, esc, etc..).
   This function is used by: "initAutocompleteArray"
 * @param searchInput object Element of the input text bar.
 * @param searchWrapper object Wrapper / Container to fetch the suggestions.
 * @return void
 * */
function addFilterMovementTriggers(searchInput, resultsWrapper) {
  let currentFocus = 0;
  let currentItem;
  let x = document.querySelector(".sub-filter-suggestions");
  if (x) x = x.getElementsByTagName("li");

  resultsWrapper.addEventListener(
    "keydown",
    function (e) {
      // This snippet is to reset the currentFocus
      // if the input field is empty.
      // =========================================
      const isEmpty = (str) => !str.trim().length;
      if (isEmpty(searchInput.value)) {
        currentFocus = 0;
      }
      // =========================================
      switch (e.keyCode) {
        case 40:
          searchInput.style.caretColor = "transparent";

          currentFocus++;
          currentFocus = changeSelection(x, currentFocus);

          currentItem = x[currentFocus];

          try {
            currentItem.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          } catch {
            // Ignore the initial undefined values.
          }

          searchInput.setSelectionRange(1000, 1000);
          break;

        case 38:
          searchInput.style.caretColor = "transparent";

          currentFocus--;
          currentFocus = changeSelection(x, currentFocus);

          currentItem = x[currentFocus];

          currentItem.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });

          searchInput.setSelectionRange(1000, 1000);
          break;

        case 27:
          searchInput.blur();
          resultsWrapper.classList.remove("show-suggestions");
          break;

        case 13:
          break;

        default:
          searchInput.style.caretColor = "black";
          searchInput.focus();

          resultsWrapper.addEventListener("focus", () => {
            resultsWrapper.style.outline = "";
          });

          currentFocus = 0;
      }

      if (e.keyCode == 13) {
        x[currentFocus].click();
      }
      e.preventDefault();
    },
    false
  );

  let suggestionPanel = document.querySelector(".sub-filter-suggestions");
  suggestionPanel.addEventListener(
    "mouseover",
    function () {
      currentFocus = -1;
      removeActive(x);
    },
    { once: true }
  );
}

/* Inject the filter bar container next to the 'neighbourElem' in the DOM.
 * @param wrapperClass Container / wrapper to inject the filter elements.
 * @return void
 */
function injectFilterContainer(wrapperClass) {
  let wrapper = document.querySelector(wrapperClass);
  wrapper.innerHTML +=
    '<div id="sub-filter-label"><p>Filter from current results:</p></div>';
  wrapper.innerHTML += '<div class="sub-filter"></div>';
}

/* Inject the filter bar into the '.sub-filter' <div>.
 * @param containerClassName object The container element for the filter-bar.
 * @return void
 */
function injectFilterBar(containerClassName) {
  let filterContainer = document.querySelector(`${containerClassName}`);

  let filterBarHTML = `
        <div class="sub-filter-input-container">
            <div class="sub-filter-input-wrapper">
                    <input type="text" name="search" id="sub-filter-input" placeholder="Search in results.." autocomplete="chrome-off">
            </div>

            <div class="sub-filter-suggestions" tabindex="0">
                <ul>
                </ul>
            </div>
        </div>

        <div style="display : flex;gap : 5px;max-height: 40px">
            <button type="button" class="green-btn filterButton">Filter</button>
            <button type="button" class="green-btn clearFilterButton" style="display : flex; width : 130px ; justify-content : center">Clear all</button>
        </div>

        <div class="filterCollectorWrapper">
            <!-- Add scroll buttons -->
            <button class="filter-scroll-button filter-scroll-left hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                </svg>
            </button>
            
            <div class="filterCollector">
                <ul>
                </ul>
            </div>
            
            <button class="filter-scroll-button filter-scroll-right hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            </button>
        </div>
    `;

  filterContainer.innerHTML += filterBarHTML;

  // Initialize scroll buttons after elements are injected
  initScrollButtons();
}

/* Initialize horizontal scroll buttons for the filter collector
 * This adds event listeners and functionality for the scroll buttons
 * @return void
 */
function initScrollButtons() {
  const filterCollector = document.querySelector(".filterCollector");
  const leftButton = document.querySelector(".filter-scroll-left");
  const rightButton = document.querySelector(".filter-scroll-right");

  if (!filterCollector || !leftButton || !rightButton) return;

  // Add click event for left scroll button
  leftButton.addEventListener("click", () => {
    filterCollector.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  });

  // Add click event for right scroll button
  rightButton.addEventListener("click", () => {
    filterCollector.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  });

  // Show/hide buttons based on scroll position
  filterCollector.addEventListener("scroll", () => {
    updateScrollButtonVisibility();
  });

  // Enable mouse drag scrolling
  enableMouseDragScroll(filterCollector);

  // Initial check for buttons visibility
  updateScrollButtons();
}

/* OPTIONAL: Enhanced mouse wheel handler with horizontal and vertical detection */
/* This version will work better with trackpads that support both directions */
function enhancedWheelHandler() {
  const filterCollector = document.querySelector(".filterCollector");
  if (!filterCollector) return;

  // Enhanced wheel event handler that detects direction
  filterCollector.addEventListener(
    "wheel",
    (e) => {
      // Prevent default behavior
      e.preventDefault();

      let delta = 0;

      // Check if it's a horizontal scroll event (common on trackpads)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Horizontal wheel movement detected (likely trackpad)
        delta = e.deltaX;
      } else {
        // Vertical wheel movement (normal mouse wheel) - convert to horizontal
        delta = e.deltaY;
      }

      // Apply the scroll with smooth animation
      filterCollector.scrollBy({
        left: delta,
        behavior: "auto", // Using 'auto' for better responsiveness during wheel events
      });

      // Update scroll button visibility
      updateScrollButtonVisibility();
    },
    { passive: false }
  );
}

/* Update the scroll buttons state based on content width and scroll position
 * Shows/hides buttons depending if scrolling is possible
 * @return void
 */
function updateScrollButtons() {
  const filterCollector = document.querySelector(".filterCollector");
  const rightButton = document.querySelector(".filter-scroll-right");
  const leftButton = document.querySelector(".filter-scroll-left");
  if (!filterCollector) return;

  // Check if scroll is needed at all (content wider than container)
  const needsScroll = filterCollector.scrollWidth > filterCollector.clientWidth;

  updateScrollButtonVisibility();

  // Check if either button is visible (not hidden)
  const isRightButtonVisible =
    rightButton && !rightButton.classList.contains("hidden");
  const isLeftButtonVisible =
    leftButton && !leftButton.classList.contains("hidden");

  // Update cursor based on button visibility
  // If either button is visible, use grab cursor, otherwise use default
  if (isRightButtonVisible || isLeftButtonVisible) {
    // Only set to grab if not currently being dragged
    if (filterCollector.classList.contains("active-drag")) {
      filterCollector.style.cursor = "grabbing";
    } else {
      filterCollector.style.cursor = "grab";
    }
  } else {
    filterCollector.style.cursor = "default";
  }

  // Show filterCollectorWrapper if there are items
  const hasItems =
    document.querySelector(".filterCollector ul").children.length > 0;
  const wrapper = document.querySelector(".filterCollectorWrapper");

  if (wrapper) {
    wrapper.style.display = hasItems ? "flex" : "none";
  }
}

/* Update the visibility of scroll buttons based on current scroll position
 * @return void
 */
function updateScrollButtonVisibility() {
  const filterCollector = document.querySelector(".filterCollector");
  const leftButton = document.querySelector(".filter-scroll-left");
  const rightButton = document.querySelector(".filter-scroll-right");

  if (!filterCollector || !leftButton || !rightButton) return;

  // Calculate if scrolling is possible and in which direction
  const scrollLeft = filterCollector.scrollLeft;
  const scrollWidth = filterCollector.scrollWidth;
  const clientWidth = filterCollector.clientWidth;
  const needsScroll = scrollWidth > clientWidth;

  // Left button visible if scrolled to the right
  leftButton.classList.toggle("hidden", scrollLeft <= 0 || !needsScroll);

  // Right button visible if more content to the right
  rightButton.classList.toggle(
    "hidden",
    scrollLeft >= scrollWidth - clientWidth || !needsScroll
  );
}

/* Activates the click event on the clear button,
 * which clears the all the sub-filter selections.
 *
 * @return void
 * */
function activateClearButton() {
  const clearButton = document.querySelector(".clearFilterButton");

  clearButton.addEventListener("click", () => {
    document.querySelector(".filterCollector ul").innerHTML = "";
    // Update scroll buttons after clearing
    updateScrollButtons();
  });
}

/* Injects to the top of the interface the received error messages.
 * @param errorMessage string The received error message.
 * @return void
 * */
function injectErrorMessage(errorMessage) {
  let errorElement = document.querySelector(".error-message-container");
  errorElement.style.display = "block";
  errorElement.children[0].textContent = `* ${errorMessage}`;
}

/* Removes the previously fetched error message.
 * @return void
 * */
function removeErrorMessage() {
  let errorElement = document.querySelector(".error-message-container");
  errorElement.style.display = "none";
  errorElement.children[0].textContent = "";
}

/**
 * Updates a URL by removing the "?search_taxids=<comma-separated numbers>" segment
 * and replacing it with a fresh new "?search_taxids=".
 *
 * @param {string} url - The original URL that needs to be updated.
 * @returns {string} - The updated URL with the new "?search_taxids=".
 *
 * @example
 * const url = "http://localhost:3050/lala?search_taxids=321,543";
 * const updatedUrl = updateUrl(url);
 */
function cleanSearchTaxidsInUrl(url) {
  const cleanedUrl = url.replace(/\?search_taxids=[\d,]*/, "");
  return cleanedUrl + "?search_taxids=";
}

/* Activates the click event on the filter button.
 * Creates and formats a URL and
 * fetches it to the backend with the parameters saved in the sessionStorage.
 * @param initHeatmap_callback function Re-initializes the heatmap interface
 *                                      with the newly received data.
 * @return void
 * */
async function activateFilterButton(initHeatmap_callback) {
  /*Forwards to the backend on click event.
   * This function is used by: "initAutocompleteArray"*/
  document
    .querySelector(".filterButton")
    .addEventListener("click", async function () {
      // Initialize variables to serve as a backup for the sessionStorage values.
      // When an error occurs by the request towards the server,
      // then with these variables we can reverse partially the sessionStorage.
      // ==========================
      let queriedTaxIDs_backup;
      let filteredURL_backup;
      // ==========================

      let listItems = document.querySelectorAll(".filterCollector ul li");
      let collector = [];

      listItems.forEach((e) => {
        collector.push(e.value);
      });

      if (collector.length != 0) {
        // Create a backup for the queriedTaxIDs variable.
        // If the request fails, then reverse it to this version.
        // ===================================
        if (!sessionStorage["queriedTaxIDs"]) {
          queriedTaxIDs_backup = collector;
          sessionStorage["queriedTaxIDs"] = collector;
        } else {
          queriedTaxIDs_backup = sessionStorage["queriedTaxIDs"];
          sessionStorage["queriedTaxIDs"] += "," + collector;
        }
        // ===================================

        // With regex get the base of the url,
        // only with the "param_search_taxids" empty parameter,
        // then concat a new URL with the filter taxids for the new GET requests.
        // ===================================
        // let baseURL = cleanSearchTaxidsInUrl(sessionStorage["initialURL"]);
        // const url = baseURL + sessionStorage["queriedTaxIDs"];

        const init_response = await fetch(sessionStorage["initialURL"], {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search_taxids: sessionStorage["queriedTaxIDs"]
              .split(",")
              .map((item) => Number(item)),
            reduced_search: false,
          }),
        });
        const heatmapJSON = await init_response.json();

        // const heatmapJSON = await getAPI(url);
        // ===================================

        // REQUEST ERROR HANDLING
        // =================================
        if (heatmapJSON.error) {
          injectErrorMessage(heatmapJSON.error);

          // Reverse the sessionStorage values.
          // =================================
          sessionStorage["queriedTaxIDs"] = queriedTaxIDs_backup;
          // =================================
        } else {
          removeErrorMessage();
          document.querySelector("#sub-filter-label").remove();
          removeElemsByClass([
            ".heatmap-buttons-container",
            ".sub-filter",
            ".heatmap-panels",
            ".heatmap-guides-container",
          ]);
          initHeatmap_callback(heatmapJSON);
        }
      }
    });
}

/* Encapsulation of all the functions to be initialized.
 * It is called in the HTML as text/javascript, and being called by the other components.
 * (Principally in the heatmap_build.js.)
 * */
class hmFilterBar {
  async initFilterBar(initHeatmap_callback) {
    // Main function!

    injectFilterContainer(".heatmap-search-wrapper");
    injectFilterBar(".sub-filter");

    const initResponse = await fetch(
      `${window.origin}/phylo-explorer-service/all_species_heatmap`
    );
    let filterableSpecies = await initResponse.json();

    let taxIDs = Array.from(document.querySelectorAll(".node text[taxid]")).map(
      (e) => e.attributes.taxid.value
    );

    taxIDs = Array.from([...new Set(taxIDs)]);

    filterableSpecies = filterableSpecies.filter((specie) =>
      taxIDs.some((id) => specie.includes(`[${id}]`))
    );

    let searchInput = document.querySelector("#sub-filter-input");
    let searchWrapper = document.querySelector(".sub-filter-input-container");
    let resultsWrapper = document.querySelector(".sub-filter-suggestions");

    hideEmptyState(searchInput, resultsWrapper);
    addFilterKeyDownTriggers(
      searchInput,
      filterableSpecies,
      searchWrapper,
      resultsWrapper
    );
    addFilterMovementTriggers(searchInput, resultsWrapper);
    activateClearButton();
    activateFilterButton(initHeatmap_callback);

    // Add functionality to close suggestions on click outside
    closeOnClickOutside(searchWrapper, resultsWrapper);

    // Initialize scroll buttons and watch for window resize
    initScrollButtons();
    enhancedWheelHandler();
    window.addEventListener("resize", updateScrollButtons);
  }
}

/* Enable mouse drag scrolling for horizontal containers
 * This function adds the ability to click and drag to scroll horizontally
 * and COMPLETELY PREVENTS text selection during drag operations
 * @param element The DOM element to enable drag scrolling on
 * @return void
 */
function enableMouseDragScroll(element) {
    if (!element) return;
  
    let isDown = false;
    let startX;
    let startY;
    let scrollLeft;
    let isDragging = false; // Flag to track active dragging state
  
    // Variable para rastrear si hemos aplicado estilos a todo el documento
    let documentStylesApplied = false;
  
    // Store original body styles to restore later
    let originalBodyStyles = {
      userSelect: "",
      mozUserSelect: "",
      webkitUserSelect: "",
      msUserSelect: "",
      touchAction: "",
      webkitTouchCallout: "",
      overflow: "",
      cursor: "",
      pointerEvents: ""
    };
  
    // Store original document styles
    let originalDocumentStyles = {
      userSelect: "",
      mozUserSelect: "",
      webkitUserSelect: "", 
      msUserSelect: "",
      pointerEvents: ""
    };
  
    // Function to prevent ANY selection or drag event globally
    function preventAnySelection(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  
    // Global mouse move handler that continues the scroll even outside element
    function handleGlobalMouseMove(e) {
      if (!isDown) return;
  
      // Prevent default behavior and propagation
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
  
      const x = e.pageX - element.offsetLeft;
      const y = e.pageY - element.offsetTop;
  
      // Calculate movement
      const walkX = (x - startX) * 1.5;
      const walkY = (startY - y) * 1.5;
      
      // Apply both movements
      const totalWalk = walkX + walkY;
      element.scrollLeft = scrollLeft - totalWalk;
  
      // Update scroll button visibility
      updateScrollButtonVisibility();
      
      return false;
    }
  
    // Global mouse up handler to end the drag
    function handleGlobalMouseUp(e) {
      if (!isDown) return;
      
      // Prevent any default behavior
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Reset state
      isDown = false;
      isDragging = false;
      element.classList.remove("active-drag");
  
      // Update cursor style based on scroll buttons
      if (isAnyScrollButtonVisible()) {
        element.style.cursor = "grab";
      } else {
        element.style.cursor = "default";
      }
  
      // Re-enable global behaviors IMMEDIATELY to prevent any drag stuck state
      enableGlobalDrag();
      
      return false;
    }
  
    // Function to disable all selection and drag behaviors globally
    function disableGlobalDrag() {
      // Store original body values
      originalBodyStyles = {
        userSelect: document.body.style.userSelect,
        mozUserSelect: document.body.style.MozUserSelect,
        webkitUserSelect: document.body.style.WebkitUserSelect,
        msUserSelect: document.body.style.msUserSelect,
        touchAction: document.body.style.touchAction,
        webkitTouchCallout: document.body.style.WebkitTouchCallout,
        overflow: document.body.style.overflow,
        cursor: document.body.style.cursor,
        pointerEvents: document.body.style.pointerEvents
      };
  
      // Store original document styles
      originalDocumentStyles = {
        userSelect: document.documentElement.style.userSelect,
        mozUserSelect: document.documentElement.style.MozUserSelect,
        webkitUserSelect: document.documentElement.style.WebkitUserSelect,
        msUserSelect: document.documentElement.style.msUserSelect,
        pointerEvents: document.documentElement.style.pointerEvents
      };
  
      // Apply EVEN MORE restrictive styles to body
      document.body.style.userSelect = "none";
      document.body.style.MozUserSelect = "none";
      document.body.style.WebkitUserSelect = "none";
      document.body.style.msUserSelect = "none";
      document.body.style.touchAction = "none";
      document.body.style.WebkitTouchCallout = "none";
      document.body.style.overflow = "hidden";
      document.body.style.cursor = "grabbing";
      document.body.style.pointerEvents = "none";
      
      // Also apply to the document element (html)
      document.documentElement.style.userSelect = "none";
      document.documentElement.style.MozUserSelect = "none";
      document.documentElement.style.WebkitUserSelect = "none";
      document.documentElement.style.msUserSelect = "none";
      document.documentElement.style.pointerEvents = "none";
      
      // Add specific handlers for drag/selection prevention
      document.addEventListener("selectstart", preventAnySelection, { capture: true, passive: false });
      document.addEventListener("dragstart", preventAnySelection, { capture: true, passive: false });
      document.addEventListener("drop", preventAnySelection, { capture: true, passive: false });
      
      // Add mouse event handlers
      document.addEventListener("mousemove", handleGlobalMouseMove, { capture: true, passive: false });
      document.addEventListener("mouseup", handleGlobalMouseUp, { capture: true, passive: false });
  
      // Remove any current selection
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
      
      // Mark that we've applied document-wide styles
      documentStylesApplied = true;
      
      // Exception for the draggable element - it needs to receive pointer events
      element.style.pointerEvents = "auto";
    }
  
    // Function to restore all selection and drag behaviors
    function enableGlobalDrag() {
      // Restore body styles
      document.body.style.userSelect = originalBodyStyles.userSelect;
      document.body.style.MozUserSelect = originalBodyStyles.mozUserSelect;
      document.body.style.WebkitUserSelect = originalBodyStyles.webkitUserSelect;
      document.body.style.msUserSelect = originalBodyStyles.msUserSelect;
      document.body.style.touchAction = originalBodyStyles.touchAction;
      document.body.style.WebkitTouchCallout = originalBodyStyles.webkitTouchCallout;
      document.body.style.overflow = originalBodyStyles.overflow;
      document.body.style.cursor = originalBodyStyles.cursor;
      document.body.style.pointerEvents = originalBodyStyles.pointerEvents;
      
      // Restore document element styles
      document.documentElement.style.userSelect = originalDocumentStyles.userSelect;
      document.documentElement.style.MozUserSelect = originalDocumentStyles.mozUserSelect;
      document.documentElement.style.WebkitUserSelect = originalDocumentStyles.webkitUserSelect;
      document.documentElement.style.msUserSelect = originalDocumentStyles.msUserSelect;
      document.documentElement.style.pointerEvents = originalDocumentStyles.pointerEvents;
  
      // Remove all event listeners with the same parameters as when added
      document.removeEventListener("selectstart", preventAnySelection, { capture: true, passive: false });
      document.removeEventListener("dragstart", preventAnySelection, { capture: true, passive: false });
      document.removeEventListener("drop", preventAnySelection, { capture: true, passive: false });
      
      document.removeEventListener("mousemove", handleGlobalMouseMove, { capture: true, passive: false });
      document.removeEventListener("mouseup", handleGlobalMouseUp, { capture: true, passive: false });
      
      // Reset our tracking variable
      documentStylesApplied = false;
    }
  
    // Function to check if any scroll button is visible
    function isAnyScrollButtonVisible() {
      const rightButton = document.querySelector(".filter-scroll-right");
      const leftButton = document.querySelector(".filter-scroll-left");
  
      const isRightButtonVisible = rightButton && !rightButton.classList.contains("hidden");
      const isLeftButtonVisible = leftButton && !leftButton.classList.contains("hidden");
  
      return isRightButtonVisible || isLeftButtonVisible;
    }
  
    // Mouse down event - start the drag
    element.addEventListener("mousedown", (e) => {
      // Check if any scroll button is visible
      if (!isAnyScrollButtonVisible()) {
        return;
      }
  
      // Prevent if click is on a button or interactive element
      if (e.target.closest("button") || e.target.closest("a")) {
        return;
      }
  
      // Set state flags
      isDown = true;
      isDragging = true;
      element.classList.add("active-drag");
      
      // Record starting position
      startX = e.pageX - element.offsetLeft;
      startY = e.pageY - element.offsetTop;
      scrollLeft = element.scrollLeft;
  
      // Change cursor to grabbing
      element.style.cursor = "grabbing";
  
      // Disable global selection and drag
      disableGlobalDrag();
      
      // Prevent default behavior to avoid text selection
      e.preventDefault();
      e.stopPropagation();
    });
  
    // Add mouse wheel handling for horizontal scrolling
    element.addEventListener("wheel", (e) => {
      // Only handle if scroll buttons are visible
      if (!isAnyScrollButtonVisible()) {
        return;
      }
  
      // Prevent default vertical scroll
      e.preventDefault();
  
      // Determine scroll direction and amount
      let delta = e.deltaY || e.deltaX;
  
      // Use adaptive speed with limits
      const speed = Math.min(Math.abs(delta) * 1.5, 60);
      const direction = delta > 0 ? 1 : -1;
  
      // Apply the scroll
      element.scrollLeft += direction * speed;
  
      // Update scroll button visibility
      updateScrollButtonVisibility();
    }, { passive: false });
    
    // Add safeguard for any missed mouseup events (e.g., if mouseup happens outside window)
    window.addEventListener("blur", () => {
      if (isDown) {
        isDown = false;
        isDragging = false;
        element.classList.remove("active-drag");
        
        // Ensure we restore all styles
        if (documentStylesApplied) {
          enableGlobalDrag();
        }
      }
    });
  }

/* Adds a click event listener to the document to close the suggestions panel
 * when clicking outside of the filter bar elements.
 *
 * @param searchWrapper object Wrapper of the filter search components.
 * @param resultsWrapper object Wrapper of the search suggestions.
 * @return void
 */
function closeOnClickOutside(searchWrapper, resultsWrapper) {
  document.addEventListener("click", (event) => {
    // Check if the click is outside both the search wrapper and results wrapper
    const isClickInside =
      searchWrapper.contains(event.target) ||
      resultsWrapper.contains(event.target);

    // If clicking outside, hide the suggestions
    if (
      !isClickInside &&
      resultsWrapper.classList.contains("show-suggestions")
    ) {
      resultsWrapper.classList.remove("show-suggestions");
    }
  });
}
// Create an object to be ready to used.
const heatmapFilterBar = new hmFilterBar();
