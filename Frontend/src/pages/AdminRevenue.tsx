import React, {
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

type Period =
    | "WEEK"
    | "MONTH"
    | "YEAR";


const AdminRevenue = () => {

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [period, setPeriod] =
        useState<Period>("MONTH");


    // =====================================================
    // LOAD
    // =====================================================

    useEffect(() => {

        const loadOrders = async () => {

            try {

                const response =
                    await API.get<Order[]>(
                        "/admin/orders"
                    );

                setOrders(
                    response.data
                );

            } catch (err: any) {

                console.error(
                    "Revenue error:",
                    err
                );

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


    // =====================================================
    // VALID REVENUE ORDERS
    // =====================================================

    const revenueOrders =
        useMemo(() => {

            return orders.filter(
                order =>
                    order.orderStatus !==
                    "CANCELLED"
            );

        }, [orders]);


    // =====================================================
    // TOTAL REVENUE
    // =====================================================

    const totalRevenue =
        useMemo(() => {

            return revenueOrders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    Number(
                        order.totalAmount
                    ),

                0
            );

        }, [revenueOrders]);


    // =====================================================
    // CURRENT PERIOD ORDERS
    // =====================================================

    const periodOrders =
        useMemo(() => {

            const now =
                new Date();

            return revenueOrders.filter(
                order => {

                    const date =
                        new Date(
                            order.createdAt
                        );


                    if (
                        period ===
                        "YEAR"
                    ) {

                        return (
                            date.getFullYear() ===
                            now.getFullYear()
                        );
                    }


                    if (
                        period ===
                        "MONTH"
                    ) {

                        return (
                            date.getFullYear() ===
                                now.getFullYear()
                            &&
                            date.getMonth() ===
                                now.getMonth()
                        );
                    }


                    // WEEK

                    const start =
                        new Date(now);

                    start.setDate(
                        now.getDate() - 6
                    );

                    start.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    return date >= start;

                }
            );

        }, [
            revenueOrders,
            period
        ]);


    // =====================================================
    // PERIOD REVENUE
    // =====================================================

    const periodRevenue =
        periodOrders.reduce(
            (
                total,
                order
            ) =>
                total +
                Number(
                    order.totalAmount
                ),

            0
        );


    // =====================================================
    // AVERAGE ORDER
    // =====================================================

    const averageOrder =
        periodOrders.length > 0
            ? periodRevenue /
              periodOrders.length
            : 0;


    // =====================================================
    // CHART DATA
    // =====================================================

    const chartData =
        useMemo(() => {

            const now =
                new Date();


            // -----------------------------
            // WEEK
            // -----------------------------

            if (
                period ===
                "WEEK"
            ) {

                const data = [];

                for (
                    let i = 6;
                    i >= 0;
                    i--
                ) {

                    const date =
                        new Date(now);

                    date.setDate(
                        now.getDate() - i
                    );

                    const key =
                        date.toISOString()
                            .split("T")[0];


                    const revenue =
                        revenueOrders
                            .filter(
                                order =>
                                    order.createdAt
                                        .startsWith(
                                            key
                                        )
                            )
                            .reduce(
                                (
                                    sum,
                                    order
                                ) =>
                                    sum +
                                    Number(
                                        order.totalAmount
                                    ),

                                0
                            );


                    data.push({

                        label:
                            date.toLocaleDateString(
                                "en-IN",
                                {
                                    weekday:
                                        "short"
                                }
                            ),

                        value:
                            revenue
                    });
                }

                return data;
            }


            // -----------------------------
            // MONTH
            // -----------------------------

            if (
                period ===
                "MONTH"
            ) {

                const data = [];

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    const start =
                        i * 7 + 1;

                    const end =
                        Math.min(
                            start + 6,
                            new Date(
                                now.getFullYear(),
                                now.getMonth() + 1,
                                0
                            ).getDate()
                        );


                    const revenue =
                        revenueOrders
                            .filter(
                                order => {

                                    const date =
                                        new Date(
                                            order.createdAt
                                        );

                                    const day =
                                        date.getDate();

                                    return (
                                        date.getFullYear() ===
                                            now.getFullYear()
                                        &&
                                        date.getMonth() ===
                                            now.getMonth()
                                        &&
                                        day >= start
                                        &&
                                        day <= end
                                    );
                                }
                            )
                            .reduce(
                                (
                                    sum,
                                    order
                                ) =>
                                    sum +
                                    Number(
                                        order.totalAmount
                                    ),

                                0
                            );


                    data.push({

                        label:
                            `Week ${i + 1}`,

                        value:
                            revenue
                    });
                }

                return data;
            }


            // -----------------------------
            // YEAR
            // -----------------------------

            const data = [];

            for (
                let month = 0;
                month < 12;
                month++
            ) {

                const revenue =
                    revenueOrders
                        .filter(
                            order => {

                                const date =
                                    new Date(
                                        order.createdAt
                                    );

                                return (
                                    date.getFullYear() ===
                                        now.getFullYear()
                                    &&
                                    date.getMonth() ===
                                        month
                                );
                            }
                        )
                        .reduce(
                            (
                                sum,
                                order
                            ) =>
                                sum +
                                Number(
                                    order.totalAmount
                                ),

                            0
                        );


                data.push({

                    label:
                        new Date(
                            2000,
                            month,
                            1
                        ).toLocaleString(
                            "en-IN",
                            {
                                month:
                                    "short"
                            }
                        ),

                    value:
                        revenue
                });
            }

            return data;

        }, [
            revenueOrders,
            period
        ]);


    const maxValue =
        Math.max(
            ...chartData.map(
                item => item.value
            ),
            1
        );


    // =====================================================
    // LOADING
    // =====================================================

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

        <div className="admin-customers-page">

            {/* HEADER */}

            <div className="customers-header">

                <div>

                    <h1>
                        Revenue
                    </h1>

                    <p>
                        Monitor Dunique sales
                        performance.
                    </p>

                </div>

            </div>


            {error && (

                <div className="customer-error">
                    {error}
                </div>

            )}


            {/* SUMMARY CARDS */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4, 1fr)",
                    gap: "15px",
                    marginBottom:
                        "25px"
                }}
            >

                <div
                    className="admin-stat-card"
                >

                    <span>
                        Total Revenue
                    </span>

                    <strong>
                        ₹
                        {totalRevenue.toLocaleString(
                            "en-IN"
                        )}
                    </strong>

                </div>


                <div
                    className="admin-stat-card"
                >

                    <span>
                        Period Revenue
                    </span>

                    <strong>
                        ₹
                        {periodRevenue.toLocaleString(
                            "en-IN"
                        )}
                    </strong>

                </div>


                <div
                    className="admin-stat-card"
                >

                    <span>
                        Orders
                    </span>

                    <strong>
                        {
                            periodOrders.length
                        }
                    </strong>

                </div>


                <div
                    className="admin-stat-card"
                >

                    <span>
                        Average Order
                    </span>

                    <strong>
                        ₹
                        {Math.round(
                            averageOrder
                        ).toLocaleString(
                            "en-IN"
                        )}
                    </strong>

                </div>

            </div>


            {/* CHART */}

            <div
                style={{
                    background:
                        "white",
                    border:
                        "1px solid #e5e7eb",
                    borderRadius:
                        "12px",
                    padding:
                        "25px"
                }}
            >

                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        marginBottom:
                            "25px"
                    }}
                >

                    <div>

                        <h2
                            style={{
                                margin:
                                    0,
                                fontSize:
                                    "20px"
                            }}
                        >
                            Revenue Overview
                        </h2>

                        <p
                            style={{
                                margin:
                                    "5px 0 0",
                                color:
                                    "#6b7280",
                                fontSize:
                                    "13px"
                            }}
                        >
                            Revenue performance
                            over time
                        </p>

                    </div>


                    {/* PERIOD */}

                    <div
                        style={{
                            display:
                                "flex",
                            gap:
                                "5px",
                            background:
                                "#f3f4f6",
                            padding:
                                "4px",
                            borderRadius:
                                "8px"
                        }}
                    >

                        {(
                            [
                                "WEEK",
                                "MONTH",
                                "YEAR"
                            ] as Period[]
                        ).map(
                            value => (

                                <button
                                    key={
                                        value
                                    }
                                    onClick={() =>
                                        setPeriod(
                                            value
                                        )
                                    }
                                    style={{
                                        border:
                                            "none",
                                        padding:
                                            "8px 13px",
                                        borderRadius:
                                            "6px",
                                        cursor:
                                            "pointer",
                                        background:
                                            period ===
                                            value
                                                ? "white"
                                                : "transparent",
                                        fontWeight:
                                            period ===
                                            value
                                                ? 600
                                                : 400,
                                        boxShadow:
                                            period ===
                                            value
                                                ? "0 1px 3px rgba(0,0,0,.1)"
                                                : "none"
                                    }}
                                >
                                    {
                                        value ===
                                        "WEEK"
                                            ? "Week"
                                            : value ===
                                              "MONTH"
                                                ? "Month"
                                                : "Year"
                                    }
                                </button>

                            )
                        )}

                    </div>

                </div>


                {/* BAR CHART */}

                <div
                    style={{
                        height:
                            "300px",
                        display:
                            "flex",
                        alignItems:
                            "flex-end",
                        gap:
                            "12px",
                        padding:
                            "20px 10px 0"
                    }}
                >

                    {chartData.map(
                        item => {

                            const height =
                                Math.max(
                                    (
                                        item.value /
                                        maxValue
                                    ) *
                                    240,

                                    item.value >
                                    0
                                        ? 8
                                        : 2
                                );


                            return (

                                <div
                                    key={
                                        item.label
                                    }
                                    style={{
                                        flex:
                                            1,
                                        height:
                                            "100%",
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        justifyContent:
                                            "flex-end",
                                        alignItems:
                                            "center",
                                        gap:
                                            "8px"
                                    }}
                                >

                                    <small
                                        style={{
                                            color:
                                                "#6b7280",
                                            fontSize:
                                                "10px"
                                        }}
                                    >
                                        ₹
                                        {item.value >=
                                        1000
                                            ? `${(
                                                item.value /
                                                1000
                                            ).toFixed(
                                                1
                                            )}K`
                                            : item.value
                                        }
                                    </small>


                                    <div
                                        style={{
                                            width:
                                                "100%",
                                            maxWidth:
                                                "55px",
                                            height:
                                                `${height}px`,
                                            background:
                                                "#2563eb",
                                            borderRadius:
                                                "6px 6px 2px 2px",
                                            transition:
                                                "height .3s"
                                        }}
                                    />


                                    <small
                                        style={{
                                            color:
                                                "#6b7280",
                                            fontSize:
                                                "11px"
                                        }}
                                    >
                                        {
                                            item.label
                                        }
                                    </small>

                                </div>
                            );
                        }
                    )}

                </div>

            </div>

        </div>
    );
};

export default AdminRevenue;