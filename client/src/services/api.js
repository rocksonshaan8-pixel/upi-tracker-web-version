import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api"
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

export default api;