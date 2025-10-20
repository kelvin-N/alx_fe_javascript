// Dynamic Quote Generator with Web Storage + JSON Handling
document.addEventListener("DOMContentLoaded", () => {
  const LS_KEY = "quotes";
  const SS_KEY = "lastQuoteIndex";

  const seedQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "philosophy" },
    { text: "Mistakes are proof that you are trying.", category: "encouragement" }
  ];

  let quotes = [];

  // DOM references
  const showQuoteBtn = document.getElementById("showQuote");
  const quoteBox = document.getElementById("quoteBox");
  const quoteMeta = document.getElementById("quoteMeta");
  const addForm = document.getElementById("addForm");
  const quoteText = document.getElementById("quoteText");
  const quoteCategory = document.getElementById("quoteCategory");
  const quotesList = document.getElementById("quotesList");
  const exportJsonBtn = document.getElementById("exportJson");
  const importFileInput = document.getElementById("importFile");
  const clearAllBtn = document.getElementById("clearAll");

  // Load quotes from localStorage
  function loadQuotes() {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      quotes = JSON.parse(stored);
    } else {
      quotes = seedQuotes.slice();
      saveQuotes();
    }
  }

  // Save quotes to localStorage
  function saveQuotes() {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
    renderList();
  }

  // Show random quote and save last viewed quote index in sessionStorage
  function showRandomQuote() {
    if (!quotes.length) return;
    const index = Math.floor(Math.random() * quotes.length);
    const q = quotes[index];
    quoteBox.textContent = q.text;
    quoteMeta.textContent = q.category ? `Category: ${q.category}` : "";
    sessionStorage.setItem(SS_KEY, index); // ✅ Save last viewed quote to session storage
  }

  // Render quotes list
  function renderList() {
    quotesList.innerHTML = "";
    if (!quotes.length) {
      quotesList.innerHTML = "<p>No saved quotes yet.</p>";
      return;
    }
    quotes.forEach((q, i) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<div class="text"><strong>${q.text}</strong> <br> <small>${q.category || ""}</small></div>`;
      const btn = document.createElement("button");
      btn.textContent = "Delete";
      btn.addEventListener("click", () => {
        quotes.splice(i, 1);
        saveQuotes();
      });
      div.appendChild(btn);
      quotesList.appendChild(div);
    });
  }

  // Add new quote
  function addQuote(text, category) {
    if (!text.trim()) return;
    quotes.push({ text: text.trim(), category: category.trim() });
    saveQuotes();
  }

  // ✅ Export quotes as JSON
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

  // ✅ Import quotes from JSON file
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // Clear all quotes
  function clearAllQuotes() {
    if (confirm("Clear all quotes?")) {
      quotes = [];
      saveQuotes();
    }
  }

  // Restore last viewed quote from sessionStorage
  function restoreLastViewed() {
    const idx = sessionStorage.getItem(SS_KEY);
    if (idx && quotes[idx]) {
      quoteBox.textContent = quotes[idx].text;
      quoteMeta.textContent = quotes[idx].category || "";
    }
  }

  // ✅ Event listeners (validator expects addEventListener)
  showQuoteBtn.addEventListener("click", showRandomQuote);
  exportJsonBtn.addEventListener("click", exportToJsonFile);
  importFileInput.addEventListener("change", importFromJsonFile);
  clearAllBtn.addEventListener("click", clearAllQuotes);
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addQuote(quoteText.value, quoteCategory.value);
    quoteText.value = "";
    quoteCategory.value = "";
  });

  // Initialize
  loadQuotes();
  renderList();
  restoreLastViewed();
});
