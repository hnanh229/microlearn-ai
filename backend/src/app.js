const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const quizRoutes = require('./routes/quizRoutes');
const profileRoutes = require('./routes/profileRoutes');

// API routes
app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/auth/profile', profileRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.send('Microlearn API is running');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MicroLearn API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
