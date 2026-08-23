import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../axios";

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    productAvailable: boolean;
    brand: string;
    categoryId?: number | null;
    categoryName?: string | null;
    vendorId?: number | null;
    shopName?: string | null;
}

const VendorProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await API.get<Product[]>("/vendor/products");
            setProducts(response.data);
            setError("");
        } catch (err: any) {
            console.error("Vendor products error:", err);
            setError(err?.response?.data || "Unable to load your products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this product?");
        if (!confirmed) return;

        try {
            await API.delete(`/vendor/products/${productId}`);
            setProducts(previous => previous.filter(product => product.id !== productId));
            alert("Product deleted successfully.");
        } catch (err: any) {
            console.error("Delete product error:", err);
            alert(err?.response?.data || "Unable to delete product.");
        }
    };

    const filteredProducts = useMemo(() => {
        const value = search.trim().toLowerCase();

        return products.filter(product => {
            const searchable = `${product.name} ${product.brand || ""} ${product.categoryName || ""} ${product.shopName || ""}`.toLowerCase();
            const matchesSearch = searchable.includes(value);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "AVAILABLE" && product.productAvailable) ||
                (statusFilter === "UNAVAILABLE" && !product.productAvailable) ||
                (statusFilter === "LOW_STOCK" && product.stockQuantity > 0 && product.stockQuantity <= 5);

            return matchesSearch && matchesStatus;
        });
    }, [products, search, statusFilter]);

    if (loading) {
        return (
            <div className="admin-customers-page">
                <div className="customer-loading">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="admin-customers-page">
            {/* Header */}
            <div className="customers-header">
                <div>
                    <h1>Manage Products</h1>
                    <p>Manage all products listed by your shop.</p>
                </div>

                <Link to="/vendor/products/add" className="customer-add-button" style={{ textDecoration: "none" }}>+ Add Product</Link>
            </div>

            {/* Error */}
            {error && <div className="customer-error">{error}</div>}

            {/* Toolbar */}
            <div className="customer-toolbar">
                <input type="text" placeholder="Search product, brand, category..." value={search} onChange={e => setSearch(e.target.value)} />

                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-filter-select">
                    <option value="ALL">All Products</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                    <option value="LOW_STOCK">Low Stock</option>
                </select>

                <span>{filteredProducts.length} products</span>
            </div>

            {/* Products Table */}
            <div className="customer-table-container">
                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="empty-customers">No products found.</td>
                            </tr>
                        ) : (
                            filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>#{product.id}</td>
                                    <td><strong>{product.name}</strong></td>
                                    <td>{product.brand || "-"}</td>
                                    <td>{product.categoryName || "-"}</td>
                                    <td><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong></td>

                                    <td>
                                        <span style={{
                                            fontWeight: product.stockQuantity <= 5 ? 700 : 400,
                                            color: product.stockQuantity <= 0 ? "#dc2626" : product.stockQuantity <= 5 ? "#d97706" : "#374151"
                                        }}>
                                            {product.stockQuantity}
                                        </span>
                                    </td>

                                    <td>
                                        {product.productAvailable && product.stockQuantity > 0 ? (
                                            <span className="customer-status active">Available</span>
                                        ) : (
                                            <span className="customer-status disabled">Unavailable</span>
                                        )}
                                    </td>

                                    <td>
                                        <div className="customer-actions">
                                            <button type="button" onClick={() => navigate(`/product/${product.id}`)}>View</button>
                                            <button type="button" onClick={() => navigate(`/vendor/products/edit/${product.id}`)}>Edit</button>
                                            <button type="button" onClick={() => handleDelete(product.id)} style={{ color: "#dc2626" }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorProducts;