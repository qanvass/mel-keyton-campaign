// API configuration
// In production: API routes are on the same Vercel domain (same origin), so empty string works.
// In development: set VITE_API_URL to your local backend if testing separately.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
