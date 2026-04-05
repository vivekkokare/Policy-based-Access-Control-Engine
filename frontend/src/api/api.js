import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

const api = {
  getUsers: () => API.get("/users"),
  getPolicies: () => API.get("/policies"),
  evaluate: (payload) => API.post("/evaluate", payload),
};

export default api;