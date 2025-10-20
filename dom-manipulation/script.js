document.addEventListener("DOMContentLoaded", () => {
  const LS_QUOTES = "quotes";
  const LS_FILTER = "lastFilter";
  const SS_LAST_QUOTE = "lastQuoteIndex";

  let quotes = [];

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
  const categoryFilter = document.getElementById("categoryFilter");

  // Load quotes from local storage
  function loadQuotes() {
    const stored = localStorage.getItem(LS_QUOTES);
    if (stored) {
      quotes = JSON.parse(stored);
    } else {
      quotes = [
        { text: "The only way to do great work is to love what you do.", category: "inspiration" },
        { text: "Simplicity is the ultimate sophistication.", category: "philosophy" },
        { text: "Mistakes are proof that you are trying.", category: "encouragement" }
      ];
      saveQuotes();
    }
  }

  // Save quotes to local storage
  function saveQuotes() {
    localStorage.setItem(LS_QUOTES, JSON.stringify(quotes));
    populateCategories();
    renderList();
  }

  // Populate dropdown with unique categories
  function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category).filter(Boolean))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryFilter.appendChild(opt);
    });

    // Restore last selected category from local storage
    const savedFilter = localStorage.getItem(LS_FILTER);
    if (savedFilter) {
      categoryFilter.value = savedFilter;
      filterQuotes();
    }
  }

  // Show random quote and save index to session storage
  function showRandomQuote() {
    if (!quotes.length) return;
    const index = Math.floor(Math.random() * quotes.length);
    const q = quotes[index];
    quoteBox.textContent = q.text;
    quoteMeta.textContent = q.category ? `Category: ${q.category}` : "";
    sessionStorage.setItem(SS_LAST_QUOTE, index);
  }

  // Add a new quote
  function addQuote(text, category) {
    if (!text.trim()) return;
    quotes.push({ text: text.trim(), category: category.trim() });
    saveQuotes();
  }

  // Filter quotes by category
  function filterQuotes() {
    const selected = categoryFilter.value;
    localStorage.setItem(LS_FILTER, selected); // ✅ Remember last selected filter
    renderList(selected);
  }

  // Render quotes list
  function renderList(filter = "all") {
    quotesList.innerHTML = "";
    const filteredQuotes = filter === "all"
      ? quotes
      : quotes.filter(q => q.category === filter);

    if (!filteredQuotes.length) {
      quotesList.innerHTML = "<p>No quotes found for this category.</p>";
      return;
    }

    filteredQuotes.forEach((q, i) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<div class="text"><strong>${q.text}</strong><br><small>${q.category || ""}</small></div>`;
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        const index = quotes.indexOf(q);
        if (index > -1) quotes.splice(index, 1);
        saveQuotes();
      });
      div.appendChild(delBtn);
      quotesList.appendChild(div);
    });
  }

  // Export quotes to JSON file
  function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import quotes from JSON file
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
    if (confirm("Are you sure you want to clear all quotes?")) {
      quotes = [];
      saveQuotes();
    }
  }

  // Restore last viewed quote
  function restoreLastViewed() {
    const idx = sessionStorage.getItem(SS_LAST_QUOTE);
    if (idx && quotes[idx]) {
      quoteBox.textContent = quotes[idx].text;
      quoteMeta.textContent = quotes[idx].category || "";
    }
  }

  // ✅ Event listeners
  showQuoteBtn.addEventListener("click", showRandomQuote);
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addQuote(quoteText.value, quoteCategory.value);
    quoteText.value = "";
    quoteCategory.value = "";
  });
  exportJsonBtn.addEventListener("click", exportToJsonFile);
  importFileInput.addEventListener("change", importFromJsonFile);
  clearAllBtn.addEventListener("click", clearAllQuotes);
  categoryFilter.addEventListener("change", filterQuotes);

  // Initialize
  loadQuotes();
  populateCategories();
  restoreLastViewed();
});
