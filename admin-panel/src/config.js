// Centralized API Configuration for Brain Dock Library (Admin ERP)
// Automatically adapts between Localhost development and Live Production deployment
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (!isLocalhost && isBrowser ? 'https://braindock-api.onrender.com' : 'http://localhost:5000');

export default API_BASE_URL;

