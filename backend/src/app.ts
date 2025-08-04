import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes will be added here
app.get('/', (req, res) => {
  res.send('Microlearn API is running');
});

export default app;
