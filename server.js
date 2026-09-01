const express = require('express');
const app = express();
app.use(express.json());

const API_KEY = 'sk-test-12345'; // Simple key for now
const RATE_LIMIT = 100; // 100 requests per hour

// Track requests per API key
const rateLimits = {};

// Middleware: Check API key + rate limit on every request
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if header exists and format is "Bearer KEY"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  const key = authHeader.split(' ')[1]; // Extract key after "Bearer "

  // Check if key matches
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Check rate limit
  const now = Date.now();
  if (!rateLimits[key]) {
    rateLimits[key] = { count: 0, resetTime: now + 3600000 };
  }

  // Reset if hour has passed
  if (now > rateLimits[key].resetTime) {
    rateLimits[key] = { count: 0, resetTime: now + 3600000 };
  }

  // Check if limit exceeded
  if (rateLimits[key].count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Increment counter
  rateLimits[key].count++;

  // Key is valid and within rate limit, proceed to next route
  next();
});

// Now your routes are protected
app.get('/messages', (req, res) => {
  res.json({ message: 'Only valid API keys can see this' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
