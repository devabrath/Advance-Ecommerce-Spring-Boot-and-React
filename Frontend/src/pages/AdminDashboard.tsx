import React, { useEffect, useState } from "react";
import API from "../axios";

type Period =
    | "week"
    | "month"
    | "year";


interface RevenuePoint {
    label: string;
    revenue: number;
    orders: number;
}


interface DashboardData {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalVendors: number;
    pendingOrders: number;
    revenueData: RevenuePoint[];
}


const AdminDashboard = () => {

    const [period, setPeriod] =
        useState<Period>("month");


    const [data, setData] =
        useState<DashboardData | null>(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const fetchDashboard = async (
        selectedPeriod: Period
    ) => {

        try {

            setLoading(true);

            const response =
                await API.get<DashboardData>(
                    `/admin/dashboard?period=${selectedPeriod}`
                );

            setData(response.data);

            setError("");

        } catch (err: any) {

            console.error(
                "Dashboard error:",
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


    useEffect(() => {

        fetchDashboard(period);

    }, [period]);


    if (loading) {

        return (
            <div className="admin-dashboard-loading">

                <div className="loading-spinner"></div>

                <p>
                    Loading dashboard...
                </p>

            </div>
        );
    }


    if (error) {

        return (
            <div className="admin-dashboard">

                <div className="dashboard-error">
                    {error}
                </div>

            </div>
        );
    }


    if (!data) {
        return null;
    }


    const maxRevenue =
        Math.max(
            ...data.revenueData.map(
                item =>
                    Number(item.revenue)
            ),
            1
        );


    return (

        <div className="admin-dashboard">

            {/* HEADER */}

            <div className="dashboard-header">

                <div>

                    {/* <h3>
                        Dashboard
                    </h3> */}

                </div>

                <div className="dashboard-date">

                    {new Date().toLocaleDateString(
                        "en-IN",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }
                    )}

                </div>

            </div>


            {/* STAT CARDS */}

            <div className="dashboard-stats">

                <div className="dashboard-card">

                    <div className="stat-top">

                        <div className="stat-icon revenue-icon">
                            ₹
                        </div>

                        <span className="stat-label">
                            Total Revenue
                        </span>

                    </div>

                    <h2>
                        ₹
                        {Number(
                            data.totalRevenue
                        ).toLocaleString(
                            "en-IN"
                        )}
                    </h2>

                    <span className="stat-description">
                        Excluding cancelled orders
                    </span>

                </div>


                <div className="dashboard-card">

                    <div className="stat-top">

                        <div className="stat-icon orders-icon">
                            🛒
                        </div>

                        <span className="stat-label">
                            Total Orders
                        </span>

                    </div>

                    <h2>
                        {data.totalOrders}
                    </h2>

                    <span className="stat-description">
                        All customer orders
                    </span>

                </div>


                <div className="dashboard-card">

                    <div className="stat-top">

                        <div className="stat-icon products-icon">
                            📦
                        </div>

                        <span className="stat-label">
                            Total Products
                        </span>

                    </div>

                    <h2>
                        {data.totalProducts}
                    </h2>

                    <span className="stat-description">
                        Products in store
                    </span>

                </div>


                <div className="dashboard-card">

                    <div className="stat-top">

                        <div className="stat-icon customers-icon">
                            👥
                        </div>

                        <span className="stat-label">
                            Total Users
                        </span>

                    </div>

                    <h2>
                        {data.totalUsers}
                    </h2>

                    <span className="stat-description">
                        Registered customers
                    </span>

                </div>


                <div className="dashboard-card">

                    <div className="stat-top">

                        <div className="stat-icon vendors-icon">
                            🏪
                        </div>

                        <span className="stat-label">
                            Vendors
                        </span>

                    </div>

                    <h2>
                        {data.totalVendors}
                    </h2>

                    <span className="stat-description">
                        Active vendor accounts
                    </span>

                </div>


                <div className="dashboard-card">

                    <div className="stat-top">

                        <div className="stat-icon pending-icon">
                            ⏳
                        </div>

                        <span className="stat-label">
                            Pending Orders
                        </span>

                    </div>

                    <h2>
                        {data.pendingOrders}
                    </h2>

                    <span className="stat-description">
                        Placed + confirmed
                    </span>

                </div>

            </div>


            {/* REVENUE PANEL */}

            <div className="dashboard-panel">

                <div className="panel-header">

                    <div>

                        <h3>
                            Revenue Overview
                        </h3>

                        <p>
                            Revenue and order performance
                        </p>

                    </div>


                    <div className="period-selector">

                        <button
                            className={
                                period === "week"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setPeriod("week")
                            }
                        >
                            Week
                        </button>

                        <button
                            className={
                                period === "month"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setPeriod("month")
                            }
                        >
                            Month
                        </button>

                        <button
                            className={
                                period === "year"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setPeriod("year")
                            }
                        >
                            Year
                        </button>

                    </div>

                </div>


                {/* CHART */}

                <div className="revenue-chart">

                    <div className="chart-y-axis">

                        <span>
                            ₹
                            {Math.round(
                                maxRevenue
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </span>

                        <span>
                            ₹
                            {Math.round(
                                maxRevenue / 2
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </span>

                        <span>
                            ₹0
                        </span>

                    </div>


                    <div className="chart-area">

                        <div className="chart-horizontal-line"></div>
                        <div className="chart-horizontal-line"></div>
                        <div className="chart-horizontal-line"></div>


                        <div className="chart-bars">

                            {data.revenueData.map(
                                (item) => {

                                    const revenue =
                                        Number(
                                            item.revenue
                                        );


                                    const height =
                                        Math.max(
                                            (revenue /
                                                maxRevenue) *
                                                100,
                                            revenue > 0
                                                ? 5
                                                : 2
                                        );


                                    return (

                                        <div
                                            className="chart-column"
                                            key={
                                                item.label
                                            }
                                        >

                                            <div
                                                className="chart-value"
                                            >
                                                {revenue > 0
                                                    ? `₹${revenue.toLocaleString(
                                                        "en-IN"
                                                    )}`
                                                    : "₹0"
                                                }
                                            </div>


                                            <div
                                                className="chart-bar"
                                                style={{
                                                    height:
                                                        `${height}%`
                                                }}
                                                title={
                                                    `Revenue: ₹${revenue.toLocaleString(
                                                        "en-IN"
                                                    )} | Orders: ${item.orders}`
                                                }
                                            />


                                            <span className="chart-label">
                                                {
                                                    item.label
                                                }
                                            </span>


                                            <small className="chart-orders">
                                                {item.orders}
                                                {" "}
                                                orders
                                            </small>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default AdminDashboard;