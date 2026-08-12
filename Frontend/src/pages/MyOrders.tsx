import React, { useEffect, useState } from "react";
import { Button, Card, Badge, Spinner, Alert } from "react-bootstrap";
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

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [cancellingId, setCancellingId] =
        useState<number | null>(null);

    const navigate = useNavigate();


    /*
     * =========================
     * FETCH ORDERS
     * =========================
     */

    const fetchOrders = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await API.get<Order[]>(
                    "/customer/orders"
                );

            console.log(
                "MY ORDERS:",
                response.data
            );

            setOrders(
                response.data
            );

        } catch (error: any) {

            console.error(
                "Error loading orders:",
                error
            );

            console.error(
                "STATUS:",
                error?.response?.status
            );

            console.error(
                "DATA:",
                error?.response?.data
            );

            setError(
                error?.response?.data ||
                "Unable to load your orders."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchOrders();

    }, []);


    /*
     * =========================
     * CANCEL ORDER
     * =========================
     */

    const cancelOrder = async (
        orderId: number
    ) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to cancel Order #${orderId}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setCancellingId(orderId);

            await API.put(
                `/customer/orders/${orderId}/cancel`
            );

            alert(
                "Order cancelled successfully."
            );

            await fetchOrders();

        } catch (error: any) {

            console.error(
                "Cancel order error:",
                error
            );

            alert(
                error?.response?.data ||
                "Unable to cancel order."
            );

        } finally {

            setCancellingId(null);

        }
    };


    /*
     * =========================
     * STATUS BADGE
     * =========================
     */

    const getStatusVariant = (
        status: string
    ) => {

        switch (status) {

            case "PLACED":
                return "primary";

            case "CONFIRMED":
                return "info";

            case "SHIPPED":
                return "warning";

            case "DELIVERED":
                return "success";

            case "CANCELLED":
                return "danger";

            default:
                return "secondary";
        }
    };


    /*
     * =========================
     * LOADING
     * =========================
     */

    if (loading) {

        return (

            <div
                style={{
                    paddingTop: "8rem",
                    textAlign: "center"
                }}
            >

                <Spinner animation="border" />

                <p className="mt-3">
                    Loading your orders...
                </p>

            </div>

        );
    }


    /*
     * =========================
     * ERROR
     * =========================
     */

    if (error) {

        return (

            <div
                style={{
                    paddingTop: "8rem",
                    paddingLeft: "2rem",
                    paddingRight: "2rem"
                }}
            >

                <Alert variant="danger">
                    {error}
                </Alert>

                <Button
                    onClick={fetchOrders}
                >
                    Try Again
                </Button>

            </div>

        );
    }


    /*
     * =========================
     * EMPTY
     * =========================
     */

    if (orders.length === 0) {

        return (

            <div
                style={{
                    paddingTop: "8rem",
                    textAlign: "center"
                }}
            >

                <h3>
                    No Orders Yet
                </h3>

                <p>
                    You haven't placed any orders.
                </p>

                <Button
                    variant="primary"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    Start Shopping
                </Button>

            </div>

        );
    }


    /*
     * =========================
     * MAIN PAGE
     * =========================
     */

    return (

        <div
            style={{
                paddingTop: "7rem",
                paddingBottom: "3rem",
                maxWidth: "1100px",
                margin: "auto",
                paddingLeft: "20px",
                paddingRight: "20px"
            }}
        >

            <div
                className="d-flex justify-content-between align-items-center mb-4"
            >

                <h2>
                    My Orders
                </h2>

                <Button
                    variant="outline-primary"
                    onClick={fetchOrders}
                >
                    Refresh
                </Button>

            </div>


            {orders.map(
                (order) => (

                    <Card
                        key={order.orderId}
                        className="mb-4 shadow-sm"  style={{ width: "auto"}}
                    >

                        <Card.Header>

                            <div
                                className="d-flex justify-content-between align-items-center"
                            >

                                <div>

                                    <strong>
                                        Order #{order.orderId}
                                    </strong>

                                    <br />

                                    <small
                                        className="text-muted"
                                    >
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString()}
                                    </small>

                                </div>


                                <Badge
                                    bg={getStatusVariant(
                                        order.orderStatus
                                    )}
                                >
                                    {order.orderStatus}
                                </Badge>

                            </div>

                        </Card.Header>


                        <Card.Body>


                            {/* ITEMS */}

                            <h5>
                                Items
                            </h5>

                            {order.items.map(
                                (item) => (

                                    <div
                                        key={item.productId}
                                        className="d-flex justify-content-between border-bottom py-2"
                                    >

                                        <div>

                                            <strong>
                                                {
                                                    item.productName
                                                }
                                            </strong>

                                            <div>
                                                Quantity:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </div>

                                        </div>


                                        <div>

                                            ₹
                                            {Number(
                                                item.totalPrice
                                            ).toFixed(2)}

                                        </div>

                                    </div>

                                )
                            )}


                            {/* TOTAL */}

                            <div
                                className="d-flex justify-content-between mt-3"
                            >

                                <strong>
                                    Total
                                </strong>

                                <strong>
                                    ₹
                                    {Number(
                                        order.totalAmount
                                    ).toFixed(2)}
                                </strong>

                            </div>


                            {/* PAYMENT */}

                            <div className="mt-3">

                                <strong>
                                    Payment:
                                </strong>{" "}

                                <Badge
                                    bg={
                                        order.paymentStatus ===
                                        "SUCCESS"
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {
                                        order.paymentStatus
                                    }
                                </Badge>

                            </div>


                            {/* ADDRESS */}

                            <div className="mt-4">

                                <h5>
                                    Delivery Address
                                </h5>

                                <div>

                                    <strong>
                                        {
                                            order.shippingFullName
                                        }
                                    </strong>

                                    <br />

                                    {
                                        order.shippingAddressLine
                                    }

                                    <br />

                                    {
                                        order.shippingCity
                                    },{" "}
                                    {
                                        order.shippingState
                                    } -{" "}
                                    {
                                        order.shippingPostalCode
                                    }

                                    <br />

                                    Phone:{" "}
                                    {
                                        order.shippingPhone
                                    }

                                    {order.shippingLandmark && (

                                        <>
                                            <br />

                                            Landmark:{" "}
                                            {
                                                order.shippingLandmark
                                            }
                                        </>

                                    )}

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div
                                className="mt-4 d-flex gap-2"
                            >

                                <Button
                                    variant="outline-primary"
                                    onClick={() =>
                                        navigate(
                                            `/orders/${order.orderId}`
                                        )
                                    }
                                >
                                    View Details
                                </Button>


                                {order.orderStatus !==
                                    "CANCELLED" &&
                                    order.orderStatus !==
                                        "SHIPPED" &&
                                    order.orderStatus !==
                                        "DELIVERED" && (

                                    <Button
                                        variant="outline-danger"
                                        disabled={
                                            cancellingId ===
                                            order.orderId
                                        }
                                        onClick={() =>
                                            cancelOrder(
                                                order.orderId
                                            )
                                        }
                                    >

                                        {cancellingId ===
                                        order.orderId
                                            ? "Cancelling..."
                                            : "Cancel Order"}

                                    </Button>

                                )}

                            </div>

                        </Card.Body>

                    </Card>

                )
            )}

        </div>

    );
};

export default MyOrders;