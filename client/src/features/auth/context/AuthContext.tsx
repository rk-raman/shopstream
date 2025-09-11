"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { User } from "@/types/global";
import {
  getCurrentUser,
  getSellerCurrentUser,
  getCurrentUserRole,
  isAuthenticated,
  logout as logoutService,
  clearAllTokens,
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize authentication status to prevent unnecessary recalculations
  const isCustomerAuthenticated = useMemo(() => {
    return isAuthenticated("customer");
  }, [userRole]);

  const isSellerAuthenticated = useMemo(() => {
    return isAuthenticated("seller");
  }, [userRole]);

  // Initialize auth state only once
  useEffect(() => {
    if (isInitialized) return;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const role = getCurrentUserRole();

        if (role) {
          setUserRole(role);
          // Only fetch user data if we have a valid role and token
          try {
            const response =
              role === "customer"
                ? await getCurrentUser()
                : await getSellerCurrentUser();
            if (response.success && response.data?.user) {
              setUser(response.data.user);
            } else {
              // If getCurrentUser fails but we have a token, clear invalid state
              setUser(null);
              setUserRole(null);
            }
          } catch (error) {
            console.error("Failed to fetch current user:", error);
            // Clear invalid tokens on fetch failure
            setUser(null);
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isInitialized]);

  // Login handler
  const login = useCallback((userData: User, role: "customer" | "seller") => {
    setUser(userData);
    setUserRole(role);
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    clearAllTokens();

    // try {
    //   await logoutService(userRole || undefined);
    // } catch (error) {
    //   console.error("Logout error:", error);
    // } finally {
    //   setUser(null);
    //   setUserRole(null);
    // }
  }, [userRole]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!userRole || isLoading) return;

    try {
      const response = await getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        // If refresh fails, logout user
        await logout();
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      // If refresh fails, logout user
      await logout();
    }
  }, [userRole, isLoading, logout]);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      userRole,
      isLoading,
      isCustomerAuthenticated,
      isSellerAuthenticated,
      login,
      logout,
      refreshUser,
    }),
    [
      user,
      userRole,
      isLoading,
      isCustomerAuthenticated,
      isSellerAuthenticated,
      login,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
