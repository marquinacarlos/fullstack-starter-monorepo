import axios from "axios";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/** Base REST client. All REST calls go through this instance. */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
});
