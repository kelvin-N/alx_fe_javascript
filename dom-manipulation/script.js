// Example quotes array with categories
let quotes = [
  { text: "The future belongs to those who prepare for it today.", category: "Motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "Cybersecurity is everyone's responsibility.", category: "Tech" }
];

// Current category and element references
let currentCategory = "All";

// Load last selected category from localStorage
const savedCategory = localStorage.getItem("selectedCategory");
if (savedCategory) currentCategory = savedCategory;

// Display a random quote in the selected category
function displayRandomQuote() {
  const filteredQuotes = quotes.filter(q => currentCategory === "All" || q.category === currentCategory);
  const quoteDisplay = document.getElementById("currentQuote");

  if (!quoteDisplay) return;

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Filter quotes based on selected category
function filterQuote(event) {
  currentCategory = event.target.value;
  localStorage.setItem("selectedCategory", currentCategory);
  displayRandomQuote();
}

// Populate categories in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  const categories = ["All", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";

  categories.map(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === currentCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  // Populate dropdown and display first random quote
  populateCategories();
  displayRandomQuote();

  // Handle category changes
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) categoryFilter.addEventListener("change", filterQuote);

  // Next quote button
  const nextBtn = document.getElementById("nextQuoteBtn");
  if (nextBtn) nextBtn.addEventListener("click", displayRandomQuote);

  // Export quotes button
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      exportToJsonFile(quotes, "quotes.json");
    });
  }

  // Import quotes from file
  const fileInput = document.getElementById("jsonFileInput");
  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      importFromJsonFile(event, function (importedQuotes) {
        quotes = importedQuotes;
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        displayRandomQuote();
      });
    });
  }
});

// Export to JSON function
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

// Import from JSON function
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
