import axios from "axios";

export const api = axios.create({
  baseURL: "https://cqcrd39c-7095.uks1.devtunnels.ms/api" // "https://localhost:7095/api", // change to your API port
});
