import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const checkHealth = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        return response.data;
    } catch (error) {
        console.error("Health check failed", error);
        return null;
    }
};

export const predictDelay = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/predict`, data);
        return response.data;
    } catch (error) {
        console.error("Prediction failed", error);
        throw error;
    }
};

export const getStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stats`);
        return response.data;
    } catch (error) {
        console.error("Stats fetch failed", error);
        return null;
    }
}

export const getRoutes = async (city) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/routes?city=${city}`);
        return response.data;
    } catch (error) {
        console.error("Route fetch failed", error);
        return [];
    }
}

export const getTrips = async (city, routeId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/trips?city=${city}&route_id=${routeId}`);
        return response.data;
    } catch (error) {
        console.error("Trip fetch failed", error);
        return [];
    }
}

export const getStops = async (city, routeId = null, headsign = null) => {
    try {
        let url = `${API_BASE_URL}/stops?city=${city}`;
        if (routeId) url += `&route_id=${routeId}`;
        if (headsign) url += `&headsign=${headsign}`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Stop fetch failed", error);
        return [];
    }
}

export const getRouteInfo = async (startLat, startLon, endLat, endLon) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/route-info`, {
            params: { start_lat: startLat, start_lon: startLon, end_lat: endLat, end_lon: endLon }
        });
        return response.data;
    } catch (error) {
        console.error("Route info fetch failed", error);
        return null;
    }
}
