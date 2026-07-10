// src/services/AuthService.js
import { API_BASE_URL } from "./apiConfig";

class AuthService {
  constructor() {
    this.SESSION_KEY = "cotecmar_session";
    this.SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
  }

  initialize() {
    return this.getSession();
  }

  getSession() {
    const session = sessionStorage.getItem(this.SESSION_KEY);
    if (!session) return null;

    try {
      const parsed = JSON.parse(session);
      if (!parsed?.token || !parsed?.user) return null;

      if (Date.now() > Number(parsed.expiry || 0)) {
        this.logout();
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return Boolean(this.getSession());
  }

  getToken() {
    return this.getSession()?.token || null;
  }

  getCurrentUser() {
    return this.getSession()?.user || null;
  }

  hasRole(...roles) {
    const role = this.getCurrentUser()?.role;
    return Boolean(role && roles.includes(role));
  }

  getAuthHeaders(extraHeaders = {}) {
    const token = this.getToken();
    return {
      ...extraHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { success: false, error: "Respuesta inválida del servidor" };
    }

    if (res.ok && data.success) {
      const session = {
        token: data.token,
        user: data.user,
        expiry: Date.now() + this.SESSION_DURATION_MS,
        loginTime: new Date().toISOString(),
      };
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || "No autorizado" };
  }

  async refreshSession() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!res.ok) {
        this.logout();
        return null;
      }

      const data = await res.json();
      if (!data?.success || !data?.user) {
        this.logout();
        return null;
      }

      const current = this.getSession();
      const session = {
        token,
        user: data.user,
        expiry: current?.expiry || Date.now() + this.SESSION_DURATION_MS,
        loginTime: current?.loginTime || new Date().toISOString(),
      };

      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return session.user;
    } catch {
      this.logout();
      return null;
    }
  }

  async updateMyProfile({ name, email, phone, password }) {
    const token = this.getToken();
    if (!token) return { success: false, error: "Debes iniciar sesión" };

    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: this.getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || "No se pudo actualizar el perfil" };
      }

      const current = this.getSession();
      const session = {
        token: data.token || token,
        user: data.user,
        expiry: current?.expiry || Date.now() + this.SESSION_DURATION_MS,
        loginTime: current?.loginTime || new Date().toISOString(),
      };
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: "No se pudo conectar al servidor" };
    }
  }

  async changeMyPassword(currentPassword, newPassword) {
    const token = this.getToken();
    if (!token) return { success: false, error: "Debes iniciar sesión" };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: this.getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || "No se pudo cambiar la contraseña" };
      }

      return { success: true };
    } catch {
      return { success: false, error: "No se pudo conectar al servidor" };
    }
  }

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  getSessionInfo() {
    const session = this.getSession();
    if (!session) return null;

    try {
      return {
        loginTime: session.loginTime,
        expiryTime: new Date(session.expiry).toISOString(),
        user: session.user,
      };
    } catch {
      return null;
    }
  }
}

const authService = new AuthService();
export default authService;
