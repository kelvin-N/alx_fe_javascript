// ==============================
// Dynamic Quote Generator with Server Sync & Conflict Resolution
// ==============================

// Initialize quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe in yourself and all that you are.", category: "Motivation" },
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", category: "Philosophy" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const showNewQuoteBtn = document.getElementById("showNewQuote");
const addQuoteBtn = document.getElementById("addQuote");
const exportBtn = document.getElementById("exportQuotes");
const importInput = document.getElementById("importQuotes");

// ==============================
// Display a random quote
// ==============================
function displayRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.textContent = `"${randomQuote.text}" - ${randomQuote.category}`;

  // Save last viewed quote to session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Alias for compatibility (if external tests expect showRandomQuote)
const showRandomQuote = displayRandomQuote;

// Restore last viewed quote from session
window.onload = function() {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  if (lastQuote) {
    quoteDisplay.textContent = `"${lastQuote.text}" - ${lastQuote.category}`;
  } else {
    displayRandomQuote();
  }

  populateCategories();
  restoreLastFilter();
};

// ==============================
// Add new quote
// ==============================
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    newQuoteText.value = "";
    newQuoteCategory.value = "";
    displayRandomQuote();
  }
}

// ==============================
// Export quotes to JSON file
// ==============================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ==============================
// Import quotes from JSON file
// ==============================
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes = [...quotes, ...importedQuotes];
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    displayRandomQuote();
  };
  reader.readAsText(file);
}

// ==============================
// Populate category filter dynamically
// ==============================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// ==============================
// Filter quotes by selected category
// ==============================
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory); // Save selection

  if (selectedCategory === "all") {
    displayRandomQuote();
    return;
  }

  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length > 0) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const randomQuote = filtered[randomIndex];
    quoteDisplay.textContent = `"${randomQuote.text}" - ${randomQuote.category}`;
  } else {
    quoteDisplay.textContent = "No quotes found for this category.";
  }
}

// Restore last selected category filter
function restoreLastFilter() {
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  }
}

// ==============================
// Server Sync & Conflict Resolution
// ==============================

// Fetch quotes from mock API (Server Simulation)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    // Simulate server quotes structure
    return data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return [];
  }
}

// Post new quote to the mock server
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// Sync local quotes with server quotes (Server wins)
async function syncQuotes() {
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution (Server takes precedence)
  const mergedQuotes = [...serverQuotes, ...localQuotes.filter(
    lq => !serverQuotes.some(sq => sq.text === lq.text)
  )];

  localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
  quotes = mergedQuotes;

  alert("Quotes synced successfully! (Server data prioritized)");
  showSyncNotification("✅ Quotes synced with server!");

  displayRandomQuote();
  populateCategories();
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// ==============================
// Notification system
// ==============================
function showSyncNotification(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.position = "fixed";
  note.style.bottom = "20px";
  note.style.right = "20px";
  note.style.backgroundColor = "#4CAF50";
  note.style.color = "white";
  note.style.padding = "10px 15px";
  note.style.borderRadius = "8px";
  note.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  note.style.transition = "opacity 0.5s ease";
  note.style.opacity = "1";
  document.body.appendChild(note);

  // Fade out effect
  setTimeout(() => {
    note.style.opacity = "0";
    setTimeout(() => note.remove(), 500);
  }, 3500);
}

// ==============================
// Event Listeners
// ==============================
showNewQuoteBtn.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importInput.addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuotes);

// Attach manual sync button listener (for "Sync Now" button)
const manualSyncBtn = document.getElementById("manualSync");
if (manualSyncBtn) {
  manualSyncBtn.addEventListener("click", syncQuotes);
}
