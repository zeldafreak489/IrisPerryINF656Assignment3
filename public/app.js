// Function to send logs to the server
function sendLog(eventType, description) {
  fetch("/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, description, timestamp: Date.now() })
  })
    .then(res => res.json())
    .then(data => console.log("✅ Server logged:", data))
    .catch(err => console.error("❌ Error sending log:", err));
}

// Track button click
document.getElementById("actionBtn").addEventListener("click", () => {
  sendLog("button_click", "Button clicked");
});

// Track form submission
document.getElementById("sampleForm").addEventListener("submit", (e) => {
  e.preventDefault();
  sendLog("form_submit", "Form submitted");
});

// Listen for batch summaries from server
const eventSource = new EventSource("/events");
eventSource.onmessage = event => {
  const summary = JSON.parse(event.data);
  console.log("📊 Batch Summary:", summary);
};
eventSource.onerror = () => {
  console.error("❌ Lost connection to server events");
};
