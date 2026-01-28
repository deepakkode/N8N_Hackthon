// API Configuration
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5002/api'
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com/api'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = API_CONFIG[environment].baseURL;

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', environment);

export default API_CONFIG;