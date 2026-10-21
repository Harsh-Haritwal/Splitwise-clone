const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const TOKEN_KEY = "splitwise_token";

const request = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(BASE_URL + path, { ...options, headers });
  } catch (error) {
    throw new Error("Cannot reach the server. Is the backend running?", {
      cause: error,
    });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Some responses have no JSON body, so keep data as null.
  }

  if (!response.ok) {
    const message = data && data.msg ? data.msg : "Something went wrong";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default api;
