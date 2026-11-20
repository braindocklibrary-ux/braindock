// Centralized API Configuration for Brain Dock Library (Admin ERP)
// Automatically adapts between Localhost development and Live Production deployment
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

let envApi = import.meta.env.VITE_API_URL;
// Force override obsolete suspended backend URLs if defined in Vercel environment variables
if (!envApi || envApi.includes('braindock-api.onrender.com')) {
  envApi = !isLocalhost && isBrowser ? 'https://braindock-a7b8.onrender.com' : 'http://localhost:5000';
}

export const API_BASE_URL = envApi;

export default API_BASE_URL;

