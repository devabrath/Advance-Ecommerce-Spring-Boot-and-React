import React, { useEffect, useState } from "react";
import API from "../axios";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";


type Period =
    | "week"
    | "month"
    | "year";


interface RevenuePoint {
    label: string;
    revenue: number;
    orders: number;
}


interface OrderStatusPoint {

    label: string;

    placed: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;

    paymentSuccess: number;
    paymentPending: number;
    paymentFailed: number;
}


interface DashboardData {

    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalVendors: number;
    pendingOrders: number;

    revenueData: RevenuePoint[];

    orderStatusData: OrderStatusPoint[];
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


    // =====================================================
    // FETCH DASHBOARD
    // =====================================================

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


    // =====================================================
    // LOADING
    // =====================================================

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


    // =====================================================
    // ERROR
    // =====================================================

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


    // =====================================================
    // EXISTING REVENUE LOGIC
    // KEEPING THIS EXACTLY
    // =====================================================

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


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

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


            {/* ================================================= */}
            {/* STAT CARDS */}
            {/* ================================================= */}

            <div className="dashboard-stats">


                {/* TOTAL REVENUE */}

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


                {/* TOTAL ORDERS */}

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


                {/* TOTAL PRODUCTS */}

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


                {/* TOTAL USERS */}

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


                {/* VENDORS */}

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


                {/* PENDING ORDERS */}

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


            {/* ================================================= */}
            {/* REVENUE PANEL - DO NOT CHANGE
            {/* ================================================= */}

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


            {/* ================================================= */}
            {/* SMALL CHARTS - SIDE BY SIDE
            {/* ================================================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                    gap: "20px",
                    marginTop: "20px",
                    marginBottom: "30px"
                }}
            >


                {/* ================================================= */}
                {/* ORDER ACTIVITY */}
                {/* ================================================= */}

                <div
                    className="dashboard-panel"
                    style={{
                        margin: 0,
                        padding: "18px"
                    }}
                >

                    <div
                        className="panel-header"
                        style={{
                            marginBottom: "10px"
                        }}
                    >

                        <div>

                            <h3>
                                Order Activity
                            </h3>

                            <p>
                                Order status
                            </p>

                        </div>

                    </div>


                    <div
                        style={{
                            width: "100%",
                            height: "280px"
                        }}
                    >

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <LineChart
                                data={
                                    data.orderStatusData
                                }
                                margin={{
                                    top: 10,
                                    right: 5,
                                    left: -20,
                                    bottom: 5
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />


                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fontSize: 11
                                    }}
                                />


                                <YAxis
                                    allowDecimals={false}
                                    tick={{
                                        fontSize: 11
                                    }}
                                />


                                <Tooltip />


                                <Legend
                                    wrapperStyle={{
                                        fontSize:
                                            "11px"
                                    }}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="placed"
                                    name="Placed"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={false}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="confirmed"
                                    name="Confirmed"
                                    stroke="#16a34a"
                                    strokeWidth={2}
                                    dot={false}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="processing"
                                    name="Processing"
                                    stroke="#9333ea"
                                    strokeWidth={2}
                                    dot={false}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="shipped"
                                    name="Shipped"
                                    stroke="#ea580c"
                                    strokeWidth={2}
                                    dot={false}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="delivered"
                                    name="Delivered"
                                    stroke="#0891b2"
                                    strokeWidth={2}
                                    dot={false}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="cancelled"
                                    name="Cancelled"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                    dot={false}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* ================================================= */}
                {/* PAYMENT ACTIVITY */}
                {/* ================================================= */}

                <div
                    className="dashboard-panel"
                    style={{
                        margin: 0,
                        padding: "18px"
                    }}
                >

                    <div
                        className="panel-header"
                        style={{
                            marginBottom: "10px"
                        }}
                    >

                        <div>

                            <h3>
                                Payment Activity
                            </h3>

                            <p>
                                Payment status
                            </p>

                        </div>

                    </div>


                    <div
                        style={{
                            width: "100%",
                            height: "280px"
                        }}
                    >

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <LineChart
                                data={
                                    data.orderStatusData
                                }
                                margin={{
                                    top: 10,
                                    right: 5,
                                    left: -20,
                                    bottom: 5
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />


                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fontSize: 11
                                    }}
                                />


                                <YAxis
                                    allowDecimals={false}
                                    tick={{
                                        fontSize: 11
                                    }}
                                />


                                <Tooltip />


                                <Legend
                                    wrapperStyle={{
                                        fontSize:
                                            "11px"
                                    }}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="paymentSuccess"
                                    name="Success"
                                    stroke="#16a34a"
                                    strokeWidth={2}
                                    dot={false}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="paymentPending"
                                    name="Pending"
                                    stroke="#ca8a04"
                                    strokeWidth={2}
                                    dot={false}
                                />


                                <Line
                                    type="monotone"
                                    dataKey="paymentFailed"
                                    name="Failed"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                    dot={false}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default AdminDashboard;