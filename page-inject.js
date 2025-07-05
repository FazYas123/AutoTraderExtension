(function () {
  const selectedMakes = JSON.parse(document.currentScript.getAttribute('data-makes') || "[]");
  console.log("[AutoTrader Multi-Make] - Running with selectedMakes:", selectedMakes);

  // Monitor "Clear all" buttons on the page
  function monitorClearButtons() {
    // Find all buttons on the page
    const allButtons = document.querySelectorAll('button');
    
    // Filter for buttons with "Clear all" text
    allButtons.forEach(button => {
      // Only add listener if button has "Clear all" text and hasn't been processed
      if (button.textContent.trim() === "Clear all" && !button.hasAttribute('data-atm-processed')) {
        button.setAttribute('data-atm-processed', 'true');
        
        button.addEventListener('click', () => {
          console.log("[AutoTrader Multi-Make] Clear all button clicked - clearing extension makes");
          
          try {
            // Send message to clear selections
            window.postMessage({ type: "ATM_CLEAR_ALL_SELECTIONS" }, "*");
            
            // Also force a page reload after a short delay to ensure changes take effect
            setTimeout(() => {
              location.reload();
            }, 500);
          } catch (e) {
            console.error("[AutoTrader Multi-Make] Error clearing selections:", e);
          }
        });
      }
    });
  }
  
  // Run the monitor function initially
  monitorClearButtons();
  
  // Check periodically for new buttons
  setInterval(monitorClearButtons, 1000);
  
  // ❌ Do nothing if the user hasn't selected any makes
  if (!selectedMakes || selectedMakes.length === 0) {
    console.log("[AutoTrader Multi-Make] - No selected makes found. Not patching requests.");
    return;
  }

  const originalFetch = window.fetch;

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;

    if (
      url.includes("/at-gateway") &&
      init?.method === "POST" &&
      init?.body?.includes("SearchResultsListingsGridQuery")
    ) {
      try {
        const body = JSON.parse(init.body);

        // Helper function to process filters within a query
        const processFilters = (operation, operationName) => {
          // Ensure filters array exists
          if (!operation.variables || !operation.variables.filters || !Array.isArray(operation.variables.filters)) {
            console.error(`[AutoTrader Multi-Make] - Invalid request structure in ${operationName}, missing filters array`);
            return operation;
          }

          const filters = operation.variables.filters;

          // 1. Handle the make filter - update existing or add new one
          const makeIndex = filters.findIndex(f => f.filter === "make");

          if (makeIndex >= 0) {
            console.log(`[AutoTrader Multi-Make] - ${operationName}: Replacing make(s) ${filters[makeIndex].selected} → ${selectedMakes}`);
            filters[makeIndex].selected = selectedMakes;
          } else {
            console.log(`[AutoTrader Multi-Make] - ${operationName}: Adding make filter: ${selectedMakes}`);
            filters.push({ filter: "make", selected: selectedMakes });
          }

          // 2. Remove model-related filters that could cause "no results" with the new makes
          const incompatibleFilters = ["model", "aggregated_trim", "derivative", "variant"];
          
          // Find all incompatible filters at once
          const filterIndicesToRemove = filters
            .map((filter, index) => ({ name: filter.filter, index }))
            .filter(item => incompatibleFilters.includes(item.name))
            .map(item => item.index)
            .sort((a, b) => b - a); // Sort in reverse order to avoid shifting issues
          
          // Remove incompatible filters if found
          if (filterIndicesToRemove.length > 0) {
            filterIndicesToRemove.forEach(index => {
              console.log(`[AutoTrader Multi-Make] - ${operationName}: Removing ${filters[index].filter} filter to prevent conflicts:`, 
                filters[index].selected);
              filters.splice(index, 1);
            });
          }
          
          // Log the modified search request
          console.log(`[AutoTrader Multi-Make] - ${operationName} modified filters:`, 
            filters.map(f => `${f.filter}:${JSON.stringify(f.selected)}`).join(', '));
          
          return operation;
        };

        // Process each entry in the request
        const patch = (entry) => {
          // Handle the main search query
          if (entry.operationName === "SearchResultsListingsGridQuery") {
            return processFilters(entry, "SearchResultsListingsGridQuery");
          }
          
          // Handle the facets/filters query
          if (entry.operationName === "SearchResultsFacetsWithGroupsQuery") {
            return processFilters(entry, "SearchResultsFacetsWithGroupsQuery");
          }
          
          // Return unchanged for any other operation types
          return entry;
        };

        const newBody = Array.isArray(body) ? body.map(patch) : patch(body);
        init.body = JSON.stringify(newBody);
      } catch (err) {
        console.error("[AutoTrader Multi-Make - Injected] ❌ Failed to patch at-gateway body:", err);
      }
    }

    return originalFetch(input, init);
  };
})();
