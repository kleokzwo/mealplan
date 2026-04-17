const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    // 🔥 optional: Auto-Logout bei 401
    if (response.status === 401) {
      localStorage.removeItem("token");
      // optional redirect:
      // window.location.href = "/login";
    }

    const error = new Error(
      (data && typeof data === "object" && data.message) ||
        response.statusText ||
        "API Anfrage fehlgeschlagen."
    );
    error.status = response.status;
    error.data = data;
    error.endpoint = endpoint;
    throw error;
  }

  return data;
}

const httpClient = (endpoint, options = {}) => request(endpoint, options);

httpClient.request = request;

httpClient.get = (endpoint, options = {}) =>
  request(endpoint, { method: "GET", ...options });

httpClient.post = (endpoint, body, options = {}) =>
  request(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

httpClient.put = (endpoint, body, options = {}) =>
  request(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });

httpClient.patch = (endpoint, body, options = {}) =>
  request(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });

httpClient.delete = (endpoint, options = {}) =>
  request(endpoint, {
    method: "DELETE",
    ...options,
  });

export { httpClient };
export default httpClient;