// popup.js

// List of car makes from AutoTrader
const allMakes = [
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

const makesListEl = document.getElementById("makesList");
const searchInput = document.getElementById("searchInput");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const statusEl = document.getElementById("status");
const selectedDisplayEl = document.getElementById("selectedMakesDisplay");

let tempSelectedMakes = [];

// Render filtered list with checkboxes
function renderMakes(filter = "") {
  makesListEl.innerHTML = "";

  const filtered = allMakes.filter(make =>
    make.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach(make => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = make;
    checkbox.name = "make";
    checkbox.checked = tempSelectedMakes.includes(make);

    // Update tempSelectedMakes on change
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (!tempSelectedMakes.includes(make)) tempSelectedMakes.push(make);
      } else {
        tempSelectedMakes = tempSelectedMakes.filter(m => m !== make);
      }
      updateSelectedDisplay(tempSelectedMakes);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + make));
    makesListEl.appendChild(label);
  });
}

// Save to storage with validation
saveBtn.addEventListener("click", () => {
  // Validate that all selected makes are actually in our approved list
  const validatedMakes = tempSelectedMakes.filter(make => allMakes.includes(make));
  
  // If any invalid makes were filtered out, show a warning
  if (validatedMakes.length !== tempSelectedMakes.length) {
    statusEl.textContent = "Warning: Invalid selections removed!";
    tempSelectedMakes = validatedMakes;
    updateSelectedDisplay(validatedMakes);
    renderMakes(searchInput.value);
  }
  
  chrome.storage.sync.set({ selectedMakes: validatedMakes }, () => {
    statusEl.textContent = "Saved!";
    
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      
      // Only refresh if we're on AutoTrader
      if (currentTab && currentTab.url && currentTab.url.includes('autotrader.co.uk')) {
        chrome.tabs.reload(currentTab.id);
      }
    });
    
    setTimeout(() => (statusEl.textContent = ""), 1500);
  });
});

// Clear all
clearBtn.addEventListener("click", () => {
  tempSelectedMakes = [];
  chrome.storage.sync.set({ selectedMakes: [] }, () => {
    renderMakes(searchInput.value);
    updateSelectedDisplay([]);
    statusEl.textContent = "Cleared!";
    
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      
      // Only refresh if we're on AutoTrader
      if (currentTab && currentTab.url && currentTab.url.includes('autotrader.co.uk')) {
        chrome.tabs.reload(currentTab.id);
      }
    });
    
    setTimeout(() => (statusEl.textContent = ""), 1500);
  });
});

// Search
searchInput.addEventListener("input", () => {
  renderMakes(searchInput.value);
});

// Display selected
function updateSelectedDisplay(makes) {
  const warningMsg = document.getElementById("warningMsg");
  
  if (!makes.length) {
    selectedDisplayEl.textContent = "Selected: None";
    warningMsg.style.display = "none";
  } else {
    selectedDisplayEl.textContent = `Selected: ${makes.join(", ")}`;
    warningMsg.style.display = "block";
  }
}

// Init: load selected makes into temp
chrome.storage.sync.get("selectedMakes", ({ selectedMakes }) => {
  tempSelectedMakes = selectedMakes || [];
  renderMakes();
  updateSelectedDisplay(tempSelectedMakes);
});

// Add privacy policy link handler
document.getElementById('privacyLink').addEventListener('click', (e) => {
  e.preventDefault();
  // Open the privacy policy in a new tab
  chrome.tabs.create({ url: chrome.runtime.getURL('privacy.html') });
});

