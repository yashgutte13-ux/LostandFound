import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

export const api = axios.create({
  baseURL: baseURL.replace(/\/$/, "")
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
