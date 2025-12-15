// ---------------- Quotes Data ----------------
let quotes = [
  { text: "The future belongs to those who prepare for it today.", category: "Motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Innovation" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "Cybersecurity is everyone's responsibility.", category: "Tech" }
];

let currentCategory = localStorage.getItem("selectedCategory") || "All";

// ---------------- Quote Display ----------------
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

  sessionStorage.setItem("lastViewedQuoteIndex", randomIndex);
}

// ---------------- Category Filter ----------------
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

function filterQuote(event) {
  currentCategory = event.target.value;
  localStorage.setItem("selectedCategory", currentCategory);
  displayRandomQuote();
}

// ---------------- Import / Export ----------------
function exportToJsonFile(jsonData, fileName = "quotes.json") {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event, callback) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      callback(importedQuotes);
    } catch (err) {
      console.error("Invalid JSON file", err);
    }
  };
  reader.readAsText(file);
}

// ---------------- Mock API Integration ----------------
const API_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch quotes from server");
    const serverData = await response.json();
    return serverData.map(post => ({ text: post.title, category: "Server" }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function postQuoteToServer(newQuote) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote)
    });
    if (!response.ok) throw new Error("Failed to post new quote");
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  serverQuotes.forEach(sQuote => {
    if (!quotes.some(lQuote => lQuote.text === sQuote.text)) {
      quotes.push(sQuote);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
    displayRandomQuote();
    populateCategories();
    showNotification("New quotes fetched from server!");
    alert("Quotes synced with server!");
  }
}

// ---------------- UI Notification ----------------
function showNotification(message) {
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.position = "fixed";
    notification.style.bottom = "10px";
    notification.style.right = "10px";
    notification.style.backgroundColor = "#4caf50";
    notification.style.color = "#fff";
    notification.style.padding = "10px";
    notification.style.borderRadius = "5px";
    document.body.appendChild(notification);
  }
  notification.textContent = message;
  setTimeout(() => notification.remove(), 3000);
}

// ---------------- Initialization ----------------
document.addEventListener("DOMContentLoaded", function () {
  populateCategories();
  displayRandomQuote();

  document.getElementById("categoryFilter")?.addEventListener("change", filterQuote);
  document.getElementById("nextQuoteBtn")?.addEventListener("click", displayRandomQuote);
  document.getElementById("exportBtn")?.addEventListener("click", () => exportToJsonFile(quotes));
  document.getElementById("jsonFileInput")?.addEventListener("change", event => {
    importFromJsonFile(event, importedQuotes => {
      quotes = importedQuotes;
      localStorage.setItem("quotes", JSON.stringify(quotes));
      displayRandomQuote();
      populateCategories();
    });
  });

  // Periodic server sync every 30s
  setInterval(syncQuotes, 30000);
});
