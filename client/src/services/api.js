import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`
});

export const generateTransaction = async () => {
    const response = await api.post("/transactions/generate");
    return response.data;
};

export const getTransactions = async () => {
    const response = await api.get("/transactions");
    return response.data;
};

export const getSummary = async () => {
    const response = await api.get("/transactions/summary");
    return response.data;
};

export const getMonthlySummary = async () => {
    const response = await api.get("/transactions/monthly");
    return response.data;
};

export const getAppBreakdown = async () => {
    const response = await api.get("/transactions/by-app");
    return response.data;
};

export default api;