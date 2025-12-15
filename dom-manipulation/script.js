// Example quotes array
let quotes = [
  "The future belongs to those who prepare for it today.",
  "Innovation distinguishes between a leader and a follower.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts."
];

let currentIndex = 0;

// Load quotes from localStorage on initialization
const storedQuotes = localStorage.getItem("quotes");
if (storedQuotes) {
  try {
    quotes = JSON.parse(storedQuotes);
  } catch (e) {
    console.error("Error parsing stored quotes", e);
  }
}

// Load last viewed quote from sessionStorage
const lastViewedIndex = sessionStorage.getItem("lastViewedQuoteIndex");
if (lastViewedIndex !== null) {
  currentIndex = parseInt(lastViewedIndex, 10);
}

// Display current quote
function displayCurrentQuote() {
  const quoteEl = document.getElementById("currentQuote");
  if (quoteEl) {
    quoteEl.textContent = quotes[currentIndex];
  }
  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastViewedQuoteIndex", currentIndex);
}

// Show next quote
function showNextQuote() {
  currentIndex = (currentIndex + 1) % quotes.length;
  displayCurrentQuote();
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Export quotes to JSON file
function exportToJsonFile(jsonData, fileName = "quotes.json") {
  const dataStr = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event, callback) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      callback(jsonData);
    } catch (error) {
      console.error("Invalid JSON file", error);
    }
  };
  reader.readAsText(file);
}

// Setup event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Display current quote on page load
  displayCurrentQuote();

  // Next quote button
  const nextBtn = document.getElementById("nextQuoteBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      showNextQuote();
    });
  }

  // Export quotes button
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      exportToJsonFile(quotes, "quotes.json");
    });
  }

  // Import quotes file input
  const fileInput = document.getElementById("jsonFileInput");
  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      importFromJsonFile(event, function (importedQuotes) {
        quotes = importedQuotes;
        saveQuotes(); // Save new quotes to localStorage
        currentIndex = 0;
        displayCurrentQuote();
      });
    });
  }
});
