// src/services/mongodb.js
import axios from "axios";

// Default to localhost in development if not specified
const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login if needed
      console.error("Authentication error:", error);
    }
    return Promise.reject(error);
  }
);

// MongoDB service functions
const MongoDBService = {
  // Get user favorites
  // In your MongoDBService.getFavorites method
  getFavorites: async () => {
    try {
      console.log("Getting favorites from API");

      // Check if token exists
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.token) {
        console.warn("No auth token found when trying to get favorites");
        return [];
      }

      console.log("Making request to:", `${API_URL}/favorites`);
      const response = await api.get("/favorites");
      console.log("GET favorites response status:", response.status);
      console.log("GET favorites response data:", response.data);

      if (!response.data.favorites) {
        console.warn("Received data but no favorites array:", response.data);
        return [];
      }

      return response.data.favorites;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },

  // Toggle a country in favorites
  toggleFavorite: async (countryCode) => {
    try {
      console.log("API call: Toggling favorite for country:", countryCode);
      console.log("API endpoint:", `${API_URL}/favorites/toggle`);

      // Get the token from localStorage to verify it's there
      const user = JSON.parse(localStorage.getItem("user"));
      console.log("Token available for request:", !!user?.token);

      const response = await api.post("/favorites/toggle", { countryCode });
      console.log("API response for toggle:", response.data);
      return response.data;
    } catch (error) {
      console.error("API error toggling favorite:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  },

  // Set auth token after login
  setAuthToken: (token) => {
    console.log("Setting auth token in localStorage");
    if (token) {
      localStorage.setItem("user", JSON.stringify({ token }));
      console.log("Auth token saved, length:", token.length);
    } else {
      localStorage.removeItem("user");
      console.log("Auth token removed");
    }
  },
};

export default MongoDBService;
