import axios from "axios";

import { API_URL } from "./api-url";

/** Base REST client. All REST calls go through this instance. */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
});
