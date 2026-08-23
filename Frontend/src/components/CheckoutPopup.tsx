import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import API from "../axios";
import type { CartItem } from "../Context/Context";

interface CheckoutItem extends CartItem { imageUrl: string; }

interface Address {
    id: number; fullName: string; phone: string; addressLine: string; city: string; state: string;
    postalCode: string; landmark?: string; addressType: string; defaultAddress: boolean;
}

type PaymentMethod = "UPI" | "COD";

interface CheckoutPopupProps {
    show: boolean; handleClose: () => void; cartItems: CheckoutItem[]; totalPrice: number;
    handleCheckout: (addressId: number, paymentMethod: PaymentMethod) => Promise<void>;
}

const CheckoutPopup: React.FC<CheckoutPopupProps> = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!show) return;

        const fetchAddresses = async () => {
            setLoadingAddresses(true);
            setError("");

            try {
                const response = await API.get<Address[]>("/customer/addresses");
                setAddresses(response.data);

                const defaultAddress = response.data.find(address => address.defaultAddress);
                if (defaultAddress) setSelectedAddressId(defaultAddress.id);
                else if (response.data.length > 0) setSelectedAddressId(response.data[0].id);
                else setSelectedAddressId(null);
            } catch (err: any) {
                console.error("ADDRESS ERROR:", err);
                setError(err?.response?.data?.message || "Unable to load your addresses.");
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [show]);

    const confirmPurchase = async () => {
        if (selectedAddressId === null) {
            setError("Please select a delivery address.");
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");
            await handleCheckout(selectedAddressId, paymentMethod);
        } catch (err: any) {
            console.error("CHECKOUT ERROR:", err);
            setError(err?.response?.data?.message || err?.response?.data || "Unable to complete checkout.");
        } finally {
            setPlacingOrder(false);
        }
    };

    const formatPrice = (price: number) => Number(price).toLocaleString("en-IN");

    return (
        <Modal show={show} onHide={placingOrder ? undefined : handleClose} size="lg" centered>
            <Modal.Header closeButton={!placingOrder}>
                <Modal.Title>Checkout</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* ORDER ITEMS */}
                <h5 className="mb-3">Your Order</h5>

                <div className="checkout-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="checkout-item" style={{ display: "flex", gap: "15px", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #e5e7eb" }}>
                            <img src={item.imageUrl} alt={item.name} style={{ width: "85px", height: "85px", objectFit: "cover", borderRadius: "8px" }} />

                            <div style={{ flex: 1 }}>
                                <strong>{item.name}</strong>
                                {item.brand && <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "3px" }}>{item.brand}</div>}
                                <div style={{ fontSize: "14px", marginTop: "6px" }}>Quantity: {item.quantity}</div>
                                <strong>₹{formatPrice(Number(item.price) * item.quantity)}</strong>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ERROR */}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* DELIVERY ADDRESS */}
                <h5 className="mt-4 mb-3">Delivery Address</h5>
                {loadingAddresses && <p>Loading addresses...</p>}

                {!loadingAddresses && addresses.length === 0 && !error && (
                    <Alert variant="warning">You don't have a saved address. Please add an address before placing your order.</Alert>
                )}

                {addresses.length > 0 && (
                    <div>
                        {addresses.map(address => (
                            <Form.Check
                                key={address.id}
                                type="radio"
                                name="deliveryAddress"
                                id={`address-${address.id}`}
                                className="mb-3"
                                checked={selectedAddressId === address.id}
                                disabled={placingOrder}
                                onChange={() => { setSelectedAddressId(address.id); }}
                                label={
                                    <div style={{ marginLeft: "8px" }}>
                                        <strong>{address.fullName}</strong>
                                        {address.defaultAddress && <span className="badge bg-success ms-2">Default</span>}
                                        <div>{address.addressLine}</div>
                                        <div>{address.city}, {address.state} - {address.postalCode}</div>
                                        <div>Phone: {address.phone}</div>
                                        {address.landmark && <div>Landmark: {address.landmark}</div>}
                                        <small style={{ color: "#6b7280" }}>{address.addressType}</small>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                )}

                {/* PAYMENT METHOD */}
                <h5 className="mt-4 mb-3">Payment Method</h5>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                    {/* UPI */}
                    <button
                        type="button"
                        disabled={placingOrder}
                        onClick={() => setPaymentMethod("UPI")}
                        style={{ border: paymentMethod === "UPI" ? "2px solid #2563eb" : "1px solid #e5e7eb", background: paymentMethod === "UPI" ? "#eff6ff" : "#ffffff", borderRadius: "10px", padding: "14px", cursor: "pointer", textAlign: "left", fontWeight: paymentMethod === "UPI" ? "600" : "400" }}
                    >
                        <span style={{ marginRight: "8px" }}>📱</span>UPI
                    </button>

                    {/* COD */}
                    <button
                        type="button"
                        disabled={placingOrder}
                        onClick={() => setPaymentMethod("COD")}
                        style={{ border: paymentMethod === "COD" ? "2px solid #2563eb" : "1px solid #e5e7eb", background: paymentMethod === "COD" ? "#eff6ff" : "#ffffff", borderRadius: "10px", padding: "14px", cursor: "pointer", textAlign: "left", fontWeight: paymentMethod === "COD" ? "600" : "400" }}
                    >
                        <span style={{ marginRight: "8px" }}>💵</span>Cash on Delivery
                    </button>
                </div>

                {/* TOTAL */}
                <div className="mt-4 pt-3" style={{ borderTop: "2px solid #e5e7eb" }}>
                    <h4 className="text-center">Total: ₹{formatPrice(totalPrice)}</h4>
                    <p className="text-center text-muted mb-0">Selected Payment: {paymentMethod === "UPI" ? "UPI / Razorpay" : "Cash on Delivery"}</p>
                </div>
            </Modal.Body>

            {/* FOOTER */}
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={placingOrder}>Close</Button>
                <Button
                    variant={paymentMethod === "UPI" ? "primary" : "success"}
                    onClick={confirmPurchase}
                    disabled={loadingAddresses || addresses.length === 0 || selectedAddressId === null || placingOrder}
                >
                    {placingOrder ? (paymentMethod === "UPI" ? "Opening Razorpay..." : "Placing Order...") : (paymentMethod === "UPI" ? "Pay with Razorpay" : "Place COD Order")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CheckoutPopup;