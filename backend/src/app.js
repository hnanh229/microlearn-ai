const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
const homeRoutes = require('./routes/homeRoutes');

// API routes
app.use('/api/home', homeRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.send('Microlearn API is running');
});

module.exports = app;
