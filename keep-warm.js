// This utility can be used to keep your Render instance "warm"
// It sets up a small Express server that you can run on a free service like 
// Uptime Robot or a small personal server to periodically ping your Render backend.

const axios = require('axios');
const express = require('express');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Your Render backend URL
const RENDER_URL = process.env.RENDER_URL || 'https://your-render-app.onrender.com/api/health';

// Ping the Render backend every 10 minutes to keep it warm
const pingRenderApp = async () => {
    try {
        console.log(`Pinging ${RENDER_URL} at ${new Date().toISOString()}`);
        const response = await axios.get(RENDER_URL);
        console.log(`Response status: ${response.status}`);
        return response.data;
    } catch (error) {
        console.error(`Error pinging Render app: ${error.message}`);
    }
};

// Set up a cron job to ping every 10 minutes
cron.schedule('*/10 * * * *', pingRenderApp);

// Also ping immediately when the service starts
pingRenderApp();

// Simple status endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'Render warm-up service is active',
        lastPing: new Date().toISOString()
    });
});

// Manual ping endpoint
app.get('/ping', async (req, res) => {
    try {
        const result = await pingRenderApp();
        res.json({
            status: 'success',
            message: 'Pinged Render app',
            result
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Render warm-up service running on port ${PORT}`);
});

// Instructions:
// 1. Deploy this to a free service like Glitch, Replit, or another free tier service
// 2. Set the RENDER_URL environment variable to your actual Render backend URL
// 3. This will ping your app every 10 minutes to keep it warm
// 4. Alternatively, set up a free service like UptimeRobot to ping your Render URL directly
