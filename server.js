const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres123',
  host: '10.10.0.3',
  database: 'postgres',
  port: 5432,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
`).catch(err => console.log('Table setup:', err.message));

const app = express();
app.use(express.json());

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
    const result = await pool.query('INSERT INTO messages (text) VALUES ($1) RETURNING *', [text]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
