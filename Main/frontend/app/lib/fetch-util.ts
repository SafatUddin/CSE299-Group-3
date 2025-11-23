import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api-v1';

// Simple axios instance without heavy interceptors
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
    // Add these performance optimizations
    maxRedirects: 5,
    decompress: true,
    validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Simplified request interceptor - add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Simplified response interceptor - handle 401 and clear storage
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear localStorage immediately
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Dispatch logout event
            window.dispatchEvent(new Event("force-logout"));
        }
        return Promise.reject(error);
    }
);

const postData = async <T>(path: string, data: unknown): Promise<T> => {
    const response = await api.post(path, data);

    return response.data;
};

const fetchData = async <T>(path: string): Promise<T> => {
    // Use native fetch for ALL requests - axios is slow
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    
    if (response.status === 401) {
        // Clear localStorage immediately
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Dispatch logout event
        window.dispatchEvent(new Event("force-logout"));
        throw new Error("Unauthorized");
    }
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

const updateData = async <T>(path: string, data: unknown): Promise<T> => {
    const response = await api.put(path, data);

    return response.data;
};

const deleteData = async <T>(path: string): Promise<T> => {
    const response = await api.delete(path);

    return response.data;
};

export { postData, fetchData, updateData, deleteData };