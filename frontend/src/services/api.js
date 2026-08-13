import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("cloud-ai:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: async (username, email, password) => {
    const { data } = await client.post("/auth/register", { username, email, password });
    return data.data; // { user, token }
  },

  login: async (identifier, password) => {
    const { data } = await client.post("/auth/login", { identifier, password });
    return data.data; // { user, token }
  },

  me: async () => {
    const { data } = await client.get("/auth/me");
    return data.data;
  },
};

export const chatApi = {
  /** Non-streaming send. Returns the persisted conversation record. */
  send: async (message, sessionId, history = []) => {
    const { data } = await client.post("/chat", { message, session_id: sessionId, history });
    return data.data;
  },

  /**
   * Streaming send using the Fetch API (axios doesn't support SSE well).
   * Calls onToken for each chunk, onDone when finished, onError on failure.
   */
  stream: async ({ message, sessionId, history = [], onToken, onDone, onError, signal }) => {
    try {
      const token = window.localStorage.getItem("cloud-ai:token");
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, session_id: sessionId, history }),
        signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.replace(/^data:\s*/, "");
          if (!jsonStr) continue;

          const payload = JSON.parse(jsonStr);
          if (payload.error) {
            onError?.(new Error(payload.error));
            return;
          }
          if (payload.token) {
            onToken?.(payload.token);
          }
          if (payload.done) {
            onDone?.(payload);
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        onError?.(err);
      }
    }
  },
};

export const historyApi = {
  getAll: async ({ search = "", sessionId } = {}) => {
    const { data } = await client.get("/history", {
      params: { search: search || undefined, session_id: sessionId || undefined },
    });
    return data.data;
  },

  deleteOne: async (id) => {
    const { data } = await client.delete(`/history/${id}`);
    return data;
  },

  deleteAll: async (sessionId) => {
    const { data } = await client.delete("/history", { params: { session_id: sessionId } });
    return data;
  },
};

export default client;
