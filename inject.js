console.log("[AutoTrader Multi-Make] 🔄 Loaded");

// Listen for messages from the page script
window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) return;
  
  // Check if it's our clear selections message
  if (event.data && event.data.type === 'ATM_CLEAR_ALL_SELECTIONS') {
    console.log("[AutoTrader Multi-Make] Received clear request from page");
    
    // Clear the selected makes
    chrome.storage.sync.set({ selectedMakes: [] }, function() {
      console.log("[AutoTrader Multi-Make] Selections cleared due to Clear All button");
      
      // Also notify background script to update badge
      chrome.runtime.sendMessage({ action: 'updateBadge' });
    });
  }
});

// Watch for interactions with AutoTrader's native make/model filters
function setupFilterWarning() {
  // Simple function to add click listeners to filters
  function monitorFilters() {
    // Find all make and model dropdowns
    const filters = document.querySelectorAll('select[name="make"], select[name="model"]');
    
    // Add click listeners to each filter
    filters.forEach(filter => {
      if (!filter.hasAttribute('data-atm-monitored')) {
        filter.setAttribute('data-atm-monitored', 'true');
        filter.addEventListener('click', showWarningIfNeeded);
      }
    });
  }
  
  // Check for existing filters first
  monitorFilters();
  
  // Watch for filters that might be added later
  const observer = new MutationObserver(() => {
    monitorFilters();
  });
  
  // Start watching the page
  observer.observe(document, { childList: true, subtree: true });
  
  // Show warning if user has selected makes in our extension
  function showWarningIfNeeded(e) {
  chrome.storage.sync.get("selectedMakes", ({ selectedMakes }) => {
    if (selectedMakes && selectedMakes.length > 0) {
      const filterType = e.target.name === "model" ? "model" : "make";

      if (confirm(`You have car makes selected in the Multi-Make extension.\n\nUsing AutoTrader's native ${filterType} filters might cause unexpected results.\n\nWould you like to clear your Multi-Make selections now?`)) {
        chrome.storage.sync.set({ selectedMakes: [] }, () => {
          console.log("[AutoTrader Multi-Make] Selections cleared, requesting tab reload...");

          // ✅ Send message to background script to reload the tab
          chrome.runtime.sendMessage({ action: 'reload_tab' });
        });
      }
    }
  });
}

}

// List of valid car makes for validation
const validMakes = [
  "Abarth", "AC", "AK", "Alfa Romeo", "Allard", "Alpine", "Alvis", "Ariel", "Aston Martin", "Audi",
  "Austin", "BAC", "Beauford", "Bentley", "BMW", "Bramwith", "Bugatti", "BYD", "Cadillac", "Caterham",
  "Chesil", "Chevrolet", "Chrysler", "Citroen", "Corbin", "Corvette", "CUPRA", "Dacia", "Daewoo", "Daihatsu",
  "Daimler", "Datsun", "Dax", "DFSK", "Dodge", "DS AUTOMOBILES", "E-COBRA", "Ferrari", "Fiat", "Fisher",
  "Fisker", "Ford", "Gardner Douglas", "GBS", "Genesis", "Gentry", "GMC", "Great Wall", "GWM", "Honda",
  "Hummer", "Hyundai", "INEOS", "Infiniti", "ISO", "Isuzu", "Iveco", "JAECOO", "Jaguar", "JBA",
  "Jeep", "Jensen", "KGM", "Kia", "Koenigsegg", "Lada", "Lamborghini", "Lancia", "Land Rover", "LDV",
  "Leapmotor", "LEVC", "Lexus", "Leyland", "Lincoln", "Lister", "London Taxis International", "Lotus", "Ludis Currus", "Mahindra",
  "Marcos", "Maserati", "MAXUS", "Maybach", "Mazda", "McLaren", "Mercedes-Benz", "MEV", "MG", "Micro",
  "MINI", "Mitsubishi", "Mitsuoka", "MK", "MNR", "MOKE", "Morgan", "Morris", "Nardini", "NG",
  "Nissan", "Noble", "Oldsmobile", "Omoda", "Opel", "Panther", "Perodua", "Peugeot", "PGO", "Pilgrim",
  "Plymouth", "Polestar", "Pontiac", "Porsche", "Porsche Singer", "Proton", "Radical", "Rage", "Ram", "RBW",
  "Reliant", "Renault", "Riley", "Robin Hood", "Rolls-Royce", "Rover", "Saab", "SEAT", "Shelby", "Skoda",
  "Skywell", "Smart", "SsangYong", "Subaru", "Sunbeam", "Suzuki", "Tesla", "Tiger", "Tornado", "Toyota",
  "Tribute", "Triumph", "TVR", "Ultima", "Vauxhall", "Volkswagen", "Volvo", "Westfield", "Wolseley", "XPENG",
  "Zenos"
];

chrome.storage.sync.get("selectedMakes", ({ selectedMakes }) => {
  // Validate makes against our approved list to prevent injection
  const makes = (selectedMakes || []).filter(make => 
    typeof make === 'string' && validMakes.includes(make)
  );
  
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("page-inject.js");
  script.setAttribute("data-makes", JSON.stringify(makes));
  script.setAttribute("type", "text/javascript");

  (document.head || document.documentElement).appendChild(script);
  script.remove();
  
  // Setup filter warning system
  setupFilterWarning();
  
  // Log status
  if (makes && makes.length > 0) {
    console.log("[AutoTrader Multi-Make] Active with", makes.length, "makes selected");
  }
});
