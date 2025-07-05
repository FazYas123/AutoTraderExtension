// background.js - Handles badge updates and persistent features

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;
let inactivityTimer;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    updateBadge();
  }
});

// Function to update the badge with the current number of selected makes
function updateBadge() {
  chrome.storage.sync.get("selectedMakes", ({ selectedMakes }) => {
    const count = selectedMakes ? selectedMakes.length : 0;
    
    // Always show badge - display count when makes selected, otherwise "0"
    chrome.action.setBadgeText({ 
      text: count.toString()
    });
    
    // Set badge background color based on whether makes are selected
    chrome.action.setBadgeBackgroundColor({ 
      color: count > 0 ? "#4CAF50" : "#888888" 
    });
    
    // Update tooltip to show selected makes
    let tooltip = "AutoTrader Multi-Make Search";
    if (count > 0) {
      tooltip += `: ${selectedMakes.join(", ")}`;
    } else {
      tooltip += ": No makes selected";
    }
    chrome.action.setTitle({ title: tooltip });
    
    // Reset the inactivity timer if makes are selected
    if (count > 0) {
      resetInactivityTimer();
    } else {
      clearInactivityTimer();
    }
  });
}

// Function to reset the inactivity timer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    // Auto-clear selections after timeout period
    chrome.storage.sync.set({ selectedMakes: [] }, () => {
      updateBadge();
      showNotification("AutoTrader Multi-Make", "Your selected car makes have been automatically cleared due to inactivity.");
    });
  }, SESSION_TIMEOUT);
}

// Function to clear the inactivity timer
function clearInactivityTimer() {
  clearTimeout(inactivityTimer);
}

// Function to show a notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message,
    priority: 1
  });
}

// Listen for tab updates to detect when user is on AutoTrader
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('autotrader.co.uk')) {
    // User is on AutoTrader, refresh their inactivity timer
    resetInactivityTimer();
  }
});

// Listen for changes to storage to update the badge
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.selectedMakes) {
    updateBadge();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "reload_tab") {
    // Fallback: use sender.tab.id if available, otherwise reload current active tab
    if (sender && sender.tab && sender.tab.id) {
      chrome.tabs.reload(sender.tab.id);
    } else {
      // Safely find the current active tab to reload
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    }
  }
});


// Update badge when extension loads
updateBadge();

// Listen for installation or update
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default values
  chrome.storage.sync.get("selectedMakes", ({ selectedMakes }) => {
    if (!selectedMakes) {
      chrome.storage.sync.set({ selectedMakes: [] });
    }
  });
  updateBadge();
});
