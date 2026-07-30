"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { User, Role } from "@/types";
import { apiClient } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = Cookies.get("gearup_token");
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(savedToken);
      const res = await apiClient.get("/auth/me");
      if (res.data?.data) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user session:", err);
      Cookies.remove("gearup_token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    Cookies.set("gearup_token", newToken, { expires: 7 });
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    Cookies.remove("gearup_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const hasRole = (role: Role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, refreshUser, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
