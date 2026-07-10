import { API_BASE_URL } from "./apiConfig";
import authService from "./AuthService";

class UserService {
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: authService.getAuthHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "No se pudieron cargar los usuarios");
    }

    return data.users || [];
  }

  async createUser(payload) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: authService.getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "No se pudo crear el usuario");
    }

    return data.user;
  }

  async updateUser(userId, payload) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: authService.getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "No se pudo actualizar el usuario");
    }

    return data.user;
  }

  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "No se pudo eliminar el usuario");
    }

    return true;
  }
}

const userService = new UserService();
export default userService;     