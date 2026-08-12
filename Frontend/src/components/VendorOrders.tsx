import React, { useEffect, useState } from "react";
import API from "../axios";

interface OrderItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

interface VendorOrder {
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
    shippingLandmark: string | null;
    items: OrderItem[];
    createdAt: string;
}

const VendorOrders = () => {

    const [orders, setOrders] =
        useState<VendorOrder[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchOrders = async () => {

        try {

            setLoading(true);

            const response =
                await API.get<VendorOrder[]>(
                    "/vendor/orders"
                );

            setOrders(response.data);

            setError("");

        } catch (error: any) {

            console.error(
                "Vendor orders error:",
                error
            );

            setError(
                error?.response?.data ||
                "Unable to load vendor orders."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchOrders();

    }, []);


    const updateStatus = async (
        orderId: number,
        status: string
    ) => {

        try {

            await API.put(
                `/vendor/orders/${orderId}/status`,
                null,
                {
                    params: {
                        status
                    }
                }
            );

            alert(
                "Order status updated successfully."
            );

            fetchOrders();

        } catch (error: any) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                error?.response?.data ||
                "Unable to update order status."
            );
        }
    };


    const getNextStatus = (
        currentStatus: string
    ): string | null => {

        if (currentStatus === "PLACED") {
            return "CONFIRMED";
        }

        if (currentStatus === "CONFIRMED") {
            return "SHIPPED";
        }

        if (currentStatus === "SHIPPED") {
            return "DELIVERED";
        }

        return null;
    };


    if (loading) {

        return (
            <div
                className="container"
                style={{
                    marginTop: "100px"
                }}
            >
                <h3>
                    Loading orders...
                </h3>
            </div>
        );
    }


    return (

        <div
            className="container"
            style={{
                marginTop: "100px",
                marginBottom: "50px"
            }}
        >

            <div className="mb-4">

                <h2>
                    Orders
                </h2>

                <p className="text-muted">
                    Manage orders containing your products.
                </p>

            </div>


            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            {!error &&
                orders.length === 0 && (

                    <div className="card shadow-sm">

                        <div className="card-body text-center p-5">

                            <h4>
                                No orders yet
                            </h4>

                            <p className="text-muted mb-0">
                                Orders containing your
                                products will appear here.
                            </p>

                        </div>

                    </div>

                )}


            {orders.length > 0 && (

                <div className="row g-4">

                    {orders.map(order => {

                        const nextStatus =
                            getNextStatus(
                                order.orderStatus
                            );

                        return (

                            <div
                                className="col-12"
                                key={order.orderId}
                            >

                                <div
                                    className="card shadow-sm"
                                >

                                    <div
                                        className="card-body"
                                    >

                                        {/* HEADER */}

                                        <div
                                            className="d-flex justify-content-between align-items-start mb-3"
                                        >

                                            <div>

                                                <h5>
                                                    Order #
                                                    {
                                                        order.orderId
                                                    }
                                                </h5>

                                                <small
                                                    className="text-muted"
                                                >
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </small>

                                            </div>


                                            <span
                                                className={
                                                    order.orderStatus ===
                                                    "DELIVERED"
                                                        ? "badge bg-success"
                                                        : order.orderStatus ===
                                                          "CANCELLED"
                                                        ? "badge bg-danger"
                                                        : "badge bg-warning text-dark"
                                                }
                                            >
                                                {
                                                    order.orderStatus
                                                }
                                            </span>

                                        </div>


                                        {/* CUSTOMER */}

                                        <div
                                            className="mb-4"
                                        >

                                            <h6>
                                                Delivery Address
                                            </h6>

                                            <p className="mb-1">

                                                <strong>
                                                    {
                                                        order.shippingFullName
                                                    }
                                                </strong>

                                            </p>

                                            <p className="mb-1">

                                                {
                                                    order.shippingPhone
                                                }

                                            </p>

                                            <p className="mb-1">

                                                {
                                                    order.shippingAddressLine
                                                }

                                            </p>

                                            <p className="mb-1">

                                                {
                                                    order.shippingCity
                                                }
                                                ,{" "}
                                                {
                                                    order.shippingState
                                                }{" "}
                                                -{" "}
                                                {
                                                    order.shippingPostalCode
                                                }

                                            </p>

                                            {order.shippingLandmark && (

                                                <p className="mb-0">

                                                    Landmark:{" "}
                                                    {
                                                        order.shippingLandmark
                                                    }

                                                </p>

                                            )}

                                        </div>


                                        {/* PRODUCTS */}

                                        <h6>
                                            Your Products
                                        </h6>

                                        <div
                                            className="table-responsive"
                                        >

                                            <table
                                                className="table table-bordered"
                                            >

                                                <thead>

                                                    <tr>

                                                        <th>
                                                            Product
                                                        </th>

                                                        <th>
                                                            Price
                                                        </th>

                                                        <th>
                                                            Quantity
                                                        </th>

                                                        <th>
                                                            Total
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {order.items.map(
                                                        item => (

                                                            <tr
                                                                key={
                                                                    item.productId
                                                                }
                                                            >

                                                                <td>
                                                                    {
                                                                        item.productName
                                                                    }
                                                                </td>

                                                                <td>
                                                                    ₹
                                                                    {Number(
                                                                        item.unitPrice
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </td>

                                                                <td>
                                                                    ₹
                                                                    {Number(
                                                                        item.totalPrice
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </td>

                                                            </tr>

                                                        )
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>


                                        {/* TOTAL */}

                                        <div
                                            className="d-flex justify-content-between align-items-center mt-3"
                                        >

                                            <h5>
                                                Order Total: ₹
                                                {Number(
                                                    order.totalAmount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </h5>


                                            {/* STATUS BUTTON */}

                                            {nextStatus && (

                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() =>
                                                        updateStatus(
                                                            order.orderId,
                                                            nextStatus
                                                        )
                                                    }
                                                >
                                                    Mark as{" "}
                                                    {nextStatus}
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        );
                    })}

                </div>

            )}

        </div>
    );
};

export default VendorOrders;