import {
    initAutocompleteSearchBar,
    activateIncludeButton,
} from "./components/heatmap_presearch_bar.js";
import { initHeatmap } from "./components/heatmap_build.js";

// MAIN
// ################################################################################
/* Initializing the autocomplete search-bar
 * and passing in the "initHeatmap" function as a callback parameter,
 * which is to be called when click event happens on the "include" button.
 * */
(async () => {
    initAutocompleteSearchBar();
    activateIncludeButton(initHeatmap);
})();
// ################################################################################
