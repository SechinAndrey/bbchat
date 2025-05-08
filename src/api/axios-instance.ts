import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

export default apiClient;
