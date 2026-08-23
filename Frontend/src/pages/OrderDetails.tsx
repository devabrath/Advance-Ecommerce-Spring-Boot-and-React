import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../axios";
import { Alert, Spinner } from "react-bootstrap";

// Types
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

const OrderDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Fetch order
    useEffect(() => {
        const fetchOrder = async (): Promise<void> => {
            if (!id) {
                setError("Order ID not found.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await API.get<Order>(`/customer/orders/${id}`);
                console.log("ORDER DETAILS:", response.data);
                setOrder(response.data);
            } catch (fetchError: any) {
                console.error("Error loading order:", fetchError);

                setError(
                    fetchError?.response?.data?.message ||
                    fetchError?.response?.data ||
                    "Unable to load order details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    // Status helpers
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

    const getPaymentStatusClass = (status: string): string => {
        switch (status) {
            case "SUCCESS":
                return "payment-status-success";
            case "PENDING":
                return "payment-status-pending";
            case "FAILED":
                return "payment-status-failed";
            default:
                return "payment-status-default";
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="order-details-page">
                <div className="order-page-loader">
                    <Spinner animation="border" />
                    <p>Loading your order...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error || !order) {
        return (
            <div className="order-details-page">
                <div className="order-details-error">
                    <Alert variant="danger">{error || "Order not found."}</Alert>
                    <button type="button" className="order-back-button" onClick={() => navigate("/orders")}>
                        ← Back to My Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details-page">
            <div className="order-details-wrapper">
                {/* Back */}
                <button type="button" className="order-details-back" onClick={() => navigate("/orders")}>
                    ← Back to My Orders
                </button>

                {/* Header */}
                <div className="order-details-header">
                    <div>
                        <span className="order-details-eyebrow">ORDER DETAILS</span>
                        <h1>Order #{order.orderId}</h1>
                        <p>Placed on {new Date(order.createdAt).toLocaleString("en-IN")}</p>
                    </div>

                    <span className={`order-status-badge ${getOrderStatusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                    </span>
                </div>

                {/* Order summary */}
                <div className="order-summary-grid">
                    <div className="order-summary-card">
                        <div className="order-summary-icon">📦</div>
                        <div>
                            <span>Order Status</span>
                            <strong>{order.orderStatus}</strong>
                        </div>
                    </div>

                    <div className="order-summary-card">
                        <div className="order-summary-icon">💳</div>
                        <div>
                            <span>Payment Status</span>
                            <strong className={getPaymentStatusClass(order.paymentStatus)}>
                                {order.paymentStatus}
                            </strong>
                        </div>
                    </div>

                    <div className="order-summary-card">
                        <div className="order-summary-icon">₹</div>
                        <div>
                            <span>Total Amount</span>
                            <strong>
                                ₹{Number(order.totalAmount).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="order-details-grid">
                    {/* Ordered items */}
                    <div className="order-details-card">
                        <div className="order-card-header">
                            <div>
                                <h2>Ordered Items</h2>
                                <p>{order.items.length} {order.items.length === 1 ? "item" : "items"} in this order</p>
                            </div>
                        </div>

                        <div className="order-items-list">
                            {order.items.map(item => (
                                <div key={item.productId} className="order-item-row">
                                    <div className="order-item-main">
                                        <div className="order-item-placeholder">🛍️</div>

                                        <div>
                                            <h3>{item.productName}</h3>
                                            <p>₹{Number(item.unitPrice).toLocaleString("en-IN")} × {item.quantity}</p>
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

                        {/* Total */}
                        <div className="order-total-row">
                            <span>Order Total</span>
                            <strong>
                                ₹{Number(order.totalAmount).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </strong>
                        </div>
                    </div>

                    {/* Delivery address */}
                    <div className="order-details-card order-address-card">
                        <div className="order-card-header">
                            <div>
                                <h2>Delivery Address</h2>
                                <p>Where your order will be delivered</p>
                            </div>
                        </div>

                        <div className="order-address-content">
                            <div className="order-address-avatar">
                                {order.shippingFullName?.charAt(0)?.toUpperCase()}
                            </div>

                            <div className="order-address-details">
                                <h3>{order.shippingFullName}</h3>
                                <p>{order.shippingAddressLine}</p>
                                <p>{order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}</p>

                                {order.shippingLandmark && (
                                    <p className="order-landmark">Landmark: {order.shippingLandmark}</p>
                                )}

                                <div className="order-phone">
                                    <span>📞</span>
                                    {order.shippingPhone}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom action */}
                <div className="order-details-footer">
                    <button type="button" className="order-back-button" onClick={() => navigate("/orders")}>
                        ← Back to My Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;