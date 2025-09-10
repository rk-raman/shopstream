"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/global";
import {
  getCurrentUser,
  getCurrentUserRole,
  isAuthenticated,
  logout as logoutService,
} from "../services/AuthService";

interface AuthContextType {
  user: User | null;
  userRole: "customer" | "seller" | null;
  isLoading: boolean;
  isCustomerAuthenticated: boolean;
  isSellerAuthenticated: boolean;
  login: (user: User, role: "customer" | "seller") => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"customer" | "seller" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  const isCustomerAuthenticated = isAuthenticated("customer");
  const isSellerAuthenticated = isAuthenticated("seller");

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const role = getCurrentUserRole();
        if (role) {
          setUserRole(role);
          // Fetch current user data
          const response = await getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear invalid tokens
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = (userData: User, role: "customer" | "seller") => {
    setUser(userData);
    setUserRole(role);
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutService(userRole || undefined);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setUserRole(null);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      if (userRole) {
        const response = await getCurrentUser();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      // If refresh fails, logout user
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    userRole,
    isLoading,
    isCustomerAuthenticated,
    isSellerAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
