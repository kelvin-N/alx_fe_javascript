// ==============================
// Dynamic Quote Generator with Server Sync & Conflict Resolution (Async + Mock API)
// ==============================

// Initialize quotes array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Inspiration" }
];

// DOM Elements
const quoteText = document.getElementById('quote-text');
const quoteCategory = document.getElementById('quote-category');
const newQuoteBtn = document.getElementById('new-quote');
const addQuoteBtn = document.getElementById('add-quote');
const statusMsg = document.getElementById('status');

// ==============================
// Display Random Quote
// ==============================
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteText.textContent = quote.text;
  quoteCategory.textContent = `— ${quote.category}`;
}

// ==============================
// Add a New Quote (Local)
// ==============================
function addQuote() {
  const text = prompt("Enter the quote:");
  const category = prompt("Enter the category:");
  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    showStatus("✅ New quote added locally!");
    syncQuotes(); // auto-sync after adding
  }
}

// ==============================
// Fetch Quotes from Mock API (GET)
// ==============================
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // Convert mock posts to quote-like objects
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    updateLocalStorage(serverQuotes);
    showStatus("🔔 Quotes updated from mock API server!");
  } catch (error) {
    console.error("Error fetching quotes:", error);
    showStatus("⚠️ Failed to fetch quotes from server.");
  }
}

// ==============================
// Sync Quotes to Mock API (POST)
// ==============================
async function syncQuotes() {
  try {
    showStatus("🔄 Syncing quotes with mock API server...");
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });

    const data = await response.json();
    console.log("Server sync response:", data);
    showStatus("✅ Quotes successfully synced with mock API server!");
  } catch (error) {
    console.error("Error syncing quotes:", error);
    showStatus("⚠️ Could not sync with server. Will retry later.");
  }
}

// ==============================
// Update Local Storage with Conflict Resolution
// ==============================
function updateLocalStorage(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const merged = [...localQuotes];

  // Merge server quotes without duplicates (by text)
  serverQuotes.forEach(serverQuote => {
    const exists = localQuotes.find(q => q.text === serverQuote.text);
    if (!exists) merged.push(serverQuote);
  });

  localStorage.setItem("quotes", JSON.stringify(merged));
  quotes = merged;
  displayRandomQuote();
}

// ==============================
// Utility - Show Status Message
// ==============================
function showStatus(message) {
  if (statusMsg) {
    statusMsg.textContent = message;
  } else {
    console.log(message);
  }
}

// ==============================
// Periodic Sync & Fetch
// ==============================
setInterval(fetchQuotesFromServer, 60000); // every 1 min
setInterval(syncQuotes, 120000); // every 2 min

// ==============================
// Event Listeners
// ==============================
newQuoteBtn.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// ==============================
// Initial Load
// ==============================
displayRandomQuote();
fetchQuotesFromServer();
showStatus("✨ Quote Generator Ready with Mock API");
