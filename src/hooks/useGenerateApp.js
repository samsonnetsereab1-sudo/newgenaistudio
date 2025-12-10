// src/hooks/useGenerateApp.js
import { useState } from 'react';
import apiClient from '../lib/apiClient';

export function useGenerateApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (prompt, addLog) => {
    try {
      setLoading(true);
      setError(null);
      addLog?.("Sending request to backend...");

      const response = await apiClient.post("/api/generate", { prompt });

      return {
        status: response.data.status || "ok",
        files: response.data.files || {},
        messages: response.data.messages || []
      };
    } catch (err) {
      console.error("Backend error:", err);
      addLog?.("Backend error occurred.");
      setError(err.message);

      return {
        status: "error",
        files: {},
        messages: [
          {
            role: "assistant",
            content: "I wasn't able to reach the backend. Check server logs and network tab."
          }
        ]
      };
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}
