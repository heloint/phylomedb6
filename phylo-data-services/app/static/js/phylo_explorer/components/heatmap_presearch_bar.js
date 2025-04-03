// ###########################################################################################
// GENERAL UTILITIES
// ###########################################################################################

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

// ###########################################################################################
// PRE-FILTER THE HEATMAP FUNCTIONS
// ###########################################################################################

/* Making sure if the user deletes everything from the input field,
 * then the suggestions will disappear as well.
 * @param searchInput object Element of the input text bar.
 * @param resultsWrapper object Wrapper of the search suggestions.
 */
function hideEmptyState(searchInput, searchWrapper) {
  searchInput.addEventListener("keyup", () => {
    const isEmpty = (str) => !str.trim().length;

    if (isEmpty(searchInput.value)) {
      return searchWrapper.classList.remove("show-suggestions");
    }
  });
}

/* Renders the autosuggestions below the search
 * Uses an unordered list as the container.
 *
 * @param resultsWrapper object Wrapper element of the suggestions from searching.
 * @param results array<string> Array of the species which can be searched / filtered.
 * @return void
 * */
function renderSuggestions(
  searchInput,
  searchWrapper,
  resultsWrapper,
  results,
) {
  if (!results.length) {
    return searchWrapper.classList.remove("show-suggestions");
  }

  const content = results
    .map((item, index) => {
      let splitItem = item.split("->");
      let formatedItem = `${splitItem[0]} <b> ID:${splitItem[1].trim()} </b>`;

      let cl = "";
      if (index === 0) {
        cl = "active_search_item";
      }
      return `
      <li class="${cl}" tabindex="-1" >${formatedItem}
        <button type="button" tabindex="-1" class="addButton" >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
        </button>
      </li>`;
    })
    .join("");

  searchWrapper.classList.add("show-suggestions");
  resultsWrapper.innerHTML = `<ul tabindex="-1">${content}</ul>`;
}

/* Displays / injects the selected species into a container (ul).
 * @param content string The content to be fetched.
 * @param listElemCounter int An indexer for the elements.
 * @param taxid string The taxid to be assigned to the element as an attribute.
 * @return void
 * */
function displaySelection(content, listElemCounter, taxid) {
  const collectorList = document.querySelector(".inputCollector ul");
  collectorList.innerHTML += `
  <li id="${listElemCounter}" value="${taxid}" >${content}
    <button class="removeButton" >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
      </svg>
    </button>
  </li>`;
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
function addKeyDownTriggers(
  searchInput,
  searchableSpecies,
  searchWrapper,
  resultsWrapper,
) {
  searchInput.addEventListener("keyup", (e) => {
    const keysToIgnore = [40, 38, 13];

    if (keysToIgnore.includes(e.which)) {
      resultsWrapper.addEventListener("focus", () => {
        resultsWrapper.style.outlineColor = "#152238";
        resultsWrapper.style.outline = "";
      });
      resultsWrapper.focus();
    } else if (e.which === 27) {
      searchWrapper.classList.remove("show-suggestions");
    } else if (!keysToIgnore.includes(e.keycode)) {
      let results = [];
      let input = searchInput.value;

      if (input.length) {
        results = searchableSpecies.filter((item) => {
          return item.toLowerCase().includes(input.toLowerCase());
        });
      }
      renderSuggestions(searchInput, searchWrapper, resultsWrapper, results);

      const resultList = document.querySelectorAll(".results ul li");
      const regExp = /\[([^)]+)\]/;

      let taxid;
      let listItems;
      let listElemCounter = 0;

      let collector;
      const isEmpty = (elem) => !elem.innerHTML.trim().length;

      resultList.forEach((elem) => {
        elem.addEventListener("click", async function (e) {
          let selections = Array.from(
            document.querySelectorAll(".inputCollector ul li"),
          ).map((e) => {
            return e.attributes.value.value;
          });

          taxid = regExp.exec(elem.outerText)[1];
          if (!selections.includes(taxid)) {
            document.querySelector(".inputCollectorWrapper").style.display =
              "block";
            displaySelection(elem.outerText, listElemCounter, taxid);
            listElemCounter++;

            // Update the array of querySelector after each append.
            listItems = document.querySelectorAll(".inputCollector ul li");
            // Re-add the remove eventlisteners for the new list items
            listItems.forEach((elem) => {
              const removeButton = elem.querySelector(".removeButton");
              removeButton.addEventListener("click", function () {
                const regExp = /\[([^)]+)\]/;
                taxid = regExp.exec(elem.outerText)[1];
                elem.parentNode.removeChild(elem);

                collector = document.querySelector(".inputCollectorWrapper ul");
                if (isEmpty(collector)) {
                  collector.parentElement.parentElement.style.display = "none";
                }
              });
            });
          }
        });
      });
    }
  });
}

// ########################################################################
// MOVEMENT TRIGGERS AND FUNCTIONS ON THE AUTOCOMPLETE SEARCH BAR
// ########################################################################

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
   This function is used by: "addMovementTriggers"
 *
 * @param x object List element to be selected by keyboard interaction.
 * @param currentFocus int The index of list element which is currently focused on.
 * @return int Index of the new focused element.
 * */
