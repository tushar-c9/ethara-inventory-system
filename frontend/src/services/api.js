import axios from "axios";

// Detect API base URL from Vite environment variables, falling back to local development server
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor for custom global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message formats
    let errorMessage = "An unexpected error occurred. Please try again.";
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Match backend specific structures:
      // 1. Check for stock shortages: {"message": "Insufficient inventory"}
      if (data && data.message) {
        errorMessage = data.message;
      }
      // 2. Check for typical FastAPI details: {"detail": "..."}
      else if (data && data.detail) {
        errorMessage = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
      
      console.error(`API Error [Status ${status}]:`, errorMessage);
      
      // We attach the cleaned message to the error object so components can toast it
      error.cleanedMessage = errorMessage;
    } else if (error.request) {
      console.error("Network Error: No response received from server.");
      error.cleanedMessage = "Unable to connect to the backend server. Please verify it is running.";
    } else {
      console.error("Error setting up request:", error.message);
      error.cleanedMessage = errorMessage;
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
