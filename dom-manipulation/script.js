document.addEventListener("DOMContentLoaded", () => {
  const LS_QUOTES = "quotes";
  const LS_FILTER = "lastFilter";
  const SS_LAST_QUOTE = "lastQuoteIndex";
  const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated endpoint

  let quotes = [];

  // DOM elements
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
  const notificationBox = document.createElement("div");

  // Style notification box
  notificationBox.style.position = "fixed";
  notificationBox.style.bottom = "10px";
  notificationBox.style.right = "10px";
  notificationBox.style.background = "#222";
  notificationBox.style.color = "#fff";
  notificationBox.style.padding = "10px 15px";
  notificationBox.style.borderRadius = "8px";
  notificationBox.style.display = "none";
  document.body.appendChild(notificationBox);

  // Utility: show temporary notifications
  function showNotification(message) {
    notificationBox.textContent = message;
    notificationBox.style.display = "block";
    setTimeout(() => (notificationBox.style.display = "none"), 3000);
  }

  // Load from local storage
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

  // Save to local storage
  function saveQuotes() {
    localStorage.setItem(LS_QUOTES, JSON.stringify(quotes));
    populateCategories();
    renderList();
  }

  // Populate dropdown dynamically
  function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category).filter(Boolean))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryFilter.appendChild(opt);
    });

    // Restore last selected filter
    const savedFilter = localStorage.getItem(LS_FILTER);
    if (savedFilter) {
      categoryFilter.value = savedFilter;
      filterQuotes();
    }
  }

  // Filter quotes by category
  function filterQuotes() {
    const selected = categoryFilter.value;
    localStorage.setItem(LS_FILTER, selected);
    renderList(selected);
  }

  // Show a random quote
  function showRandomQuote() {
    if (!quotes.length) return;
    const index = Math.floor(Math.random() * quotes.length);
    const q = quotes[index];
    quoteBox.textContent = q.text;
    quoteMeta.textContent = q.category ? `Category: ${q.category}` : "";
    sessionStorage.setItem(SS_LAST_QUOTE, index);
  }

  // Add new quote
  function addQuote(text, category) {
    if (!text.trim()) return;
    quotes.push({ text: text.trim(), category: category.trim() });
    saveQuotes();
    syncWithServer(); // trigger sync after adding new quote
  }

  // Render list
  function renderList(filter = "all") {
    quotesList.innerHTML = "";
    const filteredQuotes = filter === "all" ? quotes : quotes.filter(q => q.category === filter);

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
        quotes.splice(i, 1);
        saveQuotes();
        syncWithServer();
      });
      div.appendChild(delBtn);
      quotesList.appendChild(div);
    });
  }

  // Export quotes
  function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import quotes
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      showNotification("Quotes imported successfully!");
      syncWithServer();
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // Clear all
  function clearAllQuotes() {
    if (confirm("Are you sure you want to clear all quotes?")) {
      quotes = [];
      saveQuotes();
      syncWithServer();
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

  // === Simulated Server Sync Logic ===
  async function fetchFromServer() {
    try {
      const response = await fetch(SERVER_URL);
      const serverData = await response.json();

      // Simulate server sending quotes
      const serverQuotes = serverData.slice(0, 3).map(item => ({
        text: item.title,
        category: "server"
      }));

      // Conflict resolution: Server data takes precedence
      const merged = [...serverQuotes];
      const localUnique = quotes.filter(q => !serverQuotes.some(sq => sq.text === q.text));
      quotes = [...merged, ...localUnique];
      saveQuotes();
      showNotification("Data synced with server (server data took precedence).");
    } catch (error) {
      console.error("Sync failed:", error);
      showNotification("Server sync failed.");
    }
  }

  // Send local quotes to server (simulation)
  async function postToServer() {
    try {
      await fetch(SERVER_URL, {
        method: "POST",
        body: JSON.stringify(quotes),
        headers: { "Content-Type": "application/json" }
      });
      showNotification("Quotes synced to server.");
    } catch (error) {
      console.error("Post failed:", error);
    }
  }

  // Sync both ways
  async function syncWithServer() {
    await postToServer();
    await fetchFromServer();
  }

  // Periodic sync every 30 seconds
  setInterval(syncWithServer, 30000);

  // Event listeners
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
  syncWithServer(); // Initial sync
});
