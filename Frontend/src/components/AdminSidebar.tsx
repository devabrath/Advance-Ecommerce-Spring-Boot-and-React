import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const AdminSidebar = () => {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const linkStyle = ({
        isActive
    }: {
        isActive: boolean
    }) => ({
        display: "block",
        padding: "10px 15px",
        marginBottom: "4px",
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
                    padding: "18px 20px",
                    borderBottom: "1px solid #e5e7eb",
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
                        color: "#6b7280"
                    }}
                >
                    Admin Panel
                </small>

            </div>


            {/* ADMIN INFO */}

            <div
                style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid #e5e7eb",
                    flexShrink: 0
                }}
            >

                <div
                    style={{
                        fontWeight: "600",
                        fontSize: "14px"
                    }}
                >
                    Hello, {user?.firstName}
                </div>

                <small
                    style={{
                        color: "#6b7280"
                    }}
                >
                    Administrator
                </small>

            </div>


            {/* SCROLLABLE NAVIGATION */}

            <nav
                style={{
                    padding: "12px 10px",
                    flex: 1,
                    overflowY: "auto",
                    minHeight: 0
                }}
            >

                <NavLink
                    to="/admin/dashboard"
                    style={linkStyle}
                >
                    🏠 Dashboard
                </NavLink>


                <NavLink
                    to="/admin/products"
                    style={linkStyle}
                >
                    📦 Products
                </NavLink>


                <NavLink
                    to="/admin/products/add"
                    style={linkStyle}
                >
                    ➕ Add Product
                </NavLink>


                <NavLink
                    to="/admin/orders"
                    style={linkStyle}
                >
                    🛒 Orders
                </NavLink>


                <NavLink
                    to="/admin/customers"
                    style={linkStyle}
                >
                    👥 Customers
                </NavLink>


                <NavLink
                    to="/admin/vendors"
                    style={linkStyle}
                >
                    🏪 Vendors
                </NavLink>


                <NavLink
                    to="/admin/categories"
                    style={linkStyle}
                >
                    🗂️ Categories
                </NavLink>


                <NavLink
                    to="/admin/profile"
                    style={linkStyle}
                >
                    👤 Profile
                </NavLink>

            </nav>


            {/* LOGOUT — ALWAYS VISIBLE */}

            <div
                style={{
                    padding: "10px",
                    borderTop: "1px solid #e5e7eb",
                    flexShrink: 0,
                    backgroundColor: "#ffffff"
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

export default AdminSidebar;