function changeSelection(x, currentFocus) {
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;

  removeActive(x);

  try {
    x[currentFocus].classList.add("active_search_item");
  } catch {
    // "Ignore the initial x[currentFocus] is undefined."
  }

  return currentFocus;
}

/* Adds interaction keys (like arrows, esc, etc..).
   This function is used by: "initAutocompleteArray"
 * @param searchInput object Element of the input text bar.
 * @param searchWrapper object Wrapper / Container to fetch the suggestions.
 * @return void
 * */
function addMovementTriggers(searchInput, searchWrapper, resultsWrapper) {
  let currentFocus = 0;
  let currentItem;
  let x = document.querySelector(".results");
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
          try {
            currentItem.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          } catch {}
          searchInput.setSelectionRange(1000, 1000);
          break;

        case 27:
          searchInput.blur();
          searchWrapper.classList.remove("show-suggestions");
          break;

        case 13:
          break;

        case 9:
          document.querySelector(".removeButton").focus();
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
        try {
          document.querySelector(".active_search_item").click();
        } catch {
          // Ignore undefined.
          currentFocus = changeSelection(x, currentFocus);
        }

        // currentFocus = currentFocus - 1;
      }

      e.preventDefault();
    },
    false,
  );

  let suggestionPanel = document.querySelector(".results");
  suggestionPanel.addEventListener("mouseover", function () {
    currentFocus = -1;
    removeActive(x);
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

/* Activates the click event on the clear button,
 * which clears the all the sub-filter selections.
 *
 * @return void
 * */
function activateClearButton() {
  const clearButton = document.querySelector(".clearButton");
  const isEmpty = (elem) => !elem.innerHTML.trim().length;

  clearButton.addEventListener("click", () => {
    document.querySelector(".inputCollector ul").innerHTML = "";

    let collector = document.querySelector(".inputCollectorWrapper ul");
    if (isEmpty(collector)) {
      collector.parentElement.parentElement.style.display = "none";
    }
  });
}

// #######################################################################

/* Activates the click event on the include button.
 * Creates and formats a URL and
 * fetches it to the backend with the parameters collected from the user's selection.
 * @param initHeatmap_callback function Initializes the heatmap interface
 *                                      with the received data.
 * @return void
 * */
export function activateIncludeButton(initHeatmap_callback) {
  /*Forwards to the backend on click event.
   * This function is used by: "initAutocompleteArray"*/

  const includeButton = document.querySelector("#includeButton");
  includeButton.addEventListener("click", async function sendingRequest() {
    includeButton.removeEventListener("click", sendingRequest);

    document.querySelector(".error-message-container").style.display = "none";

    let listItems = document.querySelectorAll(".inputCollector ul li");

    let collector = [];
    listItems.forEach((e) => {
      collector.push(e.value);
    });

    // Save the current searched taxonomy IDs
    // and remove the previous "filteredURL" pair from the session storage.
    sessionStorage["queriedTaxIDs"] = collector;
    sessionStorage.removeItem("filteredURL");

    // Get the "reduced_search" flag.
    let reduced_search = false;

    const radioButtonSelection = document.querySelector(
      ".pre-search-range-filter[name=pre-search-range-filter]:checked",
    ).value;

    if (radioButtonSelection === "top100Phy") {
      reduced_search = true;
    }

    const url = `${window.origin}/phylo-explorer-service/explorer_json`;
    sessionStorage["initialURL"] = url;
    sessionStorage["initialCollector"] = collector;
    sessionStorage["initialReducedSearchVal"] = reduced_search
    displayLoadingGIF();
    const init_response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search_taxids: collector,
        reduced_search: reduced_search,
      }),
    });

    const heatmapJSON = await init_response.json();
    hideLoadingGIF();

    // const heatmapJSON = await getAPI(url);

    if (heatmapJSON.error) {
      injectErrorMessage(heatmapJSON.error);
      activateIncludeButton(initHeatmap_callback);
    } else {
      document.querySelector(".matrixInput").style.display = "none";
      document.querySelector(".heatmap-init-info").style.display = "none";
      initHeatmap_callback(heatmapJSON);
    }
  });
}

/* Calls everything in the correct order.
 * This function is the "main".
 * Being imported in the "/clustered_heatmap_explorer.js" main file.
 * @return void
 * */
export async function initAutocompleteSearchBar() {
  // Main function!
  const initResponse = await fetch(
    `${window.origin}/phylo-explorer-service/all_species_heatmap`,
  );
  const searchableSpecies = await initResponse.json();

  const searchInput = document.getElementById("matrixSearch");
  const searchWrapper = document.querySelector(".matrixInputWrapper");
  const resultsWrapper = document.querySelector(".results");

  hideEmptyState(searchInput, searchWrapper);
  addKeyDownTriggers(
    searchInput,
    searchableSpecies,
    searchWrapper,
    resultsWrapper,
  );
  addMovementTriggers(searchInput, searchWrapper, resultsWrapper);
  activateClearButton();
}
