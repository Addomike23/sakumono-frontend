import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth.api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("sch_user");
    const token = localStorage.getItem("sch_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem("sch_token", data.token);
    localStorage.setItem("sch_user", JSON.stringify(data.user));
    setUser(data.user);
    setProfile(data.profile || null);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem("sch_token", data.token);
    localStorage.setItem("sch_user", JSON.stringify(data.user));
    setUser(data.user);
    setProfile(data.profile || null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Continue clearing local session even if request fails
    } finally {
      localStorage.removeItem("sch_token");
      localStorage.removeItem("sch_user");
      setUser(null);
      setProfile(null);
      toast.success("Logged out successfully");
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await authApi.getProfile();
    setUser(data.user);
    setProfile(data.profile || null);
    localStorage.setItem("sch_user", JSON.stringify(data.user));
    return data;
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
