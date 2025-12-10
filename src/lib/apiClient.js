// src/lib/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  // Point this at your backend. Adjust the port if needed.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 15000,
});

// optional: simple logging
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[api] error:", err?.response || err);
    return Promise.reject(err);
  }
);

export default apiClient;
