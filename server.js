const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let eventLogs = [];
let latestSummary = null;

// CSP Header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self';"
  );
  next();
});

// Route to receive event logs
app.post('/log', (req, res) => {
  const { action } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Missing action field' });
  }

  const timestamp = new Date().toISOString();
  eventLogs.push({ action, timestamp });

  console.log(`[LOGGED] ${timestamp} - ${action}`);
  res.status(200).json({ message: 'Event logged' });
});

// Route for client to fetch summary
app.get('/summary', (req, res) => {
  res.json({ summary: latestSummary });
});

// Batch processing every 2 minutes
setInterval(() => {
  if (eventLogs.length === 0) {
    latestSummary = null;
    return;
  }

  const summary = {};
  for (const log of eventLogs) {
    summary[log.action] = (summary[log.action] || 0) + 1;
  }

  const generatedSummary = {
    generatedAt: new Date().toISOString(),
    totalEvents: eventLogs.length,
    details: summary,
  };

  latestSummary = generatedSummary;

  console.log('📦 Summary sent to client:', generatedSummary);

  // Clear the logs after processing
  eventLogs = [];
}, 2 * 60 * 1000); // every 2 minutes

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
