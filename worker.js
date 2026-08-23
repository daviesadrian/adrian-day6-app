const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');
const { Pool } = require('pg');

const app = express();
app.get('/', (req, res) => {
  res.json({ status: 'healthy' });
});
app.listen(8080, () => console.log('Health check on port 8080'));

const pubsub = new PubSub({ projectId: 'cloud-portfolio-789' });
const subscription = pubsub.subscription('orders-worker');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  host: 'localhost',
  database: 'postgres',
  port: 5432,
});

subscription.on('message', async (message) => {
  try {
    const data = JSON.parse(message.data.toString());
    await pool.query('INSERT INTO messages (text) VALUES ($1)', [data.text]);
    message.ack();
    console.log(`Processed: ${data.text}`);
  } catch (err) {
    message.nack();
    console.error(`Error: ${err.message}`);
  }
});

console.log('Worker listening for messages...');
