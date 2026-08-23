import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppContext, { type CartItem } from "../Context/Context";
import API from "../axios";
import CheckoutPopup from "./CheckoutPopup";
import unplugged from "../assets/test.jpg";

interface CartItemWithImage extends CartItem { imageUrl: string; }
type PaymentMethod = "UPI" | "COD";

declare global {
    interface Window { Razorpay: any; }
}

const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise(resolve => {
        if (window.Razorpay) { resolve(true); return; }

        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true));
            existingScript.addEventListener("error", () => resolve(false));
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => { resolve(true); };
        script.onerror = () => { resolve(false); };
        document.body.appendChild(script);
    });
};

const Cart: React.FC = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);

    if (!context) throw new Error("Cart must be used inside AppProvider");

    const { cart, removeFromCart, clearCart, updateCartQuantity, refreshCart } = context;
    const [cartItems, setCartItems] = useState<CartItemWithImage[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [updatingItem, setUpdatingItem] = useState<number | null>(null);
    const [removingItem, setRemovingItem] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        const imageUrls: string[] = [];

        const fetchImagesAndUpdateCart = async () => {
            setLoading(true);

            if (cart.length === 0) {
                if (!cancelled) { setCartItems([]); setLoading(false); }
                return;
            }

            try {
                const cartItemsWithImages = await Promise.all(cart.map(async item => {
                    try {
                        const imageResponse = await API.get(`/product/${item.id}/image`, { responseType: "blob" });

                        if (cancelled) return { ...item, imageUrl: unplugged };

                        const imageUrl = URL.createObjectURL(imageResponse.data);
                        imageUrls.push(imageUrl);
                        return { ...item, imageUrl };
                    } catch (error) {
                        console.error(`Error fetching image for product ID: ${item.id}`, error);
                        return { ...item, imageUrl: unplugged };
                    }
                }));

                if (!cancelled) setCartItems(cartItemsWithImages);
            } catch (error) {
                console.error("Error fetching cart images:", error);
                if (!cancelled) setCartItems(cart.map(item => ({ ...item, imageUrl: unplugged })));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchImagesAndUpdateCart();

        return () => {
            cancelled = true;
            imageUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [cart]);

    useEffect(() => {
        const total = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
        setTotalPrice(total);
    }, [cartItems]);

    const handleIncreaseQuantity = async (itemId: number): Promise<void> => {
        try {
            const item = cartItems.find(item => item.id === itemId);
            if (!item) return;

            if (item.quantity >= item.stockQuantity) {
                alert("Cannot add more than available stock.");
                return;
            }

            setUpdatingItem(itemId);
            await updateCartQuantity(itemId, item.quantity + 1);
            await refreshCart();
        } catch (error) {
            console.error("Error increasing quantity:", error);
        } finally {
            setUpdatingItem(null);
        }
    };

    const handleDecreaseQuantity = async (itemId: number): Promise<void> => {
        try {
            const item = cartItems.find(item => item.id === itemId);
            if (!item || item.quantity <= 1) return;

            setUpdatingItem(itemId);
            await updateCartQuantity(itemId, item.quantity - 1);
            await refreshCart();
        } catch (error) {
            console.error("Error decreasing quantity:", error);
        } finally {
            setUpdatingItem(null);
        }
    };

    const handleRemoveFromCart = async (itemId: number): Promise<void> => {
        try {
            setRemovingItem(itemId);
            await removeFromCart(itemId);
            setCartItems(currentItems => currentItems.filter(item => item.id !== itemId));
            await refreshCart();
        } catch (error) {
            console.error("Error removing item:", error);
        } finally {
            setRemovingItem(null);
        }
    };

    const handleCheckout = async (addressId: number, paymentMethod: PaymentMethod): Promise<void> => {
        try {
            if (paymentMethod === "COD") {
                const response = await API.post("/customer/orders/checkout", { addressId, paymentMethod: "COD" });
                alert(`Order placed successfully!\nOrder ID: ${response.data.orderId}`);
                await clearCart();
                setCartItems([]);
                setTotalPrice(0);
                await refreshCart();
                setShowModal(false);
                navigate("/");
                return;
            }

            const razorpayLoaded = await loadRazorpayScript();
            if (!razorpayLoaded) throw new Error("Unable to load Razorpay. Please check your internet connection.");

            const paymentOrderResponse = await API.post("/customer/orders/payment/create-order", { addressId, paymentMethod });
            const razorpayOrder = paymentOrderResponse.data;

            await new Promise<void>((resolve, reject) => {
                const options = {
                    key: razorpayOrder.keyId,
                    amount: Number(razorpayOrder.amount) * 100,
                    currency: razorpayOrder.currency || "INR",
                    name: "E-Commerce Store",
                    description: "Secure Payment",
                    order_id: razorpayOrder.razorpayOrderId,
                    handler: async (response: any) => {
                        try {
                            const verifyResponse = await API.post("/customer/orders/payment/verify", {
                                addressId,
                                paymentMethod,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            });

                            alert(`Payment successful!\nOrder ID: ${verifyResponse.data.orderId}`);
                            await clearCart();
                            setCartItems([]);
                            setTotalPrice(0);
                            await refreshCart();
                            setShowModal(false);
                            navigate("/");
                            resolve();
                        } catch (verifyError: any) {
                            console.error("PAYMENT VERIFICATION ERROR:", verifyError);
                            alert(verifyError?.response?.data?.message || "Payment verification failed.");
                            reject(verifyError);
                        }
                    },
                    modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
                    theme: { color: "#111827" }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            });
        } catch (error: any) {
            console.error("CHECKOUT ERROR:", error);

            const message = error?.response?.data?.message || error?.response?.data || error?.message || "Checkout failed. Please try again.";
            if (message !== "Payment cancelled.") alert(message);
            throw error;
        }
    };

    if (loading) {
        return <div className="cart-page"><div className="cart-loading">Loading your cart...</div></div>;
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-wrapper">
                    <div className="cart-header">
                        <div>
                            <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
                            <h1>Shopping Cart</h1>
                        </div>
                    </div>

                    <div className="empty-cart">
                        <div className="empty-cart-image"><img src={unplugged} alt="Empty cart" /></div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your bag yet.</p>
                        <button type="button" className="continue-shopping-btn" onClick={() => navigate("/")}>Continue Shopping</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-wrapper">
                <div className="cart-header">
                    <div>
                        <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
                        <h1>Shopping Cart</h1>
                        <p>{cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart</p>
                    </div>
                    <button type="button" className="cart-back-btn" onClick={() => navigate("/")}>← Continue Shopping</button>
                </div>

                <div className="cart-layout">
                    <div className="cart-items-section">
                        <div className="cart-items-card">
                            {cartItems.map(item => {
                                const isUpdating = updatingItem === item.id;
                                const isRemoving = removingItem === item.id;

                                return (
                                    <div key={item.id} className="modern-cart-item">
                                        <div className="modern-cart-image">
                                            <img src={item.imageUrl} alt={item.name} onError={event => { event.currentTarget.src = unplugged; }} />
                                        </div>

                                        <div className="modern-cart-details">
                                            <div className="cart-product-info">
                                                <span className="cart-product-brand">{item.brand || "Brand"}</span>
                                                <h3>{item.name}</h3>
                                                {item.categoryName && <span className="cart-product-category">{item.categoryName}</span>}
                                            </div>

                                            <div className="cart-mobile-price">
                                                ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                                            </div>

                                            <div className="cart-item-controls">
                                                <div className="quantity-selector">
                                                    <button type="button" onClick={() => handleDecreaseQuantity(item.id)} disabled={item.quantity <= 1 || isUpdating || isRemoving}>−</button>
                                                    <span>{item.quantity}</span>
                                                    <button type="button" onClick={() => handleIncreaseQuantity(item.id)} disabled={item.quantity >= item.stockQuantity || isUpdating || isRemoving}>+</button>
                                                </div>

                                                <button type="button" className="cart-remove-btn" disabled={isRemoving || isUpdating} onClick={() => handleRemoveFromCart(item.id)}>
                                                    {isRemoving ? "Removing..." : "Remove"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="cart-desktop-price">
                                            <span>Item Total</span>
                                            <strong>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</strong>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <aside className="cart-summary-card">
                        <div className="summary-header"><h2>Order Summary</h2></div>
                        <div className="summary-row"><span>Subtotal</span><strong>₹{totalPrice.toLocaleString("en-IN")}</strong></div>
                        <div className="summary-row"><span>Shipping</span><strong className="free-shipping">Free</strong></div>
                        <div className="summary-divider" />
                        <div className="summary-total"><span>Total</span><strong>₹{totalPrice.toLocaleString("en-IN")}</strong></div>
                        <button type="button" className="checkout-btn" onClick={() => setShowModal(true)}>Proceed to Checkout →</button>
                        <div className="secure-checkout">🔒 Secure checkout</div>
                    </aside>
                </div>
            </div>

            <CheckoutPopup show={showModal} handleClose={() => setShowModal(false)} cartItems={cartItems} totalPrice={totalPrice} handleCheckout={handleCheckout} />
        </div>
    );
};

export default Cart;