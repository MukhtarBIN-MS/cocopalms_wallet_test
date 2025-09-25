"use client";

import axios from "axios";
import { getToken } from "./auth";


function base(root = "") {
  return (root || "").replace(/\/+$/, ""); // trim trailing slash
}
const ROOT = base(process.env.NEXT_PUBLIC_API_BASE_URL);

// -------- Error normalizer --------
function toMessage(err: any): string {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (typeof data?.error === "string") return data.error;
  if (data?.message) return String(data.message);
  return err?.message || "Request failed";
}

// -------- Admin (dashboard) client: /api + Bearer --------
export const adminApi = axios.create({
  baseURL: `${ROOT}/api`,
  withCredentials: true,
});
adminApi.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -------- Public (claims page) client: /api/public, no auth --------
export const publicApi = axios.create({
  baseURL: `${ROOT}/api/public`,
  withCredentials: true, // fine either way; keep if you ever use cookies
});

// -------- Admin helpers --------
export async function adminGet<T = unknown>(path: string): Promise<T> {
  try {
    const { data } = await adminApi.get<T>(path);
    return data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}
export async function adminPost<T = unknown>(
  path: string,
  body: any
): Promise<T> {
  try {
    const { data } = await adminApi.post<T>(path, body);
    return data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}
export async function adminDelete<T = unknown>(path: string): Promise<T> {
  try {
    const { data } = await adminApi.delete<T>(path);
    return data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

// -------- Public helpers --------
export async function publicGet<T = unknown>(path: string): Promise<T> {
  try {
    const { data } = await publicApi.get<T>(path);
    return data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}
export async function publicPost<T = unknown>(
  path: string,
  body: any
): Promise<T> {
  try {
    const { data } = await publicApi.post<T>(path, body);
    return data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}
