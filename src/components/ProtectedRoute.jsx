import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("loginData");

      if (!stored) {
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      const loginData = JSON.parse(stored);
      const token = loginData?.token;
      const expirationTime = loginData?.expirationTime;

      const now = Math.floor(Date.now() / 1000);
      const isTokenValid = token && (!expirationTime || now < expirationTime);

      if (!isTokenValid) {
        localStorage.removeItem("loginData");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }

    } catch (err) {
      console.error("Invalid login data:", err);
      localStorage.removeItem("loginData");
      setIsAuthenticated(false);
    } finally {
      setAuthChecked(true);
    }
  }, [location.key]); // re-check every navigation change

  if (!authChecked) return null; // prevents flash of dashboard before redirect

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};

export default ProtectedRoute;
