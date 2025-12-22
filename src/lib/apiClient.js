// src/lib/apiClient.js
import axios from "axios";

// Prefer VITE_API_BASE, fall back to VITE_API_BASE_URL, then localhost
const RAW_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:4000";
// Normalize: strip trailing slashes so path joins are correct
const BASE_URL = String(RAW_BASE).replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 45000, // 45s frontend timeout (backend decides to respond within 30s)
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

/**
 * Generate app code from prompt using AI backend
 * @param {string} prompt - The app description
 * @returns {Promise<{status: string, files: object, messages: array}>}
 */
export async function generate(prompt) {
  const res = await apiClient.post("/api/generate", { prompt });
  return res.data;
}

/**
 * Fetch a saved layout by id
 * @param {string} layoutId
 */
export async function fetchLayout(layoutId = 'current') {
  const res = await apiClient.get(`/v1/layouts/${layoutId}`);
  return res.data;
}

/**
 * Persist a layout document
 * @param {string} layoutId
 * @param {object} layout
 */
export async function saveLayout(layoutId = 'current', layout) {
  const res = await apiClient.put(`/v1/layouts/${layoutId}`, { layout });
  return res.data;
}

/**
 * Health check endpoint
 */
export async function healthCheck() {
  const res = await apiClient.get("/health");
  return res.data;
}
