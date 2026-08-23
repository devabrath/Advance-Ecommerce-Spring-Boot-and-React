import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

interface Props {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

const VendorSidebar = ({
    darkMode,
    setDarkMode
}: Props) => {

    // Router
    const navigate = useNavigate();

    // Authentication
    const { user, logout } = useAuth();

    // Logout user
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Navigation link style
    const linkStyle = ({
        isActive
    }: {
        isActive: boolean
    }) => ({
        display: "block",
        padding: "11px 15px",
        marginBottom: "5px",
        borderRadius: "8px",
        textDecoration: "none",

        color: isActive
            ? "#2563eb"
            : darkMode
                ? "#d1d5db"
                : "#374151",

        backgroundColor: isActive
            ? darkMode
                ? "#172554"
                : "#eff6ff"
            : "transparent",

        fontWeight: isActive
            ? "600"
            : "400",

        fontSize: "14px"
    });

    return (
        <aside
            style={{
                width: "250px",
                height: "100vh",
                position: "fixed",
                left: 0,
                top: 0,

                backgroundColor: darkMode
                    ? "#111827"
                    : "#ffffff",

                borderRight: darkMode
                    ? "1px solid #1f2937"
                    : "1px solid #e5e7eb",

                display: "flex",
                flexDirection: "column",
                zIndex: 1000
            }}
        >

            {/* Logo */}
            <div
                style={{
                    padding: "18px 20px",

                    borderBottom: darkMode
                        ? "1px solid #1f2937"
                        : "1px solid #e5e7eb",

                    flexShrink: 0
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontWeight: "700",
                        color: "#2563eb"
                    }}
                >
                    Dunique
                </h3>

                <small
                    style={{
                        color: darkMode
                            ? "#9ca3af"
                            : "#6b7280"
                    }}
                >
                    Vendor Panel
                </small>
            </div>

            {/* Vendor info */}
            <div
                style={{
                    padding: "14px 20px",

                    borderBottom: darkMode
                        ? "1px solid #1f2937"
                        : "1px solid #e5e7eb",

                    flexShrink: 0
                }}
            >
                <div
                    style={{
                        fontWeight: "600",
                        fontSize: "14px",

                        color: darkMode
                            ? "#f9fafb"
                            : "#111827"
                    }}
                >
                    Hello, {user?.firstName}
                </div>

                <small
                    style={{
                        color: darkMode
                            ? "#9ca3af"
                            : "#6b7280"
                    }}
                >
                    Vendor
                </small>
            </div>

            {/* Navigation */}
            <nav
                style={{
                    padding: "15px 10px",
                    flex: 1,
                    overflowY: "auto",
                    minHeight: 0
                }}
            >
                <NavLink
                    to="/vendor/dashboard"
                    style={linkStyle}
                >
                    🏠 Dashboard
                </NavLink>

                <NavLink
                    to="/vendor/revenue"
                    style={linkStyle}
                >
                    💰 Revenue
                </NavLink>

                <NavLink
                    to="/vendor/products"
                    style={linkStyle}
                >
                    📦 Manage Products
                </NavLink>

                <NavLink
                    to="/vendor/orders"
                    style={linkStyle}
                >
                    🛒 Manage Orders
                </NavLink>

                <NavLink
                    to="/vendor/profile"
                    style={linkStyle}
                >
                    👤 Profile
                </NavLink>
            </nav>

            {/* Theme toggle */}
            <div
                style={{
                    padding: "10px",

                    borderTop: darkMode
                        ? "1px solid #1f2937"
                        : "1px solid #e5e7eb",

                    flexShrink: 0
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        setDarkMode(!darkMode)
                    }
                    style={{
                        width: "100%",
                        border: "none",

                        background: darkMode
                            ? "#1f2937"
                            : "#f3f4f6",

                        color: darkMode
                            ? "#f9fafb"
                            : "#374151",

                        textAlign: "left",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    {darkMode
                        ? "☀️ Light Mode"
                        : "🌙 Dark Mode"}
                </button>
            </div>

            {/* Logout */}
            <div
                style={{
                    padding: "10px",

                    borderTop: darkMode
                        ? "1px solid #1f2937"
                        : "1px solid #e5e7eb",

                    flexShrink: 0
                }}
            >
                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        textAlign: "left",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    🚪 Logout
                </button>
            </div>

        </aside>
    );
};

export default VendorSidebar;