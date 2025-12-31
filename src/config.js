// src/config.js

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const POST_URL = import.meta.env.VITE_POST_URL || 'http://localhost:5050';
export const SEO_URL = import.meta.env.VITE_SEO_URL || 'http://localhost:8000';

// List the backend servers to check on app load. 
export const BACKEND_SERVERS = [
  { name: 'API', url: `${API_URL}/health` },
  { name: 'Post', url: `${POST_URL}/health` },
  { name: 'SEO', url: `${SEO_URL}/health` },
];

// Polling configuration (ms)
export const SERVER_POLL_INTERVAL = Number(import.meta.env.VITE_SERVER_POLL_INTERVAL) || 5000;
export const FETCH_TIMEOUT = Number(import.meta.env.VITE_FETCH_TIMEOUT) || 5000;
