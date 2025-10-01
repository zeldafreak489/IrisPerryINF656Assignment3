const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

let logs = [];   // temporary log storage
let clients = []; // list of SSE clients

// Endpoint to receive logs
app.post("/log", (req, res) => {
  const { eventType, description, timestamp } = req.body;
  if (!eventType || !description) {
    return res.status(400).json({ error: "Invalid log format" });
  }
  logs.push({ eventType, description, timestamp });
  console.log("📩 Log received:", { eventType, description, timestamp });
  res.json({ status: "logged" });
});

// SSE endpoint for pushing summaries
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

// Batch process logs every 2 minutes
setInterval(() => {
  if (logs.length === 0) return;

  const summary = logs.reduce((acc, log) => {
    acc.total++;
    acc[log.eventType] = (acc[log.eventType] || 0) + 1;
    return acc;
  }, { total: 0 });

  console.log("📊 Summary sent to clients:", summary);

  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(summary)}\n\n`);
  });

  logs = []; // clear logs for next batch
}, 120000); // 2 minutes

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
