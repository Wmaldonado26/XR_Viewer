import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../api/services/authService";

const PrivateRoute = ({ children, roles = null, redirectTo = "/login" }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      const session = authService.initialize();

      if (!session) {
        if (isMounted) {
          setHasAccess(false);
          setIsChecking(false);
          navigate(redirectTo);
        }
        return;
      }

      const refreshedUser = await authService.refreshSession();
      const currentUser = refreshedUser || authService.getCurrentUser();

      if (!currentUser) {
        if (isMounted) {
          setHasAccess(false);
          setIsChecking(false);
          navigate(redirectTo);
        }
        return;
      }

      if (roles && !roles.includes(currentUser.role)) {
        if (isMounted) {
          setHasAccess(false);
          setIsChecking(false);
          navigate((currentUser.role === "admin" || currentUser.role === "project_admin") ? "/admin" : "/gallery");
        }
        return;
      }

      if (isMounted) {
        setHasAccess(true);
        setIsChecking(false);
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [navigate, redirectTo, roles]);

  if (isChecking) {
    return <div className="loading-screen">Verificando acceso...</div>;
  }

  return hasAccess ? children : null;
};

export default PrivateRoute;
