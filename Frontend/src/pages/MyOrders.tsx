import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios";

interface OrderItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
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

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const navigate = useNavigate();

    // Fetch orders
    const fetchOrders = async (): Promise<void> => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get<Order[]>("/customer/orders");

            console.log("MY ORDERS:", response.data);
            setOrders(response.data);
        } catch (fetchError: any) {
            console.error("Error loading orders:", fetchError);

            setError(
                fetchError?.response?.data?.message ||
                fetchError?.response?.data ||
                "Unable to load your orders."
            );
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchOrders();
    }, []);

    // Cancel order
    const cancelOrder = async (orderId: number): Promise<void> => {
        const confirmed = window.confirm(`Are you sure you want to cancel Order #${orderId}?`);

        if (!confirmed) return;

        try {
            setCancellingId(orderId);
            await API.put(`/customer/orders/${orderId}/cancel`);
            await fetchOrders();
        } catch (cancelError: any) {
            console.error("Cancel order error:", cancelError);

            alert(
                cancelError?.response?.data?.message ||
                cancelError?.response?.data ||
                "Unable to cancel order."
            );
        } finally {
            setCancellingId(null);
        }
    };

    // Order status class
    const getOrderStatusClass = (status: string): string => {
        switch (status) {
            case "PLACED":
                return "order-status-placed";
            case "CONFIRMED":
                return "order-status-confirmed";
            case "SHIPPED":
                return "order-status-shipped";
            case "DELIVERED":
                return "order-status-delivered";
            case "CANCELLED":
                return "order-status-cancelled";
            default:
                return "order-status-default";
        }
    };

    // Payment status class
    const getPaymentStatusClass = (status: string): string => {
        if (status === "SUCCESS") return "payment-success";
        if (status === "PENDING") return "payment-pending";
        if (status === "FAILED") return "payment-failed";

        return "payment-default";
    };

    // Check if cancellable
    const canCancelOrder = (status: string): boolean => {
        return status !== "CANCELLED" && status !== "SHIPPED" && status !== "DELIVERED";
    };

    // Format date
    const formatDate = (date: string): string => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Loading
    if (loading) {
        return (
            <main className="orders-page">
                <div className="orders-loading">
                    <div className="orders-spinner" />
                    <h3>Loading your orders</h3>
                    <p>Please wait while we fetch your order history.</p>
                </div>
            </main>
        );
    }

    // Error
    if (error) {
        return (
            <main className="orders-page">
                <div className="orders-message-card orders-error-card">
                    <div className="orders-message-icon">!</div>
                    <h2>Unable to load orders</h2>
                    <p>{error}</p>
                    <button type="button" className="orders-primary-button" onClick={fetchOrders}>Try Again</button>
                </div>
            </main>
        );
    }

    // Empty orders
    if (orders.length === 0) {
        return (
            <main className="orders-page">
                <div className="orders-message-card">
                    <div className="orders-message-icon">🛍</div>
                    <h2>No orders yet</h2>
                    <p>You haven't placed any orders yet. Start shopping and your orders will appear here.</p>
                    <button type="button" className="orders-primary-button" onClick={() => navigate("/")}>Start Shopping</button>
                </div>
            </main>
        );
    }

    return (
        <main className="orders-page">
            <div className="orders-wrapper">
                {/* Page header */}
                <div className="orders-page-header">
                    <div>
                        <p className="orders-eyebrow">PURCHASE HISTORY</p>
                        <h1>My Orders</h1>
                        <p className="orders-subtitle">Track and manage all your purchases in one place.</p>
                    </div>

                    <button type="button" className="orders-refresh-button" onClick={fetchOrders}>
                        ↻ Refresh
                    </button>
                </div>

                {/* Order count */}
                <div className="orders-summary">
                    <span>{orders.length}</span>
                    <p>{orders.length === 1 ? "Order" : "Orders"}{" "}in your history</p>
                </div>

                {/* Orders */}
                <section className="orders-list">
                    {orders.map(order => (
                        <article key={order.orderId} className="order-card">
                            {/* Order header */}
                            <div className="order-card-header">
                                <div className="order-header-info">
                                    <span className="order-number-label">ORDER</span>
                                    <h2>#{order.orderId}</h2>
                                    <p>Placed on {formatDate(order.createdAt)}</p>
                                </div>

                                <span className={`order-status ${getOrderStatusClass(order.orderStatus)}`}>
                                    {order.orderStatus}
                                </span>
                            </div>

                            {/* Order body */}
                            <div className="order-card-body">
                                {/* Items */}
                                <div className="order-items-section">
                                    <div className="order-section-heading">
                                        <h3>Items</h3>
                                        <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                                    </div>

                                    <div className="order-items-list">
                                        {order.items.map(item => (
                                            <div key={item.productId} className="order-item-row">
                                                <div className="order-item-main">
                                                    <div className="order-item-placeholder">📦</div>

                                                    <div>
                                                        <h4>{item.productName}</h4>
                                                        <p>
                                                            ₹{Number(item.unitPrice).toLocaleString("en-IN")}{" · "}
                                                            Qty{" "}{item.quantity}
                                                        </p>
                                                    </div>
                                                </div>

                                                <strong className="order-item-price">
                                                    ₹{Number(item.totalPrice).toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order details */}
                                <aside className="order-details-panel">
                                    {/* Total */}
                                    <div className="order-total-box">
                                        <span>Order Total</span>
                                        <strong>
                                            ₹{Number(order.totalAmount).toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </strong>
                                    </div>

                                    {/* Payment */}
                                    <div className="order-detail-block">
                                        <span className="order-detail-label">PAYMENT</span>
                                        <span className={`payment-status ${getPaymentStatusClass(order.paymentStatus)}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>

                                    {/* Address */}
                                    <div className="order-detail-block">
                                        <span className="order-detail-label">DELIVERY ADDRESS</span>

                                        <div className="order-address">
                                            <strong>{order.shippingFullName}</strong>

                                            <p>
                                                {order.shippingAddressLine}<br />
                                                {order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}<br />
                                                Phone: {order.shippingPhone}

                                                {order.shippingLandmark && (
                                                    <>
                                                        <br />
                                                        Landmark: {order.shippingLandmark}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </aside>
                            </div>

                            {/* Actions */}
                            <div className="order-card-footer">
                                <button
                                    type="button"
                                    className="order-details-button"
                                    onClick={() => navigate(`/orders/${order.orderId}`)}
                                >
                                    View Details →
                                </button>

                                {canCancelOrder(order.orderStatus) && (
                                    <button
                                        type="button"
                                        className="order-cancel-button"
                                        disabled={cancellingId === order.orderId}
                                        onClick={() => cancelOrder(order.orderId)}
                                    >
                                        {cancellingId === order.orderId ? "Cancelling..." : "Cancel Order"}
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
};

export default MyOrders;