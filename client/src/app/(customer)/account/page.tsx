import React from "react";
import { Metadata } from "next";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import ProfilePage from "@/features/customer/account/profile/ProfilePage";
//import ProfilePage from "@/features/customer/account/components/ProfilePage";

export const metadata: Metadata = {
  title: "Account - ShopStream",
  description: "account page",
};

export default function Page() {
  return <ProfilePage />;
}
