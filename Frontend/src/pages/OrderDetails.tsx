import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
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

const OrderDetails: React.FC = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] =
        useState<Order | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchOrder = async () => {

            try {

                setLoading(true);

                const response =
                    await API.get<Order>(
                        `/customer/orders/${id}`
                    );

                console.log(
                    "ORDER DETAILS:",
                    response.data
                );

                setOrder(response.data);

            } catch (error: any) {

                console.error(
                    "Error loading order:",
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
                    "Unable to load order details."
                );

            } finally {

                setLoading(false);

            }
        };

        if (id) {
            fetchOrder();
        }

    }, [id]);


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
                    Loading order...
                </p>
            </div>
        );
    }


    if (error || !order) {

        return (
            <div
                style={{
                    paddingTop: "8rem",
                    maxWidth: "900px",
                    margin: "auto"
                }}
            >

                <Alert variant="danger">
                    {error || "Order not found."}
                </Alert>

                <Button
                    onClick={() =>
                        navigate("/orders")
                    }
                >
                    Back to My Orders
                </Button>

            </div>
        );
    }


    return (

        <div
            style={{
                paddingTop: "7rem",
                paddingBottom: "4rem",
                maxWidth: "1000px",
                margin: "auto",
                paddingLeft: "20px",
                paddingRight: "20px"
            }}
        >

            {/* HEADER */}

            <div
                className="d-flex justify-content-between align-items-center mb-4"
            >

                <div>

                    <h2>
                        Order #{order.orderId}
                    </h2>

                    <small className="text-muted">
                        Placed on{" "}
                        {new Date(
                            order.createdAt
                        ).toLocaleString()}
                    </small>

                </div>

                <Badge
                    bg={getStatusVariant(
                        order.orderStatus
                    )}
                    style={{
                        fontSize: "1rem",
                        padding: "10px 15px"
                    }}
                >
                    {order.orderStatus}
                </Badge>

            </div>


            {/* ORDER STATUS */}

            <Card className="mb-4 shadow-sm" style={{width : "Auto"}}>

                <Card.Body>

                    <h5>
                        Order Status
                    </h5>

                    <div
                        className="d-flex justify-content-between mt-3"
                    >

                        <span>
                            Order Status
                        </span>

                        <Badge
                            bg={getStatusVariant(
                                order.orderStatus
                            )}
                        >
                            {order.orderStatus}
                        </Badge>

                    </div>

                    <div
                        className="d-flex justify-content-between mt-3"
                    >

                        <span>
                            Payment Status
                        </span>

                        <Badge
                            bg={
                                order.paymentStatus ===
                                "SUCCESS"
                                    ? "success"
                                    : "secondary"
                            }
                        >
                            {order.paymentStatus}
                        </Badge>

                    </div>

                </Card.Body>

            </Card>


            {/* ITEMS */}

            <Card className="mb-4 shadow-sm " style={{width : "Auto"}}>

                <Card.Body>

                    <h5 className="mb-3">
                        Ordered Items
                    </h5>

                    {order.items.map(
                        (item) => (

                            <div
                                key={item.productId}
                                className="border-bottom py-3"
                            >

                                <div
                                    className="d-flex justify-content-between"
                                >

                                    <div>

                                        <h6>
                                            {
                                                item.productName
                                            }
                                        </h6>

                                        <div className="text-muted">
                                            ₹
                                            {Number(
                                                item.unitPrice
                                            ).toFixed(2)}
                                            {" "}×{" "}
                                            {
                                                item.quantity
                                            }
                                        </div>

                                    </div>

                                    <strong>
                                        ₹
                                        {Number(
                                            item.totalPrice
                                        ).toFixed(2)}
                                    </strong>

                                </div>

                            </div>

                        )
                    )}

                    <div
                        className="d-flex justify-content-between mt-4"
                    >

                        <h5>
                            Total
                        </h5>

                        <h5>
                            ₹
                            {Number(
                                order.totalAmount
                            ).toFixed(2)}
                        </h5>

                    </div>

                </Card.Body>

            </Card>


            {/* DELIVERY ADDRESS */}

            <Card className="mb-4 shadow-sm" style={{width : "Auto"}}>

                <Card.Body>

                    <h5 className="mb-3">
                        Delivery Address
                    </h5>

                    <strong>
                        {order.shippingFullName}
                    </strong>

                    <br />

                    {order.shippingAddressLine}

                    <br />

                    {order.shippingCity},{" "}
                    {order.shippingState} -{" "}
                    {order.shippingPostalCode}

                    <br />

                    Phone:{" "}
                    {order.shippingPhone}

                    {order.shippingLandmark && (
                        <>
                            <br />

                            Landmark:{" "}
                            {order.shippingLandmark}
                        </>
                    )}

                </Card.Body>

            </Card>


            {/* BACK BUTTON */}

            <Button
                variant="secondary"
                onClick={() =>
                    navigate("/orders")
                }
            >
                ← Back to My Orders
            </Button>

        </div>
    );
};

export default OrderDetails;