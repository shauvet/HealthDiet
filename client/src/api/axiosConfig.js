import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log the request URL for debugging
    console.log(`Request URL: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle token expiration or auth errors
    if (error.response && error.response.status === 401) {
      // 保存当前路径以便登录后返回
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/login') {
        sessionStorage.setItem('lastPath', currentPath);
      }
      localStorage.removeItem('token');
      // 注释掉强制跳转，让React Router自己处理重定向
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 
