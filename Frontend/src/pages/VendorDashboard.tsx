import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    productAvailable: boolean;
}

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
    items: OrderItem[];
    createdAt: string;
}

const VendorDashboard = () => {

    const { user } = useAuth();

    const [products, setProducts] =
        useState<Product[]>([]);

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    productsResponse,
                    ordersResponse
                ] = await Promise.all([
                    API.get<Product[]>(
                        "/vendor/products"
                    ),
                    API.get<Order[]>(
                        "/vendor/orders"
                    )
                ]);

                setProducts(
                    productsResponse.data
                );

                setOrders(
                    ordersResponse.data
                );

            } catch (error: any) {

                console.error(
                    "Vendor dashboard error:",
                    error
                );

                setError(
                    error?.response?.data ||
                    "Unable to load dashboard details."
                );

            } finally {

                setLoading(false);
            }
        };

        loadDashboard();

    }, []);


    const totalProducts =
        products.length;


    const totalOrders =
        orders.length;


    const pendingOrders =
        orders.filter(
            order =>
                order.orderStatus === "PLACED" ||
                order.orderStatus === "CONFIRMED"
        ).length;


    const totalSales =
        orders
            .filter(
                order =>
                    order.orderStatus !==
                    "CANCELLED"
            )
            .reduce(
                (total, order) =>
                    total +
                    Number(order.totalAmount || 0),
                0
            );


    if (loading) {

        return (
            <div
                className="container"
                style={{
                    marginTop: "100px"
                }}
            >
                <h3>
                    Loading dashboard...
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

            {/* HEADER */}

            <div className="mb-4">

                <h2>
                    Vendor Dashboard
                </h2>

                <p className="text-muted">
                    Welcome back,{" "}
                    <strong>
                        {user?.firstName}
                    </strong>
                </p>

            </div>


            {/* ERROR */}

            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            {/* STATS */}

            <div className="row g-4 mb-5">

                {/* PRODUCTS */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <p className="text-muted mb-2">
                                My Products
                            </p>

                            <h2>
                                {totalProducts}
                            </h2>

                            <Link
                                to="/vendor/products"
                                className="text-decoration-none"
                            >
                                View Products →
                            </Link>

                        </div>

                    </div>

                </div>


                {/* ORDERS */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <p className="text-muted mb-2">
                                Total Orders
                            </p>

                            <h2>
                                {totalOrders}
                            </h2>

                            <Link
                                to="/vendor/orders"
                                className="text-decoration-none"
                            >
                                View Orders →
                            </Link>

                        </div>

                    </div>

                </div>


                {/* PENDING */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <p className="text-muted mb-2">
                                Pending Orders
                            </p>

                            <h2>
                                {pendingOrders}
                            </h2>

                            <Link
                                to="/vendor/orders"
                                className="text-decoration-none"
                            >
                                Manage Orders →
                            </Link>

                        </div>

                    </div>

                </div>


                {/* SALES */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <p className="text-muted mb-2">
                                Total Sales
                            </p>

                            <h2>
                                ₹
                                {totalSales.toLocaleString(
                                    "en-IN"
                                )}
                            </h2>

                            <small className="text-muted">
                                Excluding cancelled orders
                            </small>

                        </div>

                    </div>

                </div>

            </div>


            {/* QUICK ACTIONS */}

            <h4 className="mb-3">
                Quick Actions
            </h4>


            <div className="row g-4">


                <div className="col-md-4">

                    <Link
                        to="/vendor/products"
                        className="text-decoration-none"
                    >

                        <div
                            className="card shadow-sm h-100"
                        >

                            <div className="card-body">

                                <h4>
                                    📦 My Products
                                </h4>

                                <p className="text-muted">
                                    View, edit and manage
                                    your products.
                                </p>

                            </div>

                        </div>

                    </Link>

                </div>


                <div className="col-md-4">

                    <Link
                        to="/vendor/products/add"
                        className="text-decoration-none"
                    >

                        <div
                            className="card shadow-sm h-100"
                        >

                            <div className="card-body">

                                <h4>
                                    ➕ Add Product
                                </h4>

                                <p className="text-muted">
                                    Add a new product to
                                    your shop.
                                </p>

                            </div>

                        </div>

                    </Link>

                </div>


                <div className="col-md-4">

                    <Link
                        to="/vendor/orders"
                        className="text-decoration-none"
                    >

                        <div
                            className="card shadow-sm h-100"
                        >

                            <div className="card-body">

                                <h4>
                                    🛒 Orders
                                </h4>

                                <p className="text-muted">
                                    View and manage
                                    customer orders.
                                </p>

                            </div>

                        </div>

                    </Link>

                </div>

            </div>


            {/* RECENT ORDERS */}

            <div className="mt-5">

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <h4>
                        Recent Orders
                    </h4>

                    <Link
                        to="/vendor/orders"
                        className="btn btn-outline-primary btn-sm"
                    >
                        View All
                    </Link>

                </div>


                {orders.length === 0 ? (

                    <div className="card shadow-sm">

                        <div className="card-body text-center">

                            <p className="text-muted mb-0">
                                No orders yet.
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="card shadow-sm">

                        <div className="table-responsive">

                            <table className="table mb-0">

                                <thead>

                                    <tr>
                                        <th>
                                            Order ID
                                        </th>

                                        <th>
                                            Products
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Date
                                        </th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {orders
                                        .slice(0, 5)
                                        .map(order => (

                                            <tr
                                                key={
                                                    order.orderId
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        order.orderId
                                                    }
                                                </td>


                                                <td>

                                                    {order.items
                                                        ?.map(
                                                            item =>
                                                                item.productName
                                                        )
                                                        .join(
                                                            ", "
                                                        )}

                                                </td>


                                                <td>
                                                    ₹
                                                    {Number(
                                                        order.totalAmount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            order.orderStatus ===
                                                            "CANCELLED"
                                                                ? "badge bg-danger"
                                                                : order.orderStatus ===
                                                                  "DELIVERED"
                                                                ? "badge bg-success"
                                                                : "badge bg-warning text-dark"
                                                        }
                                                    >
                                                        {
                                                            order.orderStatus
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )}
                                                </td>

                                            </tr>

                                        ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
};

export default VendorDashboard;