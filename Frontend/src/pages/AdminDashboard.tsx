import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios";

interface DashboardData {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalVendors: number;
    totalSales: number;
    pendingOrders: number;
}

const AdminDashboard = () => {

    const [data, setData] =
        useState<DashboardData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                setLoading(true);

                const response =
                    await API.get<DashboardData>(
                        "/admin/dashboard"
                    );

                setData(response.data);

                setError("");

            } catch (err: any) {

                console.error(
                    "Admin dashboard error:",
                    err
                );

                setError(
                    err?.response?.data ||
                    "Unable to load dashboard."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchDashboard();

    }, []);


    if (loading) {

        return (
            <div className="admin-page">

                <h1>
                    Admin Dashboard
                </h1>

                <p>
                    Loading dashboard...
                </p>

            </div>
        );
    }


    if (error) {

        return (
            <div className="admin-page">

                <h1>
                    Admin Dashboard
                </h1>

                <div className="alert alert-danger">
                    {error}
                </div>

            </div>
        );
    }


    if (!data) {
        return null;
    }


    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <div>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Welcome to Dunique
                        Shopping App administration.
                    </p>

                </div>

            </div>


            {/* STATISTICS */}

            <div className="admin-stats">


                <div className="admin-stat-card">

                    <span>
                        Total Products
                    </span>

                    <strong>
                        {data.totalProducts}
                    </strong>

                    <Link
                        to="/admin/products"
                    >
                        View Products →
                    </Link>

                </div>


                <div className="admin-stat-card">

                    <span>
                        Total Orders
                    </span>

                    <strong>
                        {data.totalOrders}
                    </strong>

                    <Link
                        to="/admin/orders"
                    >
                        View Orders →
                    </Link>

                </div>


                <div className="admin-stat-card">

                    <span>
                        Customers
                    </span>

                    <strong>
                        {data.totalCustomers}
                    </strong>

                    <Link
                        to="/admin/customers"
                    >
                        View Customers →
                    </Link>

                </div>


                <div className="admin-stat-card">

                    <span>
                        Vendors
                    </span>

                    <strong>
                        {data.totalVendors}
                    </strong>

                    <Link
                        to="/admin/vendors"
                    >
                        View Vendors →
                    </Link>

                </div>


                <div className="admin-stat-card">

                    <span>
                        Total Sales
                    </span>

                    <strong>
                        ₹
                        {Number(
                            data.totalSales
                        ).toLocaleString("en-IN")}
                    </strong>

                </div>


                <div className="admin-stat-card">

                    <span>
                        Pending Orders
                    </span>

                    <strong>
                        {data.pendingOrders}
                    </strong>

                    <Link
                        to="/admin/orders"
                    >
                        Manage Orders →
                    </Link>

                </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="admin-section">

                <h2>
                    Quick Actions
                </h2>


                <div className="admin-actions">

                    <Link
                        to="/admin/products"
                        className="btn btn-primary"
                    >
                        Manage Products
                    </Link>


                    <Link
                        to="/admin/orders"
                        className="btn btn-primary"
                    >
                        Manage Orders
                    </Link>


                    <Link
                        to="/admin/vendors"
                        className="btn btn-primary"
                    >
                        Manage Vendors
                    </Link>


                    <Link
                        to="/admin/customers"
                        className="btn btn-primary"
                    >
                        Manage Customers
                    </Link>

                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;