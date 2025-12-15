// Function to export JSON data to a file
function exportToJsonFile(jsonData, fileName = "data.json") {
  const dataStr = JSON.stringify(jsonData, null, 2); // formatted JSON
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url); // clean up
}

// Function to import JSON data from a file input
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

// Example usage with file input
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("jsonFileInput");
  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      importFromJsonFile(event, function (data) {
        console.log("Imported JSON data:", data);
        // Do something with imported data
      });
    });
  }

  // Example button for exporting
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      const exampleData = { name: "Kelvin", project: "TechCon" };
      exportToJsonFile(exampleData, "techcon_data.json");
    });
  }
});
