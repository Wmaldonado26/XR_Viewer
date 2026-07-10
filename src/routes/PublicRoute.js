import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../api/services/authService";

const PublicRoute = ({ children, redirectByRole = true }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (redirectByRole && authService.isAuthenticated() && currentUser) {
      navigate((currentUser.role === "admin" || currentUser.role === "project_admin") ? "/admin" : "/gallery");
    }
  }, [navigate, redirectByRole]);

  return children;
};

export default PublicRoute;
