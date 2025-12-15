// Example quotes array with categories
let quotes = [
  { text: "The future belongs to those who prepare for it today.", category: "Motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "Cybersecurity is everyone's responsibility.", category: "Tech" }
];

let currentIndex = 0;
let currentCategory = "All";

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

// Load last selected category from localStorage
const savedCategory = localStorage.getItem("selectedCategory");
if (savedCategory) {
  currentCategory = savedCategory;
}

// Display current quote
function displayCurrentQuote() {
  const quoteEl = document.getElementById("currentQuote");
  if (!quoteEl) return;

  const filteredQuotes = quotes.filter(q => currentCategory === "All" || q.category === currentCategory);
  if (filteredQuotes.length === 0) {
    quoteEl.textContent = "No quotes in this category.";
    return;
  }

  currentIndex = currentIndex % filteredQuotes.length;
  quoteEl.textContent = filteredQuotes[currentIndex].text;

  // Save last viewed quote index
  sessionStorage.setItem("lastViewedQuoteIndex", currentIndex);
}

// Show next quote
function showNextQuote() {
  const filteredQuotes = quotes.filter(q => currentCategory === "All" || q.category === currentCategory);
  currentIndex = (currentIndex + 1) % filteredQuotes.length;
  displayCurrentQuote();
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Export quotes
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

// Import quotes
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

// Populate category dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  // Extract unique categories
  const categories = ["All", ...new Set(quotes.map(q => q.category))];

  // Clear existing options
  categoryFilter.innerHTML = "";

  // Populate dropdown
  categories.map(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === currentCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// Filter quotes based on selected category
function filterQuote(event) {
  currentCategory = event.target.value;
  localStorage.setItem("selectedCategory", currentCategory);
  currentIndex = 0;
  displayCurrentQuote();
}

// Setup event listeners
document.addEventListener("DOMContentLoaded", function () {
  displayCurrentQuote();
  populateCategories();

  // Next quote button
  const nextBtn = document.getElementById("nextQuoteBtn");
  if (nextBtn) nextBtn.addEventListener("click", showNextQuote);

  // Export button
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.addEventListener("click", function () {
    exportToJsonFile(quotes, "quotes.json");
  });

  // Import file input
  const fileInput = document.getElementById("jsonFileInput");
  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      importFromJsonFile(event, function (importedQuotes) {
        quotes = importedQuotes;
        saveQuotes();
        currentIndex = 0;
        displayCurrentQuote();
        populateCategories();
      });
    });
  }

  // Category filter change
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterQuote);
  }
});
