// Centralized API Configuration for Brain Dock Library (User Website)
// Automatically adapts between Localhost development and Live Production deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default API_BASE_URL;
