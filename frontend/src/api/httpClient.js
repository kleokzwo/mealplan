const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const httpClient = {
  async request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (!response.ok) {
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
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "GET",
      ...options,
    });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "DELETE",
      ...options,
    });
  },
};

export { httpClient };
export default httpClient;