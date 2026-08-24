const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');
const { Pool } = require('pg');

const pubsub = new PubSub({ projectId: 'cloud-portfolio-789' });
const topic = pubsub.topic('orders');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  host: 'localhost',
  database: 'postgres',
  port: 5432,
});

const app = express();
app.use(express.json());

// Structured logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const latency = Date.now() - start;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? 'ERROR' : 'INFO',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      latency_ms: latency,
      message: `${req.method} ${req.path}`
    }));
  });

  next();
});

app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/messages', async (req, res) => {
  try {
    const { text } = req.body;
    const messageId = await topic.publish(Buffer.from(JSON.stringify({ text, timestamp: new Date() })));
    res.json({ 
      id: messageId, 
      text: text, 
      status: 'queued - processing in background' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
