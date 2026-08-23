import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios";

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    productAvailable: boolean;
    brand: string;
    categoryName?: string;
    shopName: string | null;
}

interface ProductPage {
    content: Product[];
    totalElements: number;
    totalPages: number;
}

const PAGE_SIZE = 20;

const AdminProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const { data } = await API.get<ProductPage>("/admin/products", {
                params: {
                    keyword: search.trim(),
                    status: statusFilter,
                    page,
                    size: PAGE_SIZE
                }
            });

            setProducts(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err: any) {
            setError(err?.response?.data || "Unable to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, search, statusFilter]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this product?"))
            return;

        try {
            await API.delete(`/admin/products/${id}`);
            fetchProducts();
        } catch (err: any) {
            alert(err?.response?.data || "Unable to delete product.");
        }
    };

    const updateSearch = (value: string) => {
        setSearch(value);
        setPage(0);
    };

    const updateStatus = (value: string) => {
        setStatusFilter(value);
        setPage(0);
    };

    const pageNumbers = Array.from(
        { length: totalPages },
        (_, i) => i
    ).filter(
        i =>
            i === 0 ||
            i === totalPages - 1 ||
            Math.abs(i - page) <= 2
    );

    if (loading) {
        return (
            <div className="admin-customers-page">
                <div className="customer-loading">
                    Loading products...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-customers-page">

            {/* Header */}
            <div className="customers-header">
                <div>
                    <h1>Manage Products</h1>
                    <p>Manage all products across Dunique.</p>
                </div>

                <Link
                    to="/admin/products/add"
                    className="customer-add-button"
                    style={{ textDecoration: "none" }}
                >
                    + Add Product
                </Link>
            </div>

            {error && (
                <div className="customer-error">{error}</div>
            )}

            {/* Search & Filter */}
            <div className="customer-toolbar">
                <input
                    placeholder="Search product, brand, vendor..."
                    value={search}
                    onChange={e => updateSearch(e.target.value)}
                />

                <select
                    className="admin-filter-select"
                    value={statusFilter}
                    onChange={e => updateStatus(e.target.value)}
                >
                    <option value="ALL">All Products</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                    <option value="LOW_STOCK">Low Stock</option>
                </select>

                <span>{totalElements} products</span>
            </div>

            {/* Products */}
            <div className="customer-table-container">
                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Vendor</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {!products.length ? (
                            <tr>
                                <td colSpan={9} className="empty-customers">
                                    No products found.
                                </td>
                            </tr>
                        ) : products.map(product => (
                            <tr key={product.id}>
                                <td>#{product.id}</td>
                                <td><strong>{product.name}</strong></td>
                                <td>{product.brand || "-"}</td>
                                <td>{product.categoryName || "-"}</td>
                                <td>{product.shopName || "-"}</td>

                                <td>
                                    <strong>
                                        ₹{Number(product.price).toLocaleString("en-IN")}
                                    </strong>
                                </td>

                                <td>
                                    <span
                                        style={{
                                            fontWeight: product.stockQuantity <= 5 ? 700 : 400,
                                            color: product.stockQuantity <= 5
                                                ? "#dc2626"
                                                : "#374151"
                                        }}
                                    >
                                        {product.stockQuantity}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={`customer-status ${
                                            product.productAvailable
                                                ? "active"
                                                : "disabled"
                                        }`}
                                    >
                                        {product.productAvailable
                                            ? "Available"
                                            : "Unavailable"}
                                    </span>
                                </td>

                                <td>
                                    <div className="customer-actions">
                                        <button
                                            onClick={() =>
                                                window.location.href = `/product/${product.id}`
                                            }
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() =>
                                                window.location.href =
                                                `/admin/products/edit/${product.id}`
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            style={{ color: "#dc2626" }}
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="product-pagination">
                    <span className="pagination-info">
                        Showing {totalElements ? page * PAGE_SIZE + 1 : 0}
                        {" – "}
                        {Math.min((page + 1) * PAGE_SIZE, totalElements)}
                        {" of "}
                        {totalElements}
                    </span>

                    <div className="customer-pagination">
                        <button
                            className="pagination-button"
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                        >
                            ← Previous
                        </button>

                        {pageNumbers.map((index, position) => (
                            <React.Fragment key={index}>
                                {position > 0 &&
                                    index - pageNumbers[position - 1] > 1 && (
                                        <span className="pagination-dots">
                                            ...
                                        </span>
                                    )}

                                <button
                                    className={
                                        page === index
                                            ? "pagination-button active"
                                            : "pagination-button"
                                    }
                                    onClick={() => setPage(index)}
                                >
                                    {index + 1}
                                </button>
                            </React.Fragment>
                        ))}

                        <button
                            className="pagination-button"
                            disabled={page >= totalPages - 1}
                            onClick={() =>
                                setPage(p => Math.min(p + 1, totalPages - 1))
                            }
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;