import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getHealth = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error("Health check failed:", error);
        return { status: 'offline' };
    }
};

export const getRoutes = async (city) => {
    const response = await api.get('/api/routes', { params: { city } });
    return response.data;
};

export const getTrips = async (city, routeId) => {
    const response = await api.get('/api/trips', { params: { city, route_id: routeId } });
    return response.data;
};

export const getStops = async (city, routeId, headsign) => {
    const response = await api.get('/api/stops', {
        params: { city, route_id: routeId, headsign }
    });
    return response.data;
};

export const predictDelay = async (data) => {
    const response = await api.post('/api/predict', data);
    return response.data;
};

export const fetchRouteInfo = async (startLat, startLon, endLat, endLon) => {
    const response = await api.get('/api/route-info', {
        params: {
            start_lat: startLat,
            start_lon: startLon,
            end_lat: endLat,
            end_lon: endLon
        }
    });
    return response.data;
};

// Auth API calls
export const loginUser = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
};

export const registerUser = async (username, password) => {
    const response = await api.post('/api/auth/register', { username, password });
    return response.data;
};

// Chat API
export const sendChatMessage = async (message, context) => {
    const response = await api.post('/api/chat', { message, context });
    return response.data;
};

export default api;
