import React, { useEffect, useMemo, useState } from "react";
import API from "../axios";

interface OrderItem { productId: number; productName: string; unitPrice: number; quantity: number; totalPrice: number; }
interface VendorOrder { orderId: number; totalAmount: number; orderStatus: string; paymentStatus: string; shippingFullName: string; shippingPhone: string; shippingAddressLine: string; shippingCity: string; shippingState: string; shippingPostalCode: string; shippingLandmark: string | null; items: OrderItem[]; createdAt: string; }

const VendorOrders = () => {
    const [orders, setOrders] = useState<VendorOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

    /* LOAD ORDERS */
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get<VendorOrder[]>("/vendor/orders");
            setOrders(response.data);
            setError("");
        } catch (err: any) {
            console.error("Vendor orders error:", err);
            setError(err?.response?.data || "Unable to load vendor orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    /* UPDATE STATUS */
    const updateStatus = async (orderId: number, status: string) => {
        try {
            await API.put(`/vendor/orders/${orderId}/status`, null, { params: { status } });
            alert("Order status updated successfully.");
            fetchOrders();
        } catch (err: any) {
            console.error("Status update error:", err);
            alert(err?.response?.data || "Unable to update order status.");
        }
    };

    /* NEXT STATUS */
    const getNextStatus = (currentStatus: string): string | null => {
        if (currentStatus === "PLACED") return "CONFIRMED";
        if (currentStatus === "CONFIRMED") return "PROCESSING";
        if (currentStatus === "PROCESSING") return "SHIPPED";
        if (currentStatus === "SHIPPED") return "DELIVERED";
        return null;
    };

    /* FILTER */
    const filteredOrders = useMemo(() => {
        const value = search.trim().toLowerCase();

        return orders.filter(order => {
            const searchable = `${order.orderId} ${order.shippingFullName} ${order.shippingPhone} ${order.shippingCity} ${order.orderStatus} ${order.paymentStatus}`.toLowerCase();
            const matchesSearch = searchable.includes(value);
            const matchesStatus = statusFilter === "ALL" || order.orderStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    /* LOADING */
    if (loading) return <div className="admin-customers-page"><div className="customer-loading">Loading orders...</div></div>;

    /* PAGE */
    return (
        <div className="admin-customers-page">
            {/* HEADER */}
            <div className="customers-header">
                <div>
                    <h1>Manage Orders</h1>
                    <p>Manage orders containing your products.</p>
                </div>
            </div>

            {/* ERROR */}
            {error && <div className="customer-error">{error}</div>}

            {/* TOOLBAR */}
            <div className="customer-toolbar">
                <input type="text" placeholder="Search order, customer, phone..." value={search} onChange={e => setSearch(e.target.value)} />

                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-filter-select">
                    <option value="ALL">All Orders</option>
                    <option value="PLACED">Placed</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>

                <span>{filteredOrders.length} orders</span>
            </div>

            {/* TABLE */}
            <div className="customer-table-container">
                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Products</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr><td colSpan={8} className="empty-customers">No orders found.</td></tr>
                        ) : (
                            filteredOrders.map(order => {
                                const nextStatus = getNextStatus(order.orderStatus);

                                return (
                                    <tr key={order.orderId}>
                                        {/* ORDER ID */}
                                        <td><strong>#{order.orderId}</strong></td>

                                        {/* CUSTOMER */}
                                        <td>
                                            <strong>{order.shippingFullName}</strong><br />
                                            <small style={{ color: "#6b7280" }}>{order.shippingPhone}</small>
                                        </td>

                                        {/* PRODUCTS */}
                                        <td>
                                            <div>{order.items.map(item => item.productName).join(", ")}</div>
                                            <small style={{ color: "#6b7280" }}>{order.items.length} product(s)</small>
                                        </td>

                                        {/* AMOUNT */}
                                        <td><strong>₹{Number(order.totalAmount).toLocaleString("en-IN")}</strong></td>

                                        {/* PAYMENT */}
                                        <td>
                                            <span className={order.paymentStatus === "SUCCESS" ? "customer-status active" : order.paymentStatus === "FAILED" ? "customer-status disabled" : "customer-status"}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td>
                                            <span className={order.orderStatus === "DELIVERED" ? "customer-status active" : order.orderStatus === "CANCELLED" ? "customer-status disabled" : "customer-status"}>
                                                {order.orderStatus}
                                            </span>
                                        </td>

                                        {/* DATE */}
                                        <td>
                                            <span style={{ fontSize: "12px" }}>
                                                {new Date(order.createdAt).toLocaleDateString("en-IN")}<br />
                                                <small style={{ color: "#6b7280" }}>{new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small>
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td>
                                            <div className="customer-actions">
                                                {/* VIEW */}
                                                <button type="button" onClick={() => setSelectedOrder(order)}>View</button>

                                                {/* NEXT STATUS */}
                                                {nextStatus && <button type="button" onClick={() => updateStatus(order.orderId, nextStatus)}>Mark {nextStatus}</button>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="customer-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="customer-modal" onClick={e => e.stopPropagation()}>
                        {/* HEADER */}
                        <div className="customer-modal-header">
                            <h2>Order #{selectedOrder.orderId}</h2>
                            <button type="button" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>

                        {/* CUSTOMER */}
                        <h4>Customer Details</h4>
                        <div className="customer-detail-list">
                            <div><span>Name</span><strong>{selectedOrder.shippingFullName}</strong></div>
                            <div><span>Phone</span><strong>{selectedOrder.shippingPhone}</strong></div>
                            <div>
                                <span>Address</span>
                                <strong>
                                    {selectedOrder.shippingAddressLine}<br />
                                    {selectedOrder.shippingCity}, {selectedOrder.shippingState} - {selectedOrder.shippingPostalCode}
                                </strong>
                            </div>
                            {selectedOrder.shippingLandmark && <div><span>Landmark</span><strong>{selectedOrder.shippingLandmark}</strong></div>}
                        </div>

                        {/* PAYMENT + STATUS */}
                        <h4 style={{ marginTop: "20px" }}>Order Information</h4>
                        <div className="customer-detail-list">
                            <div><span>Payment</span><strong>{selectedOrder.paymentStatus}</strong></div>
                            <div><span>Status</span><strong>{selectedOrder.orderStatus}</strong></div>
                            <div><span>Date</span><strong>{new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</strong></div>
                        </div>

                        {/* PRODUCTS */}
                        <h4 style={{ marginTop: "20px" }}>Your Products</h4>
                        <div style={{ overflowX: "auto" }}>
                            <table className="table table-sm">
                                <thead>
                                    <tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map(item => (
                                        <tr key={item.productId}>
                                            <td>{item.productName}</td>
                                            <td>₹{Number(item.unitPrice).toLocaleString("en-IN")}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{Number(item.totalPrice).toLocaleString("en-IN")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* TOTAL */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e5e7eb" }}>
                            <strong>Order Total</strong>
                            <strong>₹{Number(selectedOrder.totalAmount).toLocaleString("en-IN")}</strong>
                        </div>

                        {/* STATUS ACTION */}
                        {getNextStatus(selectedOrder.orderStatus) && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ width: "100%", marginTop: "20px" }}
                                onClick={() => {
                                    const nextStatus = getNextStatus(selectedOrder.orderStatus);

                                    if (nextStatus) {
                                        updateStatus(selectedOrder.orderId, nextStatus);
                                        setSelectedOrder(null);
                                    }
                                }}
                            >
                                Mark as {getNextStatus(selectedOrder.orderStatus)}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrders;