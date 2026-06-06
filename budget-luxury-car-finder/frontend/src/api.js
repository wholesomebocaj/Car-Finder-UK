const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getCars() {
  return request("/api/cars");
}

export function getRankedCars() {
  return request("/api/cars/ranked");
}

export function createCar(payload) {
  return request("/api/cars", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCar(id, payload) {
  return request(`/api/cars/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCar(id) {
  return request(`/api/cars/${id}`, {
    method: "DELETE",
  });
}

export function lookupVehicleData(registrationNumber) {
  return request("/api/vehicle/lookup", {
    method: "POST",
    body: JSON.stringify({ registration_number: registrationNumber }),
  });
}

export function getRecommendations() {
  return request("/api/recommendations");
}

export function getAvoidList() {
  return request("/api/avoid");
}
