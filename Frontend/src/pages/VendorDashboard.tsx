import React, { useEffect, useMemo, useState } from "react";
import API from "../axios";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type Period = "week" | "month" | "year";

interface Product {
    id: number;
    name?: string;
    price?: number;
    stockQuantity?: number;
    productAvailable?: boolean;
}

interface OrderItem {
    productId?: number;
    productName?: string;
    unitPrice?: number;
    quantity?: number;
    totalPrice?: number;
}

interface Order {
    orderId: number;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt?: string;
    items?: OrderItem[];
}

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

const VendorDashboard = () => {
    const [period, setPeriod] = useState<Period>("month");
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch dashboard data
    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [productsResponse, ordersResponse] = await Promise.all([
                API.get<Product[]>("/vendor/products"),
                API.get<Order[]>("/vendor/orders")
            ]);

            setProducts(productsResponse.data);
            setOrders(ordersResponse.data);
        } catch (err: any) {
            console.error("Vendor dashboard error:", err);
            setError(err?.response?.data || "Unable to load dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // Basic statistics
    const totalProducts = products.length;
    const totalOrders = orders.length;

    const totalRevenue = orders
        .filter(order => order.orderStatus !== "CANCELLED")
        .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

    const pendingOrders = orders.filter(
        order => order.orderStatus === "PLACED" || order.orderStatus === "CONFIRMED"
    ).length;

    const deliveredOrders = orders.filter(order => order.orderStatus === "DELIVERED").length;
    const cancelledOrders = orders.filter(order => order.orderStatus === "CANCELLED").length;

    // Revenue chart data
    const revenueData = useMemo(() => {
        const result: RevenuePoint[] = [];
        const now = new Date();

        if (period === "week") {
            const day = now.getDay();
            const diff = day === 0 ? -6 : 1 - day;
            const monday = new Date(now);

            monday.setDate(now.getDate() + diff);

            for (let i = 0; i < 7; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);

                const revenue = orders
                    .filter(order => {
                        if (!order.createdAt) return false;

                        const orderDate = new Date(order.createdAt);

                        return orderDate.getFullYear() === date.getFullYear()
                            && orderDate.getMonth() === date.getMonth()
                            && orderDate.getDate() === date.getDate();
                    })
                    .filter(order => order.orderStatus !== "CANCELLED")
                    .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

                const orderCount = orders.filter(order => {
                    if (!order.createdAt) return false;

                    const orderDate = new Date(order.createdAt);

                    return orderDate.getFullYear() === date.getFullYear()
                        && orderDate.getMonth() === date.getMonth()
                        && orderDate.getDate() === date.getDate();
                }).length;

                result.push({
                    label: date.toLocaleDateString("en-IN", { weekday: "short" }),
                    revenue,
                    orders: orderCount
                });
            }
        } else if (period === "month") {
            const year = now.getFullYear();
            const month = now.getMonth();

            for (let week = 1; week <= 5; week++) {
                const startDay = ((week - 1) * 7) + 1;
                const lastDay = new Date(year, month + 1, 0).getDate();

                if (startDay > lastDay) break;

                const endDay = Math.min(startDay + 6, lastDay);

                const revenue = orders
                    .filter(order => {
                        if (!order.createdAt) return false;

                        const date = new Date(order.createdAt);

                        return date.getFullYear() === year
                            && date.getMonth() === month
                            && date.getDate() >= startDay
                            && date.getDate() <= endDay;
                    })
                    .filter(order => order.orderStatus !== "CANCELLED")
                    .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

                const orderCount = orders.filter(order => {
                    if (!order.createdAt) return false;

                    const date = new Date(order.createdAt);

                    return date.getFullYear() === year
                        && date.getMonth() === month
                        && date.getDate() >= startDay
                        && date.getDate() <= endDay;
                }).length;

                result.push({ label: `Week ${week}`, revenue, orders: orderCount });
            }
        } else {
            const year = now.getFullYear();

            for (let month = 0; month < 12; month++) {
                const revenue = orders
                    .filter(order => {
                        if (!order.createdAt) return false;

                        const date = new Date(order.createdAt);

                        return date.getFullYear() === year && date.getMonth() === month;
                    })
                    .filter(order => order.orderStatus !== "CANCELLED")
                    .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

                const orderCount = orders.filter(order => {
                    if (!order.createdAt) return false;

                    const date = new Date(order.createdAt);

                    return date.getFullYear() === year && date.getMonth() === month;
                }).length;

                const date = new Date(year, month, 1);

                result.push({
                    label: date.toLocaleDateString("en-IN", { month: "short" }),
                    revenue,
                    orders: orderCount
                });
            }
        }

        return result;
    }, [orders, period]);

    // Order and payment activity
    const orderStatusData = useMemo(() => {
        const result: OrderStatusPoint[] = [];
        const now = new Date();

        const createStatusPoint = (label: string, matchingOrders: Order[]) => ({
            label,
            placed: matchingOrders.filter(o => o.orderStatus === "PLACED").length,
            confirmed: matchingOrders.filter(o => o.orderStatus === "CONFIRMED").length,
            processing: matchingOrders.filter(o => o.orderStatus === "PROCESSING").length,
            shipped: matchingOrders.filter(o => o.orderStatus === "SHIPPED").length,
            delivered: matchingOrders.filter(o => o.orderStatus === "DELIVERED").length,
            cancelled: matchingOrders.filter(o => o.orderStatus === "CANCELLED").length,
            paymentSuccess: matchingOrders.filter(o => o.paymentStatus === "SUCCESS").length,
            paymentPending: matchingOrders.filter(o => o.paymentStatus === "PENDING").length,
            paymentFailed: matchingOrders.filter(o => o.paymentStatus === "FAILED").length
        });

        if (period === "week") {
            const day = now.getDay();
            const diff = day === 0 ? -6 : 1 - day;
            const monday = new Date(now);

            monday.setDate(now.getDate() + diff);

            for (let i = 0; i < 7; i++) {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);

                const matchingOrders = orders.filter(order => {
                    if (!order.createdAt) return false;

                    const orderDate = new Date(order.createdAt);

                    return orderDate.getFullYear() === date.getFullYear()
                        && orderDate.getMonth() === date.getMonth()
                        && orderDate.getDate() === date.getDate();
                });

                result.push(createStatusPoint(
                    date.toLocaleDateString("en-IN", { weekday: "short" }),
                    matchingOrders
                ));
            }
        } else if (period === "month") {
            const year = now.getFullYear();
            const month = now.getMonth();
            const lastDay = new Date(year, month + 1, 0).getDate();

            for (let week = 1; week <= 5; week++) {
                const startDay = ((week - 1) * 7) + 1;

                if (startDay > lastDay) break;

                const endDay = Math.min(startDay + 6, lastDay);

                const matchingOrders = orders.filter(order => {
                    if (!order.createdAt) return false;

                    const date = new Date(order.createdAt);

                    return date.getFullYear() === year
                        && date.getMonth() === month
                        && date.getDate() >= startDay
                        && date.getDate() <= endDay;
                });

                result.push(createStatusPoint(`Week ${week}`, matchingOrders));
            }
        } else {
            const year = now.getFullYear();

            for (let month = 0; month < 12; month++) {
                const matchingOrders = orders.filter(order => {
                    if (!order.createdAt) return false;

                    const date = new Date(order.createdAt);

                    return date.getFullYear() === year && date.getMonth() === month;
                });

                const date = new Date(year, month, 1);

                result.push(createStatusPoint(
                    date.toLocaleDateString("en-IN", { month: "short" }),
                    matchingOrders
                ));
            }
        }

        return result;
    }, [orders, period]);

    // Maximum revenue
    const maxRevenue = Math.max(...revenueData.map(item => Number(item.revenue)), 1);

    // Loading
    if (loading) {
        return (
            <div className="admin-dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div></div>
                <div className="dashboard-date">
                    {new Date().toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    })}
                </div>
            </div>

            <div className="dashboard-stats">
                <div className="dashboard-card">
                    <div className="stat-top">
                        <div className="stat-icon revenue-icon">₹</div>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                    <h2>₹{Number(totalRevenue).toLocaleString("en-IN")}</h2>
                    <span className="stat-description">Excluding cancelled orders</span>
                </div>

                <div className="dashboard-card">
                    <div className="stat-top">
                        <div className="stat-icon orders-icon">🛒</div>
                        <span className="stat-label">Total Orders</span>
                    </div>
                    <h2>{totalOrders}</h2>
                    <span className="stat-description">All customer orders</span>
                </div>

                <div className="dashboard-card">
                    <div className="stat-top">
                        <div className="stat-icon products-icon">📦</div>
                        <span className="stat-label">Total Products</span>
                    </div>
                    <h2>{totalProducts}</h2>
                    <span className="stat-description">Your products</span>
                </div>

                <div className="dashboard-card">
                    <div className="stat-top">
                        <div className="stat-icon pending-icon">⏳</div>
                        <span className="stat-label">Pending Orders</span>
                    </div>
                    <h2>{pendingOrders}</h2>
                    <span className="stat-description">Placed + confirmed</span>
                </div>

                <div className="dashboard-card">
                    <div className="stat-top">
                        <div className="stat-icon customers-icon">✓</div>
                        <span className="stat-label">Delivered</span>
                    </div>
                    <h2>{deliveredOrders}</h2>
                    <span className="stat-description">Successfully delivered</span>
                </div>

                <div className="dashboard-card">
                    <div className="stat-top">
                        <div className="stat-icon vendors-icon">✕</div>
                        <span className="stat-label">Cancelled</span>
                    </div>
                    <h2>{cancelledOrders}</h2>
                    <span className="stat-description">Cancelled orders</span>
                </div>
            </div>

            <div className="dashboard-panel">
                <div className="panel-header">
                    <div>
                        <h3>Revenue Overview</h3>
                        <p>Your revenue and order performance</p>
                    </div>

                    <div className="period-selector">
                        <button className={period === "week" ? "active" : ""} onClick={() => setPeriod("week")}>Week</button>
                        <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")}>Month</button>
                        <button className={period === "year" ? "active" : ""} onClick={() => setPeriod("year")}>Year</button>
                    </div>
                </div>

                <div className="revenue-chart">
                    <div className="chart-y-axis">
                        <span>₹{Math.round(maxRevenue).toLocaleString("en-IN")}</span>
                        <span>₹{Math.round(maxRevenue / 2).toLocaleString("en-IN")}</span>
                        <span>₹0</span>
                    </div>

                    <div className="chart-area">
                        <div className="chart-horizontal-line"></div>
                        <div className="chart-horizontal-line"></div>
                        <div className="chart-horizontal-line"></div>

                        <div className="chart-bars">
                            {revenueData.map(item => {
                                const revenue = Number(item.revenue);
                                const height = Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 5 : 2);

                                return (
                                    <div className="chart-column" key={item.label}>
                                        <div className="chart-value">{revenue > 0 ? `₹${revenue.toLocaleString("en-IN")}` : "₹0"}</div>
                                        <div className="chart-bar" style={{ height: `${height}%` }} title={`Revenue: ₹${revenue.toLocaleString("en-IN")} | Orders: ${item.orders}`} />
                                        <span className="chart-label">{item.label}</span>
                                        <small className="chart-orders">{item.orders} orders</small>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px", marginTop: "20px", marginBottom: "30px" }}>
                <div className="dashboard-panel" style={{ margin: 0, padding: "18px" }}>
                    <div className="panel-header" style={{ marginBottom: "10px" }}>
                        <div>
                            <h3>Order Activity</h3>
                            <p>Your order status</p>
                        </div>
                    </div>

                    <div style={{ width: "100%", height: "280px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={orderStatusData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Line type="monotone" dataKey="placed" name="Placed" stroke="#2563eb" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="confirmed" name="Confirmed" stroke="#16a34a" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="processing" name="Processing" stroke="#9333ea" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="shipped" name="Shipped" stroke="#ea580c" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#0891b2" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#dc2626" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-panel" style={{ margin: 0, padding: "18px" }}>
                    <div className="panel-header" style={{ marginBottom: "10px" }}>
                        <div>
                            <h3>Payment Activity</h3>
                            <p>Your payment status</p>
                        </div>
                    </div>

                    <div style={{ width: "100%", height: "280px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={orderStatusData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Line type="monotone" dataKey="paymentSuccess" name="Success" stroke="#16a34a" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="paymentPending" name="Pending" stroke="#ca8a04" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="paymentFailed" name="Failed" stroke="#dc2626" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;