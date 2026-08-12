import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios";

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    productAvailable: boolean;
    brand: string;
    categoryId?: number;
    categoryName?: string;
    vendorId?: number;
    shopName: string | null;
}

const AdminProducts = () => {

    const [products, setProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

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


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (
        id: number
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmed) {
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


    // =====================================================
    // FILTER
    // =====================================================

    const filteredProducts =
        useMemo(() => {

            const value =
                search
                    .trim()
                    .toLowerCase();


            return products.filter(
                product => {

                    const searchable =
                        `${product.name}
                        ${product.brand || ""}
                        ${product.shopName || ""}
                        ${product.categoryName || ""}`
                            .toLowerCase();


                    const matchesSearch =
                        searchable.includes(
                            value
                        );


                    const matchesStatus =
                        statusFilter === "ALL"
                        ||
                        (
                            statusFilter ===
                            "AVAILABLE"
                            &&
                            product.productAvailable
                        )
                        ||
                        (
                            statusFilter ===
                            "UNAVAILABLE"
                            &&
                            !product.productAvailable
                        )
                        ||
                        (
                            statusFilter ===
                            "LOW_STOCK"
                            &&
                            product.stockQuantity <= 5
                        );


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            products,
            search,
            statusFilter
        ]);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="admin-customers-page">

                <div className="customer-loading">
                    Loading products...
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
                        Manage Products
                    </h1>

                    <p>
                        Manage all products across
                        Dunique.
                    </p>

                </div>


                <Link
                    to="/admin/products/add"
                    className="customer-add-button"
                    style={{
                        textDecoration: "none"
                    }}
                >
                    + Add Product
                </Link>

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
                    placeholder="Search product, brand, vendor..."
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
                        background: "white"
                    }}
                >

                    <option value="ALL">
                        All Products
                    </option>

                    <option value="AVAILABLE">
                        Available
                    </option>

                    <option value="UNAVAILABLE">
                        Unavailable
                    </option>

                    <option value="LOW_STOCK">
                        Low Stock
                    </option>

                </select>


                <span>
                    {filteredProducts.length}
                    {" "}
                    products
                </span>

            </div>


            {/* TABLE */}

            <div className="customer-table-container">

                <table className="customer-table">

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
                                Category
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

                        {filteredProducts.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={9}
                                    className="empty-customers"
                                >
                                    No products found.
                                </td>

                            </tr>

                        ) : (

                            filteredProducts.map(
                                product => (

                                    <tr
                                        key={
                                            product.id
                                        }
                                    >

                                        {/* ID */}

                                        <td>
                                            #
                                            {
                                                product.id
                                            }
                                        </td>


                                        {/* PRODUCT */}

                                        <td>

                                            <strong>
                                                {
                                                    product.name
                                                }
                                            </strong>

                                        </td>


                                        {/* BRAND */}

                                        <td>
                                            {
                                                product.brand
                                                    || "-"
                                            }
                                        </td>


                                        {/* CATEGORY */}

                                        <td>
                                            {
                                                product.categoryName
                                                    || "-"
                                            }
                                        </td>


                                        {/* VENDOR */}

                                        <td>
                                            {
                                                product.shopName
                                                    || "-"
                                            }
                                        </td>


                                        {/* PRICE */}

                                        <td>

                                            <strong>
                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </td>


                                        {/* STOCK */}

                                        <td>

                                            <span
                                                style={{
                                                    fontWeight:
                                                        product.stockQuantity <= 5
                                                            ? 700
                                                            : 400,

                                                    color:
                                                        product.stockQuantity <= 5
                                                            ? "#dc2626"
                                                            : "#374151"
                                                }}
                                            >
                                                {
                                                    product.stockQuantity
                                                }
                                            </span>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            {product.productAvailable ? (

                                                <span className="customer-status active">
                                                    Available
                                                </span>

                                            ) : (

                                                <span className="customer-status disabled">
                                                    Unavailable
                                                </span>

                                            )}

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div
                                                className="customer-actions"
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        window.location.href =
                                                        `/product/${product.id}`
                                                    }
                                                >
                                                    View
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        window.location.href =
                                                        `/admin/products/edit/${product.id}`
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product.id
                                                        )
                                                    }
                                                    style={{
                                                        color:
                                                            "#dc2626"
                                                    }}
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default AdminProducts;