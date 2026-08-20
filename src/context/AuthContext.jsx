import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("lk_admin");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await api.adminLogin({ email, password });

    if (!res.status) {
      throw new Error(res.message || "Login failed");
    }

    const adminData = res.data;
    localStorage.setItem("lk_admin", JSON.stringify(adminData));
    localStorage.setItem("lk_authed", "1");
    setAdmin(adminData);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lk_admin");
    localStorage.removeItem("lk_authed");
    setAdmin(null);
  }, []);

  const isAuthenticated = !!admin;

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