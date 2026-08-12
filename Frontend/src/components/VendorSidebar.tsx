import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const VendorSidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside
            style={{
                width: "250px",
                minHeight: "100vh",
                position: "fixed",
                left: 0,
                top: 0,
                backgroundColor: "#ffffff",
                borderRight: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                zIndex: 1000
            }}
        >

            {/* LOGO */}

            <div
                style={{
                    padding: "24px 20px",
                    borderBottom: "1px solid #e5e7eb"
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
                        color: "#6b7280"
                    }}
                >
                    Vendor Panel
                </small>
            </div>


            {/* VENDOR INFO */}

            <div
                style={{
                    padding: "20px",
                    borderBottom: "1px solid #e5e7eb"
                }}
            >
                <div
                    style={{
                        fontWeight: "600"
                    }}
                >
                    Hello, {user?.firstName}
                </div>

                <small
                    style={{
                        color: "#6b7280"
                    }}
                >
                    Vendor
                </small>
            </div>


            {/* NAVIGATION */}

            <nav
                style={{
                    padding: "15px 10px",
                    flex: 1
                }}
            >

                <NavLink
                    to="/vendor/dashboard"
                    style={({ isActive }) => ({
                        display: "block",
                        padding: "12px 15px",
                        marginBottom: "5px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: isActive
                            ? "#2563eb"
                            : "#374151",
                        backgroundColor: isActive
                            ? "#eff6ff"
                            : "transparent",
                        fontWeight: isActive
                            ? "600"
                            : "400"
                    })}
                >
                    🏠 Dashboard
                </NavLink>


                <NavLink
                    to="/vendor/products"
                    style={({ isActive }) => ({
                        display: "block",
                        padding: "12px 15px",
                        marginBottom: "5px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: isActive
                            ? "#2563eb"
                            : "#374151",
                        backgroundColor: isActive
                            ? "#eff6ff"
                            : "transparent",
                        fontWeight: isActive
                            ? "600"
                            : "400"
                    })}
                >
                    📦 My Products
                </NavLink>


                <NavLink
                    to="/vendor/products/add"
                    style={({ isActive }) => ({
                        display: "block",
                        padding: "12px 15px",
                        marginBottom: "5px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: isActive
                            ? "#2563eb"
                            : "#374151",
                        backgroundColor: isActive
                            ? "#eff6ff"
                            : "transparent",
                        fontWeight: isActive
                            ? "600"
                            : "400"
                    })}
                >
                    ➕ Add Product
                </NavLink>


                <NavLink
                    to="/vendor/orders"
                    style={({ isActive }) => ({
                        display: "block",
                        padding: "12px 15px",
                        marginBottom: "5px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: isActive
                            ? "#2563eb"
                            : "#374151",
                        backgroundColor: isActive
                            ? "#eff6ff"
                            : "transparent",
                        fontWeight: isActive
                            ? "600"
                            : "400"
                    })}
                >
                    🛒 Orders
                </NavLink>


                <NavLink
                    to="/vendor/profile"
                    style={({ isActive }) => ({
                        display: "block",
                        padding: "12px 15px",
                        marginBottom: "5px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: isActive
                            ? "#2563eb"
                            : "#374151",
                        backgroundColor: isActive
                            ? "#eff6ff"
                            : "transparent",
                        fontWeight: isActive
                            ? "600"
                            : "400"
                    })}
                >
                    👤 Profile
                </NavLink>

            </nav>


            {/* LOGOUT */}

            <div
                style={{
                    padding: "15px 10px",
                    borderTop: "1px solid #e5e7eb"
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
                        padding: "12px 15px",
                        borderRadius: "8px",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "15px"
                    }}
                >
                    🚪 Logout
                </button>

            </div>

        </aside>
    );
};

export default VendorSidebar;