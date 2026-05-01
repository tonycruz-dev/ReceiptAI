import axios from "axios";

// INNED TO GET THE API URL FROM ENV VARIABLES
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const api = axios.create({
  baseURL: `${apiBaseUrl}/api`
});
