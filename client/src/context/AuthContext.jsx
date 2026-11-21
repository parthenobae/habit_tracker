import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("habit_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("habit_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then(({ data }) => {
      setUser(data.user); localStorage.setItem("habit_user", JSON.stringify(data.user));
    }).catch(() => { localStorage.removeItem("habit_token"); localStorage.removeItem("habit_user"); setUser(null); })
      .finally(() => setLoading(false));
  }, []);
  const authenticate = async (path, payload) => {
    const { data } = await api.post(`/auth/${path}`, payload);
    localStorage.setItem("habit_token", data.token);
    localStorage.setItem("habit_user", JSON.stringify(data.user));
    setUser(data.user);
  };
  const logout = () => { localStorage.removeItem("habit_token"); localStorage.removeItem("habit_user"); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login: p => authenticate("login", p), register: p => authenticate("register", p), logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
