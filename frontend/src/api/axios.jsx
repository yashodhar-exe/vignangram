import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: API_BASE_URL
});

let activeRequests = 0;

function showLoader() {
    activeRequests++;
    if (activeRequests === 1) {
        window.dispatchEvent(new Event('show-loader'));
    }
}

function hideLoader() {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
        window.dispatchEvent(new Event('hide-loader'));
    }
}

api.interceptors.request.use(
    (config) => {
        showLoader();
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        hideLoader();
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        hideLoader();
        return response;
    },
    (error) => {
        hideLoader();
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;