import {
    useEffect,
    useMemo,
    useState
} from "react";
import API from "../axios";

interface Order {
    orderId: number;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
}

type Period = "WEEK" | "MONTH" | "YEAR";

interface ChartItem {
    label: string;
    value: number;
}

const AdminRevenue = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [period, setPeriod] = useState<Period>("MONTH");

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await API.get<Order[]>("/admin/orders");
                setOrders(response.data);
            } catch (err: any) {
                console.error("Revenue error:", err);
                setError(
                    err?.response?.data ||
                    "Unable to load revenue."
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const revenueOrders = useMemo(
        () =>
            orders.filter(
                order => order.orderStatus !== "CANCELLED"
            ),
        [orders]
    );

    const totalRevenue = useMemo(
        () =>
            revenueOrders.reduce(
                (total, order) =>
                    total + Number(order.totalAmount),
                0
            ),
        [revenueOrders]
    );

    const periodOrders = useMemo(() => {
        const now = new Date();

        return revenueOrders.filter(order => {
            const date = new Date(order.createdAt);

            if (period === "YEAR") {
                return date.getFullYear() === now.getFullYear();
            }

            if (period === "MONTH") {
                return (
                    date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === now.getMonth()
                );
            }

            const start = new Date(now);
            start.setDate(now.getDate() - 6);
            start.setHours(0, 0, 0, 0);

            return date >= start;
        });
    }, [revenueOrders, period]);

    const periodRevenue = periodOrders.reduce(
        (total, order) =>
            total + Number(order.totalAmount),
        0
    );

    const averageOrder = periodOrders.length
        ? periodRevenue / periodOrders.length
        : 0;

    const chartData = useMemo<ChartItem[]>(() => {
        const now = new Date();

        const getRevenue = (
            filter: (order: Order) => boolean
        ) =>
            revenueOrders
                .filter(filter)
                .reduce(
                    (sum, order) =>
                        sum + Number(order.totalAmount),
                    0
                );

        if (period === "WEEK") {
            return Array.from(
                { length: 7 },
                (_, index) => {
                    const date = new Date(now);
                    date.setDate(now.getDate() - (6 - index));

                    const key = date
                        .toISOString()
                        .split("T")[0];

                    return {
                        label: date.toLocaleDateString(
                            "en-IN",
                            { weekday: "short" }
                        ),
                        value: getRevenue(order =>
                            order.createdAt.startsWith(key)
                        )
                    };
                }
            );
        }

        if (period === "MONTH") {
            const lastDay = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            ).getDate();

            return Array.from(
                { length: 4 },
                (_, index) => {
                    const start = index * 7 + 1;
                    const end = Math.min(
                        start + 6,
                        lastDay
                    );

                    return {
                        label: `Week ${index + 1}`,
                        value: getRevenue(order => {
                            const date = new Date(
                                order.createdAt
                            );

                            return (
                                date.getFullYear() ===
                                    now.getFullYear() &&
                                date.getMonth() ===
                                    now.getMonth() &&
                                date.getDate() >= start &&
                                date.getDate() <= end
                            );
                        })
                    };
                }
            );
        }

        return Array.from(
            { length: 12 },
            (_, month) => ({
                label: new Date(
                    2000,
                    month,
                    1
                ).toLocaleString(
                    "en-IN",
                    { month: "short" }
                ),
                value: getRevenue(order => {
                    const date = new Date(order.createdAt);

                    return (
                        date.getFullYear() ===
                            now.getFullYear() &&
                        date.getMonth() === month
                    );
                })
            })
        );
    }, [revenueOrders, period]);

    const maxValue = Math.max(
        ...chartData.map(item => item.value),
        1
    );

    if (loading) {
        return (
            <div className="admin-customers-page">
                <div className="customer-loading">
                    Loading revenue...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-customers-page admin-revenue-page">
            <div className="customers-header">
                <div>
                    <h1>Revenue</h1>
                    <p>
                        Monitor Dunique sales performance.
                    </p>
                </div>
            </div>

            {error && (
                <div className="customer-error">
                    {error}
                </div>
            )}

            <div className="revenue-stats">
                <div className="admin-stat-card">
                    <span>Total Revenue</span>
                    <strong>
                        ₹{totalRevenue.toLocaleString("en-IN")}
                    </strong>
                </div>

                <div className="admin-stat-card">
                    <span>Period Revenue</span>
                    <strong>
                        ₹{periodRevenue.toLocaleString("en-IN")}
                    </strong>
                </div>

                <div className="admin-stat-card">
                    <span>Orders</span>
                    <strong>{periodOrders.length}</strong>
                </div>

                <div className="admin-stat-card">
                    <span>Average Order</span>
                    <strong>
                        ₹
                        {Math.round(averageOrder).toLocaleString(
                            "en-IN"
                        )}
                    </strong>
                </div>
            </div>

            <div className="revenue-panel">
                <div className="revenue-panel-header">
                    <div>
                        <h2>Revenue Overview</h2>
                        <p>
                            Revenue performance over time
                        </p>
                    </div>

                    <div className="period-selector">
                        {(
                            ["WEEK", "MONTH", "YEAR"] as Period[]
                        ).map(value => (
                            <button
                                key={value}
                                type="button"
                                className={
                                    period === value
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriod(value)
                                }
                            >
                                {value.charAt(0) +
                                    value
                                        .slice(1)
                                        .toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="revenue-chart">
                    <div className="chart-y-axis">
                        <span>
                            ₹
                            {maxValue.toLocaleString("en-IN")}
                        </span>
                        <span>
                            ₹
                            {Math.round(
                                maxValue * 0.75
                            ).toLocaleString("en-IN")}
                        </span>
                        <span>
                            ₹
                            {Math.round(
                                maxValue * 0.5
                            ).toLocaleString("en-IN")}
                        </span>
                        <span>
                            ₹
                            {Math.round(
                                maxValue * 0.25
                            ).toLocaleString("en-IN")}
                        </span>
                        <span>₹0</span>
                    </div>

                    <div className="chart-area">
                        <div className="chart-horizontal-line" />
                        <div className="chart-horizontal-line" />
                        <div className="chart-horizontal-line" />

                        <div className="chart-bars">
                            {chartData.map(item => {
                                const height =
                                    Math.max(
                                        (item.value / maxValue) *
                                            100,
                                        item.value > 0 ? 3 : 0
                                    );

                                return (
                                    <div
                                        key={item.label}
                                        className="chart-column"
                                    >
                                        <span className="chart-value">
                                            ₹
                                            {item.value >= 1000
                                                ? `${(
                                                    item.value /
                                                    1000
                                                ).toFixed(1)}K`
                                                : item.value}
                                        </span>

                                        <div
                                            className="chart-bar"
                                            style={{
                                                height: `${height}%`
                                            }}
                                        />

                                        <span className="chart-label">
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenue;