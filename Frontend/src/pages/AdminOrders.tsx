import React, { useEffect, useMemo, useState } from "react";
import API from "../axios";

interface OrderItem {
    productId?: number;
    productName?: string;
    quantity?: number;
    price?: number;
    totalPrice?: number;
}

interface Order {
    orderId: number;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;

    shippingFullName: string;
    shippingPhone: string;
    shippingAddressLine: string;
    shippingCity: string;
    shippingState: string;
    shippingPostalCode: string;
    shippingLandmark?: string;

    items: OrderItem[];
    createdAt: string;
}

const AdminOrders = () => {

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [selectedOrder, setSelectedOrder] =
        useState<Order | null>(null);

    const [showDetails, setShowDetails] =
        useState(false);

    const [updatingStatus, setUpdatingStatus] =
        useState(false);


    // =====================================================
    // LOAD ORDERS
    // =====================================================

    const fetchOrders = async () => {

        try {

            setLoading(true);

            const response =
                await API.get<Order[]>(
                    "/admin/orders"
                );

            setOrders(response.data);

            setError("");

        } catch (err: any) {

            console.error(
                "Admin orders error:",
                err
            );

            setError(
                err?.response?.data ||
                "Unable to load orders."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchOrders();

    }, []);


    // =====================================================
    // FILTER
    // =====================================================

    const filteredOrders = useMemo(() => {

        return orders.filter(order => {

            const searchValue =
                search.trim().toLowerCase();


            const matchesSearch =
                String(order.orderId)
                    .toLowerCase()
                    .includes(searchValue)
                ||
                order.shippingFullName
                    ?.toLowerCase()
                    .includes(searchValue)
                ||
                order.shippingPhone
                    ?.toLowerCase()
                    .includes(searchValue);


            const matchesStatus =
                statusFilter === "ALL"
                ||
                order.orderStatus ===
                    statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );
        });

    }, [
        orders,
        search,
        statusFilter
    ]);


    // =====================================================
    // STATUS LIST
    // =====================================================

    const statuses = Array.from(
        new Set(
            orders.map(
                order =>
                    order.orderStatus
            )
        )
    );


    // =====================================================
    // VIEW ORDER
    // =====================================================

    const handleViewOrder = async (
        orderId: number
    ) => {

        try {

            const response =
                await API.get<Order>(
                    `/admin/orders/${orderId}`
                );

            setSelectedOrder(
                response.data
            );

            setShowDetails(true);

        } catch (err: any) {

            console.error(
                "Order details error:",
                err
            );

            alert(
                err?.response?.data ||
                "Unable to load order details."
            );
        }
    };


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    const updateStatus = async (
        status: string
    ) => {

        if (!selectedOrder) {
            return;
        }


        try {

            setUpdatingStatus(true);


            const response =
                await API.put<Order>(
                    `/admin/orders/${selectedOrder.orderId}/status`,
                    {
                        status: status
                    }
                );


            setSelectedOrder(
                response.data
            );


            setOrders(previous =>
                previous.map(order =>
                    order.orderId ===
                    selectedOrder.orderId
                        ? response.data
                        : order
                )
            );


        } catch (err: any) {

            console.error(
                "Update order status error:",
                err
            );

            alert(
                err?.response?.data ||
                "Unable to update order status."
            );

        } finally {

            setUpdatingStatus(false);
        }
    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (
        status: string
    ) => {

        switch (
            status?.toUpperCase()
        ) {

            case "CANCELLED":
                return "disabled";

            case "DELIVERED":
                return "active";

            default:
                return "active";
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="admin-customers-page">

                <div className="customer-loading">
                    Loading orders...
                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-customers-page">

            {/* HEADER */}

            <div className="customers-header">

                <div>

                    <h1>
                        Manage Orders
                    </h1>

                    <p>
                        View and manage all customer
                        orders.
                    </p>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="customer-error">
                    {error}
                </div>

            )}


            {/* TOOLBAR */}

            <div className="customer-toolbar">

                <input
                    type="text"
                    placeholder="Search Order ID, customer or phone..."
                    value={search}
                    onChange={e =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                <select
                    value={statusFilter}
                    onChange={e =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                    style={{
                        padding: "10px 13px",
                        border:
                            "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                        background: "white",
                        cursor: "pointer"
                    }}
                >

                    <option value="ALL">
                        All Status
                    </option>

                    {statuses.map(status => (

                        <option
                            key={status}
                            value={status}
                        >
                            {status}
                        </option>

                    ))}

                </select>


                <span>
                    {filteredOrders.length}
                    {" "}
                    orders
                </span>

            </div>


            {/* TABLE */}

            <div className="customer-table-container">

                <table className="customer-table">

                    <thead>

                        <tr>

                            <th>
                                Order ID
                            </th>

                            <th>
                                Customer
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Payment
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredOrders.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={7}
                                    className="empty-customers"
                                >
                                    No orders found.
                                </td>

                            </tr>

                        ) : (

                            filteredOrders.map(
                                order => (

                                    <tr
                                        key={
                                            order.orderId
                                        }
                                    >

                                        {/* ORDER ID */}

                                        <td>

                                            <strong>
                                                #
                                                {
                                                    order.orderId
                                                }
                                            </strong>

                                        </td>


                                        {/* CUSTOMER */}

                                        <td>

                                            <strong>
                                                {
                                                    order.shippingFullName
                                                }
                                            </strong>

                                        </td>


                                        {/* AMOUNT */}

                                        <td>

                                            <strong>
                                                ₹
                                                {Number(
                                                    order.totalAmount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </td>


                                        {/* PAYMENT */}

                                        <td>

                                            <span
                                                className={
                                                    `customer-status ${
                                                        order.paymentStatus ===
                                                        "PAID"
                                                            ? "active"
                                                            : "disabled"
                                                    }`
                                                }
                                            >
                                                {
                                                    order.paymentStatus
                                                }
                                            </span>

                                        </td>


                                        {/* ORDER STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    `customer-status ${getStatusClass(
                                                        order.orderStatus
                                                    )}`
                                                }
                                            >
                                                {
                                                    order.orderStatus
                                                }
                                            </span>

                                        </td>


                                        {/* DATE */}

                                        <td>

                                            {order.createdAt
                                                ? new Date(
                                                    order.createdAt
                                                ).toLocaleDateString(
                                                    "en-IN"
                                                )
                                                : "-"
                                            }

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <button
                                                className="customer-action-button"
                                                onClick={() =>
                                                    handleViewOrder(
                                                        order.orderId
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* ================================================= */}
            {/* ORDER DETAILS MODAL */}
            {/* ================================================= */}

            {showDetails &&
                selectedOrder && (

                <div
                    className="customer-modal-overlay"
                    onClick={() =>
                        setShowDetails(false)
                    }
                >

                    <div
                        className="customer-modal"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div
                            className="customer-modal-header"
                        >

                            <div>

                                <h2>
                                    Order #
                                    {
                                        selectedOrder.orderId
                                    }
                                </h2>

                                <small
                                    style={{
                                        color:
                                            "#6b7280"
                                    }}
                                >
                                    {selectedOrder.createdAt
                                        ? new Date(
                                            selectedOrder.createdAt
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                        : "-"
                                    }
                                </small>

                            </div>


                            <button
                                onClick={() =>
                                    setShowDetails(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* CUSTOMER */}

                        <div
                            className="customer-detail-list"
                        >

                            <div>

                                <span>
                                    Customer
                                </span>

                                <strong>
                                    {
                                        selectedOrder.shippingFullName
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {
                                        selectedOrder.shippingPhone
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Payment
                                </span>

                                <strong>
                                    {
                                        selectedOrder.paymentStatus
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Order Status
                                </span>

                                <strong>
                                    {
                                        selectedOrder.orderStatus
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Total Amount
                                </span>

                                <strong>
                                    ₹
                                    {Number(
                                        selectedOrder.totalAmount
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Address
                                </span>

                                <strong
                                    style={{
                                        maxWidth:
                                            "60%"
                                    }}
                                >

                                    {
                                        selectedOrder
                                            .shippingAddressLine
                                    }

                                    <br />

                                    {
                                        selectedOrder
                                            .shippingCity
                                    }

                                    {", "}

                                    {
                                        selectedOrder
                                            .shippingState
                                    }

                                    {" - "}

                                    {
                                        selectedOrder
                                            .shippingPostalCode
                                    }

                                    {selectedOrder
                                        .shippingLandmark
                                        ? ` (${selectedOrder.shippingLandmark})`
                                        : ""
                                    }

                                </strong>

                            </div>

                        </div>


                        {/* ITEMS */}

                        <div
                            style={{
                                marginTop:
                                    "25px"
                            }}
                        >

                            <h3
                                style={{
                                    fontSize:
                                        "16px",
                                    marginBottom:
                                        "12px"
                                }}
                            >
                                Order Items
                            </h3>


                            {selectedOrder.items
                                ?.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                    <div
                                        key={index}
                                        style={{
                                            padding:
                                                "12px 0",
                                            borderBottom:
                                                "1px solid #f1f5f9",
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between"
                                        }}
                                    >

                                        <div>

                                            <strong>
                                                {
                                                    item.productName
                                                        ||
                                                        `Product #${item.productId}`
                                                }
                                            </strong>

                                            <div
                                                style={{
                                                    color:
                                                        "#6b7280",
                                                    fontSize:
                                                        "12px",
                                                    marginTop:
                                                        "4px"
                                                }}
                                            >
                                                Qty:
                                                {" "}
                                                {
                                                    item.quantity
                                                }

                                            </div>

                                        </div>


                                        <strong>

                                            ₹
                                            {Number(
                                                item.totalPrice ??
                                                (
                                                    (item.price ??
                                                        0) *
                                                    (item.quantity ??
                                                        0)
                                                )
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </strong>

                                    </div>

                                )
                            )}

                        </div>


                        {/* UPDATE STATUS */}

                        <div
                            style={{
                                marginTop:
                                    "25px",
                                paddingTop:
                                    "20px",
                                borderTop:
                                    "1px solid #e5e7eb"
                            }}
                        >

                            <label
                                style={{
                                    display:
                                        "block",
                                    fontWeight:
                                        "600",
                                    fontSize:
                                        "13px",
                                    marginBottom:
                                        "8px"
                                }}
                            >
                                Update Order Status
                            </label>


                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "10px"
                                }}
                            >

                                <select
                                    value={
                                        selectedOrder
                                            .orderStatus
                                    }
                                    disabled={
                                        updatingStatus
                                    }
                                    onChange={e =>
                                        updateStatus(
                                            e.target
                                                .value
                                        )
                                    }
                                    style={{
                                        flex: 1,
                                        padding:
                                            "10px",
                                        border:
                                            "1px solid #d1d5db",
                                        borderRadius:
                                            "8px",
                                        background:
                                            "white"
                                    }}
                                >

                                    <option value="PLACED">
                                        PLACED
                                    </option>

                                    <option value="CONFIRMED">
                                        CONFIRMED
                                    </option>

                                    <option value="SHIPPED">
                                        SHIPPED
                                    </option>

                                    <option value="DELIVERED">
                                        DELIVERED
                                    </option>

                                    <option value="CANCELLED">
                                        CANCELLED
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminOrders;