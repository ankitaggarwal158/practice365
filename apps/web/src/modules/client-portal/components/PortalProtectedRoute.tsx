import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export const PortalProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("portalAccessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
