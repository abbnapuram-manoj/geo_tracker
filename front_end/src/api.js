import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = "Bearer " + t;
  return c;
});
export const errMsg = (e) => (e.response && e.response.data && e.response.data.error) || e.message;
export default api;