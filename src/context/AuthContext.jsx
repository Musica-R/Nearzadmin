import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const isAdminUser = (user) =>
  !!user && String(user.role || "").toLowerCase() === "admin";

export function AuthProvider({ children }) {
  // Only trust a saved session if it belongs to an admin
  const [admin, setAdmin] = useState(() => {
    const saved = readJson("lk_admin");
    return isAdminUser(saved) ? saved : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await api.adminLogin({ email, password });

    // Backend replies { success, message, token, user }
    const ok = res?.success ?? res?.status;
    if (!ok) {
      throw new Error(res?.message || "Login failed");
    }

    const user = res.user;
    if (!user) {
      throw new Error("Login response did not include the user.");
    }

    // Only admins may enter this panel
    if (!isAdminUser(user)) {
      throw new Error("Access denied. Only admin accounts can sign in here.");
    }

    localStorage.setItem("lk_admin", JSON.stringify(user));
    // Same key the vendor site uses, so id + type are available everywhere
    localStorage.setItem("thozhaa_user", JSON.stringify(user));
    if (res.token) localStorage.setItem("lk_token", res.token);
    localStorage.setItem("lk_authed", "1");

    setAdmin(user);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lk_admin");
    localStorage.removeItem("thozhaa_user");
    localStorage.removeItem("lk_token");
    localStorage.removeItem("lk_authed");
    setAdmin(null);
  }, []);

  const isAuthenticated = isAdminUser(admin);

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}