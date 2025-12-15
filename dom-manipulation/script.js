// Mock API URL
const API_URL = "https://mockapi.io/projects/your-project/quotes"; // replace with your mock API endpoint

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch quotes from server");
    const serverQuotes = await response.json();
    return serverQuotes;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Post new quote to server
async function postQuoteToServer(newQuote) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote),
    });
    if (!response.ok) throw new Error("Failed to post new quote");
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// Sync local quotes with server periodically
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  // Check for new quotes from server
  serverQuotes.forEach(sQuote => {
    if (!quotes.some(lQuote => lQuote.text === sQuote.text)) {
      quotes.push(sQuote);
      updated = true;
    }
  });

  // Optional: resolve conflicts if needed (e.g., overwrite local with server)
  // Here we simply add missing quotes

  if (updated) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
    displayRandomQuote();
    showNotification("New quotes fetched from server!");
  }
}

// Show UI notification for updates
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
  setTimeout(() => {
    if (notification) notification.remove();
  }, 3000);
}

// Call syncQuotes every 30 seconds
setInterval(syncQuotes, 30000);
