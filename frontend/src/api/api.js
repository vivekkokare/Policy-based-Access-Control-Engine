// API Service Module
// Centralized axios configuration and API endpoint methods

import axios from "axios";

// Create axios instance with backend base URL
const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

// API method wrappers for policy engine endpoints
const api = {
  // Fetch all users from the backend
  getUsers: () => API.get("/users"),
  
  // Fetch all policies (both optimized and full ODRL formats)
  getPolicies: () => API.get("/policies"),
  
  // Evaluate access control decision for a user-action-target combination
  // payload: { user_id, action, target, context }
  evaluate: (payload) => API.post("/evaluate", payload),
};

export default api;