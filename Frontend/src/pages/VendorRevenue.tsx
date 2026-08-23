import React, { useEffect, useState } from "react";
import API from "../axios";

interface RevenuePoint {
    label: string;
    revenue: number;
    orders: number;
}

interface ActivityPoint {
    label: string;
    count: number;
}

interface VendorRevenueData {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    revenueData: RevenuePoint[];
    orderActivity: ActivityPoint[];
    paymentActivity: ActivityPoint[];
}

const VendorRevenue = () => {
    const [data, setData] = useState<VendorRevenueData | null>(null);
    const [period, setPeriod] = useState("month");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // LOAD REVENUE
    const fetchRevenue = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get<VendorRevenueData>(
                `/vendor/revenue?period=${period}`
            );

            setData(response.data);
        } catch (err: any) {
            console.error("Vendor revenue error:", err);

            setError(
                err?.response?.data ||
                "Unable to load revenue."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenue();
    }, [period]);

    // LOADING
    if (loading) {
        return (
            <div className="admin-customers-page">
                <div className="customer-loading">Loading revenue...</div>
            </div>
        );
    }

    // ERROR
    if (error) {
        return (
            <div className="admin-customers-page">
                <div className="customer-error">{error}</div>
            </div>
        );
    }

    if (!data) return null;

    // CHART
    const points = data.revenueData || [];

    const maxRevenue = Math.max(
        ...points.map(point => Number(point.revenue)),
        1
    );

    const chartWidth = 700;
    const chartHeight = 250;
    const padding = 35;

    const getX = (index: number) => {
        if (points.length <= 1) return chartWidth / 2;

        return padding +
            (index / (points.length - 1)) *
            (chartWidth - padding * 2);
    };

    const getY = (revenue: number) => {
        return chartHeight -
            padding -
            (revenue / maxRevenue) *
            (chartHeight - padding * 2);
    };

    const linePoints = points
        .map((point, index) =>
            `${getX(index)},${getY(Number(point.revenue))}`
        )
        .join(" ");

    return (
        <div className="admin-customers-page">

            {/* HEADER */}
            <div className="customers-header">
                <div>
                    <h1>Revenue</h1>
                    <p>Track your shop's sales performance.</p>
                </div>

                <select
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                    style={{
                        padding: "10px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        background: "white",
                        outline: "none",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}
                >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            {/* STAT CARDS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "15px",
                    marginBottom: "20px"
                }}
            >
                {/* REVENUE */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px" }}
                >
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        Total Revenue
                    </span>

                    <h2 style={{ margin: "8px 0 4px", fontSize: "25px" }}>
                        ₹{Number(data.totalRevenue).toLocaleString("en-IN")}
                    </h2>

                    <small style={{ color: "#6b7280" }}>
                        Excluding cancelled orders
                    </small>
                </div>

                {/* ORDERS */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px" }}
                >
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        Total Orders
                    </span>

                    <h2 style={{ margin: "8px 0" }}>{data.totalOrders}</h2>
                </div>

                {/* PRODUCTS */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px" }}
                >
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        Total Products
                    </span>

                    <h2 style={{ margin: "8px 0" }}>{data.totalProducts}</h2>
                </div>

                {/* PENDING */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px" }}
                >
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        Pending Orders
                    </span>

                    <h2 style={{ margin: "8px 0" }}>{data.pendingOrders}</h2>
                </div>

                {/* DELIVERED */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px" }}
                >
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        Delivered
                    </span>

                    <h2 style={{ margin: "8px 0" }}>{data.deliveredOrders}</h2>
                </div>

                {/* CANCELLED */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px" }}
                >
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        Cancelled
                    </span>

                    <h2 style={{ margin: "8px 0" }}>{data.cancelledOrders}</h2>
                </div>
            </div>

            {/* SALES OVERVIEW */}
            <div
                className="customer-table-container"
                style={{ padding: "20px", marginBottom: "20px" }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px"
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, fontSize: "18px" }}>Sales Overview</h2>
                        <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: "12px" }}>
                            Revenue and orders
                        </p>
                    </div>
                </div>

                {/* CHART */}
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        width="100%"
                        height="280"
                        preserveAspectRatio="none"
                    >
                        {/* GRID */}
                        {[0, 1, 2, 3, 4].map(line => {
                            const y = padding +
                                line * ((chartHeight - padding * 2) / 4);

                            return (
                                <line
                                    key={line}
                                    x1={padding}
                                    y1={y}
                                    x2={chartWidth - padding}
                                    y2={y}
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* LINE */}
                        <polyline
                            points={linePoints}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* POINTS */}
                        {points.map((point, index) => (
                            <circle
                                key={index}
                                cx={getX(index)}
                                cy={getY(Number(point.revenue))}
                                r="5"
                                fill="#ffffff"
                                stroke="#2563eb"
                                strokeWidth="3"
                            />
                        ))}
                    </svg>

                    {/* LABELS */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0 20px",
                            color: "#6b7280",
                            fontSize: "11px"
                        }}
                    >
                        {points.map((point, index) => (
                            <span key={index}>{point.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ACTIVITIES */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px"
                }}
            >
                {/* ORDER ACTIVITY */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px" }}
                >
                    <h2 style={{ margin: "0 0 15px", fontSize: "17px" }}>
                        Order Activity
                    </h2>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                        }}
                    >
                        {data.orderActivity.map(activity => (
                            <div
                                key={activity.label}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "10px 0",
                                    borderBottom: "1px solid #f1f5f9"
                                }}
                            >
                                <span>{activity.label}</span>
                                <strong>{activity.count}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAYMENT ACTIVITY */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px" }}
                >
                    <h2 style={{ margin: "0 0 15px", fontSize: "17px" }}>
                        Payment Activity
                    </h2>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                        }}
                    >
                        {data.paymentActivity.map(activity => (
                            <div
                                key={activity.label}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "10px 0",
                                    borderBottom: "1px solid #f1f5f9"
                                }}
                            >
                                <span>{activity.label}</span>
                                <strong>{activity.count}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorRevenue;