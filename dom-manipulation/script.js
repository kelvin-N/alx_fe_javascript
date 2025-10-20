// Array of quotes with text and category
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
  { text: "Don’t let yesterday take up too much of today.", category: "Life" },
];

// Get DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${quote.text}" <br><strong>— ${quote.category}</strong>`;
}

// Function to add a new quote with validation
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  // Check if both fields are filled
  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("⚠️ Please fill in both fields before adding a quote.");
    return;
  }

  // Check for duplicate quote text
  const isDuplicate = quotes.some(
    (quote) => quote.text.toLowerCase() === newQuoteText.toLowerCase()
  );

  if (isDuplicate) {
    alert("🚫 This quote already exists. Try adding a new one!");
    return;
  }

  // Add new quote if valid
  const newQuote = { text: newQuoteText, category: newQuoteCategory };
  quotes.push(newQuote);

  // Clear fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Update the DOM to show confirmation
  quoteDisplay.innerHTML = `✅ New quote added: "${newQuote.text}" — <strong>${newQuote.category}</strong>`;
  console.log("Quotes Array Updated:", quotes);
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Display random quote on page load
document.addEventListener("DOMContentLoaded", showRandomQuote);
