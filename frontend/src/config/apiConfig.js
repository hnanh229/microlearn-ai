import axios from 'axios';

// Get base URL from environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create appropriate baseURL without duplicating /api
let baseURL;
// Check if we're using the render.com URL that already includes /api
if (API_BASE_URL.includes('microlearn-ai.onrender.com/api')) {
    // For GitHub Pages deployment with the render.com URL
    baseURL = API_BASE_URL;
} else {
    // For local development or other environments
    baseURL = `${API_BASE_URL}/api`;
}

// Log the configuration for debugging
console.log('API Config:', { API_BASE_URL, baseURL });

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;