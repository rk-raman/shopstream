"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "customer" | "seller";
  redirectTo?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo,
  fallback,
}) => {
  const router = useRouter();
  const {
    user,
    userRole,
    isLoading,
    isCustomerAuthenticated,
    isSellerAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // If no specific role required, check if any user is authenticated
      if (!requiredRole) {
        if (!isCustomerAuthenticated && !isSellerAuthenticated) {
          router.push(redirectTo || "/login");
          return;
        }
      } else {
        // Check specific role authentication
        const isAuthenticated =
          requiredRole === "customer"
            ? isCustomerAuthenticated
            : isSellerAuthenticated;

        if (!isAuthenticated) {
          const defaultRedirect =
            requiredRole === "customer" ? "/login" : "/seller/login";
          router.push(redirectTo || defaultRedirect);
          return;
        }

        // Check if user has the correct role
        if (userRole && userRole !== requiredRole) {
          const wrongRoleRedirect =
            userRole === "customer"
              ? "/customer/dashboard"
              : "/seller/dashboard";
          router.push(wrongRoleRedirect);
          return;
        }
      }
    }
  }, [
    isLoading,
    isCustomerAuthenticated,
    isSellerAuthenticated,
    userRole,
    requiredRole,
    router,
    redirectTo,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Check authentication
  if (!requiredRole) {
    if (!isCustomerAuthenticated && !isSellerAuthenticated) {
      return null; // Will redirect in useEffect
    }
  } else {
    const isAuthenticated =
      requiredRole === "customer"
        ? isCustomerAuthenticated
        : isSellerAuthenticated;

    if (!isAuthenticated || (userRole && userRole !== requiredRole)) {
      return null; // Will redirect in useEffect
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
