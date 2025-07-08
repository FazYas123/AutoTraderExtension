# AutoTrader Multi-Make Search

**Search for multiple car brands at once on AutoTrader.co.uk!** 
This Chrome extension overcomes AutoTrader's limitation of only searching one make at a time, allowing you to see results from multiple brands in a single search.

## What This Extension Does

This extension allows you to:
- **Search across multiple car brands** simultaneously (e.g., BMW, Audi, and Mercedes all at once)
- **Save time** by avoiding multiple separate searches for each car make
- **Compare options** across different brands in a single search view
- **Maintain full compatibility** with AutoTrader's other search filters (price, mileage, etc.)

## Features

- Select multiple car brands to include in your AutoTrader searches
- Simple and intuitive interface with search functionality
- Seamlessly integrates with AutoTrader's existing search system
- Real-time badge shows how many makes are currently selected
- Smart conflict detection for both make and model filters
- All selections saved locally in your browser

## How It Works

This extension intercepts and modifies the search API requests that AutoTrader makes to its backend. When you select multiple makes in the extension popup, those selections are injected into AutoTrader's search queries, enabling you to see results from all selected brands in a single search view.

## Installation - locally without downloading the extension

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer Mode" in the top right
4. Click "Load Unpacked" and select the repo (this one you just cloned)
5. The extension icon should appear in your toolbar

## Usage

### Setting Up Your Multi-Make Search

#### When on the home page
1. Visit [AutoTrader.co.uk](https://www.autotrader.co.uk/)
2. Click the extension icon in your toolbar (or press Alt+A keyboard shortcut)
3. Select all the car makes you want to search for simultaneously
4. Click "Save" - the page will automatically refresh
5. The badge on the extension icon shows the number of selected makes (green when makes are selected)
6. Then click "Search Cars"

#### When on the search list page
1. Click the extension icon in your toolbar (or press Alt+A keyboard shortcut)
2. Select all the car makes you want to search for simultaneously
3. Click "Save" - the page will automatically refresh and show your selected makes
4. The badge on the extension icon shows the number of selected makes (green when makes are selected)

### How to Know It's Working
- The extension badge displays the number of selected makes
- Your search results will include cars from all selected makes
- When viewing search results, the extension automatically removes any model filters that would cause conflicts

### Clearing Your Selections
You can clear your multi-make selections in any of these ways:
- Click the extension icon and press the "Clear" button
- Click any "Clear all" button on the AutoTrader website
- Use AutoTrader's native make or model filters (after confirming the warning)
- Wait for the automatic timeout (selections clear after 30 minutes of inactivity)

### Important Tips
- **Always clear your selections** before using AutoTrader's native make/model filters
- If you receive a warning when clicking on make/model filters, choose to clear your selections
- The extension automatically refreshes the page when you save or clear selections
- If search results seem incorrect, try clearing your selections and starting over

### Conflict Prevention

The extension automatically:
- Monitors both make and model filter dropdowns on AutoTrader
- Shows a warning if you try to use AutoTrader's native filters while you have makes selected
- Offers to clear your multi-make selections to prevent search conflicts
- Removes incompatible model/variant filters to prevent "no results" scenarios
- Synchronizes with AutoTrader's "Clear all" buttons

## Privacy

This extension:
- Only stores your selected car makes locally in your browser
- Does not collect any personal information
- Does not transmit any data to external servers
- Does not track your browsing history

For more details, see the [Privacy Policy](privacy.html).

## License

MIT License

## Compliance

The use of information received from Google APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
