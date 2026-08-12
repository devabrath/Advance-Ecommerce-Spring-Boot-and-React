import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const AdminLayout = () => {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {

        logout();

        navigate("/login");
    };

    return (

        <div className="admin-layout">

            {/* SIDEBAR */}

            <aside className="admin-sidebar">

                <div className="admin-logo">
                    Dunique
                    <span>Admin</span>
                </div>


                <nav className="admin-nav">

                    <NavLink
                        to="/admin/dashboard"
                    >
                        Dashboard
                    </NavLink>


                    <NavLink
                        to="/admin/products"
                    >
                        Products
                    </NavLink>


                    <NavLink
                        to="/admin/orders"
                    >
                        Orders
                    </NavLink>


                    <NavLink
                        to="/admin/customers"
                    >
                        Customers
                    </NavLink>


                    <NavLink
                        to="/admin/vendors"
                    >
                        Vendors
                    </NavLink>


                    <NavLink
                        to="/admin/categories"
                    >
                        Categories
                    </NavLink>


                    <NavLink
                        to="/admin/profile"
                    >
                        Profile
                    </NavLink>

                </nav>


                <div className="admin-sidebar-bottom">

                    <button
                        type="button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* MAIN CONTENT */}

            <main className="admin-main">

                <Outlet />

            </main>

        </div>
    );
};

export default AdminLayout;