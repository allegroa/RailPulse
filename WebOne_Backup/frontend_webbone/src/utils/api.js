import axios from "axios";
import { getToken, logout } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((cfg) => {
  const t = getToken?.();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      logout?.();
      window.location.href = import.meta.env.BASE_URL + "login";
    }
    return Promise.reject(err);
  }
);

export default api;
