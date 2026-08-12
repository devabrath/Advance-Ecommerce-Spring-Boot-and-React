import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({
    children,
    allowedRoles
}: ProtectedRouteProps) => {

    const { user, isAuthenticated } = useAuth();

    console.log("AUTH:", {
        user,
        isAuthenticated,
        role: user?.role
    });

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        allowedRoles &&
        user &&
        !allowedRoles.includes(user.role)
    ) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;