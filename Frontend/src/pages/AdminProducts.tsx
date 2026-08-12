import React, { useEffect, useState } from "react";
import API from "../axios";

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    productAvailable: boolean;
    brand: string;
    shopName: string | null;
}

const AdminProducts = () => {

    const [products, setProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const fetchProducts = async () => {

        try {

            setLoading(true);

            const response =
                await API.get<Product[]>(
                    "/admin/products"
                );

            setProducts(response.data);

            setError("");

        } catch (err: any) {

            console.error(
                "Admin products error:",
                err
            );

            setError(
                err?.response?.data ||
                "Unable to load products."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchProducts();

    }, []);


    const handleDelete = async (
        id: number
    ) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            await API.delete(
                `/admin/products/${id}`
            );

            setProducts(
                previous =>
                    previous.filter(
                        product =>
                            product.id !== id
                    )
            );

        } catch (err: any) {

            console.error(
                "Delete error:",
                err
            );

            alert(
                err?.response?.data ||
                "Unable to delete product."
            );
        }
    };


    if (loading) {

        return (
            <div className="admin-page">

                <h1>
                    Products
                </h1>

                <p>
                    Loading products...
                </p>

            </div>
        );
    }


    return (

        <div className="admin-page">

            <div
                className="admin-page-header"
            >

                <div>

                    <h1>
                        Products
                    </h1>

                    <p>
                        Manage all products.
                    </p>

                </div>

            </div>


            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            <div className="card shadow-sm">

                <div className="table-responsive">

                    <table
                        className="table table-hover mb-0"
                    >

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Product
                                </th>

                                <th>
                                    Brand
                                </th>

                                <th>
                                    Vendor
                                </th>

                                <th>
                                    Price
                                </th>

                                <th>
                                    Stock
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {products.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={8}
                                        className="text-center"
                                    >
                                        No products found.
                                    </td>

                                </tr>

                            ) : (

                                products.map(
                                    product => (

                                        <tr
                                            key={
                                                product.id
                                            }
                                        >

                                            <td>
                                                {
                                                    product.id
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        product.name
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    product.brand ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    product.shopName ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    product.stockQuantity
                                                }
                                            </td>

                                            <td>

                                                {product.productAvailable ? (

                                                    <span className="badge bg-success">
                                                        Available
                                                    </span>

                                                ) : (

                                                    <span className="badge bg-danger">
                                                        Unavailable
                                                    </span>

                                                )}

                                            </td>

                                            <td>

                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default AdminProducts;