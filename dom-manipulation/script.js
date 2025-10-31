// ==============================
// Dynamic Quote Generator with Server Sync & Conflict Resolution
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
// Add a New Quote
// ==============================
function addQuote() {
  const text = prompt("Enter the quote:");
  const category = prompt("Enter the category:");
  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    showStatus("✅ New quote added locally!");
  }
}

// ==============================
// Sync Quotes with Server
// ==============================
function syncQuotes() {
  showStatus("🔄 Syncing quotes with server...");
  fetch('https://example.com/api/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quotes)
  })
  .then(response => response.json())
  .then(serverData => {
    // Merge and resolve conflicts (prefer server updates)
    updateLocalStorage(serverData);
    showStatus("✅ Quotes successfully synced with server!");
  })
  .catch(error => {
    console.error('Error syncing quotes:', error);
    showStatus("⚠️ Failed to sync with server. Will retry later.");
  });
}

// ==============================
// Fetch Latest Quotes from Server
// ==============================
function fetchQuotesFromServer() {
  fetch('https://example.com/api/quotes')
    .then(response => response.json())
    .then(serverQuotes => {
      updateLocalStorage(serverQuotes);
      showStatus("🔔 Quotes updated from server!");
    })
    .catch(error => {
      console.error('Error fetching quotes:', error);
    });
}

// ==============================
// Update Local Storage with Conflict Resolution
// ==============================
function updateLocalStorage(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
  const mergedQuotes = [];

  // Simple conflict resolution: prefer server data for matching texts
  serverQuotes.forEach(serverQuote => {
    const exists = localQuotes.find(q => q.text === serverQuote.text);
    if (!exists) mergedQuotes.push(serverQuote);
  });

  // Combine both
  const finalQuotes = [...localQuotes, ...mergedQuotes];
  localStorage.setItem('quotes', JSON.stringify(finalQuotes));
  quotes = finalQuotes;
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
// Periodically Sync with Server
// ==============================
setInterval(fetchQuotesFromServer, 60000); // every 60 seconds
setInterval(syncQuotes, 120000); // sync every 2 minutes

// ==============================
// Event Listeners
// ==============================
newQuoteBtn.addEventListener('click', displayRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);

// Initial display
displayRandomQuote();
showStatus("✨ Quote Generator Ready");
