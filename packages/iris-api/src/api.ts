import endpoint from "./endpoint";
import { APIOptions, HttpError, MethodOptions } from "./types";
import { stripEmptyKeys } from "./utils";

export async function fetcher(endpoint: RequestInfo, options?: RequestInit) {
  const res = await fetch(endpoint, options);

  if (!res.ok) {
    const error = new Error(res.statusText) as HttpError;
    error.status = res.status;
    throw error;
  }

  return await res.json();
}

export async function request(route: string, options: APIOptions) {
  const { data, headers, method, signal, ...rest } = options;

  const url = endpoint(route, rest);

  return await fetcher(url, {
    signal,
    method,
    headers: headers ? stripEmptyKeys(headers) : undefined,
    body: JSON.stringify(data),
  });
}

async function get(route: string, options: MethodOptions = {}) {
  return await request(route, { ...options, method: "GET" });
}

async function post(route: string, options: MethodOptions = {}) {
  return await request(route, { ...options, method: "POST" });
}

async function put(route: string, options: MethodOptions = {}) {
  return await request(route, { ...options, method: "PUT" });
}

async function del(route: string, options: MethodOptions = {}) {
  return await request(route, { ...options, method: "DELETE" });
}

const api = {
  get,
  post,
  put,
  del,
};

export default api;
