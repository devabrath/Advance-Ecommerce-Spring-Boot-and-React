import React, {
    useContext,
    useEffect,
    useState
} from "react";
import AppContext, {
    type CartItem
} from "../Context/Context";
import API from "../axios";
import CheckoutPopup from "./CheckoutPopup";
import { Button } from "react-bootstrap";

interface CartItemWithImage extends CartItem {
    imageUrl: string;
}

const Cart: React.FC = () => {

    const context = useContext(AppContext);

    if (!context) {
        throw new Error(
            "Cart must be used inside AppProvider"
        );
    }

    const {
    cart,
    removeFromCart,
    clearCart,
    updateCartQuantity,
    refreshCart
} = useContext(AppContext);

    const [
        cartItems,
        setCartItems
    ] = useState<CartItemWithImage[]>([]);

    const [
        totalPrice,
        setTotalPrice
    ] = useState<number>(0);

    const [
        cartImage,
        setCartImage
    ] = useState<File | null>(null);

    const [
        showModal,
        setShowModal
    ] = useState<boolean>(false);

    useEffect(() => {

        const fetchImagesAndUpdateCart =
            async (): Promise<void> => {

                console.log("Cart", cart);

                try {

                    const response =
                        await API.get<CartItem[]>(
                            "/products"
                        );

                    const backendProductIds =
                        response.data.map(
                            (product) =>
                                product.id
                        );

                    const updatedCartItems =
                        cart.filter(
                            (item) =>
                                backendProductIds.includes(
                                    item.id
                                )
                        );

                    const cartItemsWithImages =
                        await Promise.all(

                            updatedCartItems.map(
                                async (item) => {

                                    try {

                                        const imageResponse =
                                            await API.get(
                                                `/product/${item.id}/image`,
                                                {
                                                    responseType:
                                                        "blob"
                                                }
                                            );

                                        const imageFile =
                                            await convertUrlToFile(
                                                imageResponse.data,
                                                item.imageName ||
                                                    `product-${item.id}.jpg`
                                            );

                                        setCartImage(
                                            imageFile
                                        );

                                        const imageUrl =
                                            URL.createObjectURL(
                                                imageResponse.data
                                            );

                                        return {
                                            ...item,
                                            imageUrl
                                        };

                                    } catch (error) {

                                        console.error(
                                            "Error fetching image:",
                                            error
                                        );

                                        return {
                                            ...item,
                                            imageUrl:
                                                ""
                                        };
                                    }
                                }
                            )
                        );

                    setCartItems(
                        cartItemsWithImages
                    );

                } catch (error) {

                    console.error(
                        "Error fetching product data:",
                        error
                    );
                }
            };

        if (cart.length > 0) {

            fetchImagesAndUpdateCart();

        } else {

            setCartItems([]);
        }

    }, [cart]);

    useEffect(() => {

        const total =
            cartItems.reduce(
                (acc, item) =>
                    acc +
                    Number(item.price) *
                        item.quantity,
                0
            );

        setTotalPrice(total);

    }, [cartItems]);

    const convertUrlToFile = async (
        blobData: Blob,
        fileName: string
    ): Promise<File> => {

        return new File(
            [blobData],
            fileName,
            {
                type: blobData.type
            }
        );
    };

    const handleIncreaseQuantity = async (itemId: number) => {

    try {

        const item = cartItems.find(
            (item) => item.id === itemId
        );

        if (!item) {
            console.error("Item not found:", itemId);
            return;
        }

        if (item.quantity >= item.stockQuantity) {
            alert("Cannot add more than available stock");
            return;
        }

        await updateCartQuantity(
            itemId,
            item.quantity + 1
        );

        await refreshCart();

    } catch (error) {

        console.error(
            "Error increasing quantity:",
            error
        );

    }
};

    const handleDecreaseQuantity = async (itemId: number) => {

    try {

        const item = cartItems.find(
            (item) => item.id === itemId
        );

        if (!item) {
            return;
        }

        if (item.quantity <= 1) {
            return;
        }

        await updateCartQuantity(
            itemId,
            item.quantity - 1
        );

        await refreshCart();

    } catch (error) {

        console.error(
            "Error decreasing quantity:",
            error
        );

    }
};

    const handleRemoveFromCart = async (
    itemId: number
) => {

    try {

        await removeFromCart(itemId);

        await refreshCart();

        setCartItems(
            (currentItems) =>
                currentItems.filter(
                    (item) =>
                        item.id !== itemId
                )
        );

    } catch (error) {

        console.error(
            "Error removing item:",
            error
        );

    }
};

    // const handleCheckout = async (): Promise<void> => {

    //     try {

    //         /*
    //          * This preserves your existing
    //          * product-stock update logic.
    //          *
    //          * Your newer backend has a proper
    //          * /customer/orders/checkout endpoint,
    //          * so we'll replace this later with
    //          * the real order checkout flow.
    //          */

    //         for (const item of cartItems) {

    //             const {
    //                 imageUrl,
    //                 imageName,
    //                 imageType,
    //                 quantity,
    //                 ...rest
    //             } = item;

    //             const updatedStockQuantity =
    //                 item.stockQuantity -
    //                 quantity;

    //             const updatedProductData = {
    //                 ...rest,
    //                 stockQuantity:
    //                     updatedStockQuantity
    //             };

    //             console.log(
    //                 "Updated product data",
    //                 updatedProductData
    //             );

    //             const cartProduct =
    //                 new FormData();

    //             if (cartImage) {

    //                 cartProduct.append(
    //                     "imageFile",
    //                     cartImage
    //                 );
    //             }

    //             cartProduct.append(
    //                 "product",
    //                 new Blob(
    //                     [
    //                         JSON.stringify(
    //                             updatedProductData
    //                         )
    //                     ],
    //                     {
    //                         type:
    //                             "application/json"
    //                     }
    //                 )
    //             );

    //             try {

    //                 await API.put(
    //                     `/product/${item.id}`,
    //                     cartProduct
    //                 );

    //                 console.log(
    //                     "Product updated successfully"
    //                 );

    //             } catch (error) {

    //                 console.error(
    //                     "Error updating product:",
    //                     error
    //                 );
    //             }
    //         }

    //         clearCart();

    //         setCartItems([]);

    //         setShowModal(false);

    //     } catch (error) {

    //         console.error(
    //             "Error during checkout:",
    //             error
    //         );
    //     }
    // };
    const handleCheckout = async (addressId: number) => {
    try {

        console.log("========== CHECKOUT ==========");
        console.log("Address ID:", addressId);
        console.log("Cart Items:", cartItems);
        console.log("Total:", totalPrice);

        const response = await API.post(
            "/customer/orders/checkout",
            {
                addressId: addressId
            }
        );

        console.log(
            "ORDER CREATED:",
            response.data
        );

        alert(
            `Order placed successfully!\nOrder ID: ${response.data.orderId}`
        );

        /*
         * Backend already clears the database cart.
         */

        clearCart();

        setCartItems([]);

        setTotalPrice(0);

        setShowModal(false);

        /*
         * Refresh frontend cart state too.
         */

        await refreshCart();

    } catch (error: any) {

        console.error(
            "========== CHECKOUT ERROR =========="
        );

        console.error(
            "FULL ERROR:",
            error
        );

        console.error(
            "STATUS:",
            error?.response?.status
        );

        console.error(
            "RESPONSE:",
            error?.response?.data
        );

        console.error(
            "MESSAGE:",
            error?.message
        );

        console.error(
            "==============================="
        );

        alert(
            error?.response?.data ||
            "Checkout failed. Please try again."
        );
    }
};
    return (
        <div className="cart-container">

            <div className="shopping-cart">

                <div className="title">
                    Shopping Bag
                </div>

                {cartItems.length === 0 ? (

                    <div
                        className="empty"
                        style={{
                            textAlign: "left",
                            padding: "2rem"
                        }}
                    >
                        <h4>
                            Your cart is empty
                        </h4>
                    </div>

                ) : (

                    <>
                        {cartItems.map(
                            (item) => (

                                <li
                                    key={item.id}
                                    className="cart-item"
                                >

                                    <div
                                        className="item"
                                        style={{
                                            display:
                                                "flex",
                                            alignContent:
                                                "center"
                                        }}
                                    >

                                        <div>

                                            <img
                                                src={
                                                    item.imageUrl
                                                }
                                                alt={
                                                    item.name
                                                }
                                                className="cart-item-image"
                                            />

                                        </div>

                                        <div className="description">

                                            <span>
                                                {
                                                    item.brand
                                                }
                                            </span>

                                            <span>
                                                {
                                                    item.name
                                                }
                                            </span>

                                        </div>

                                        <div className="quantity">

                                            <button
                                                className="plus-btn"
                                                type="button"
                                                name="button"
                                                onClick={() =>
                                                    handleIncreaseQuantity(
                                                        item.id
                                                    )
                                                }
                                            >
                                                <i className="bi bi-plus-square-fill"></i>
                                            </button>

                                            <input
                                                type="button"
                                                name="name"
                                                value={
                                                    item.quantity
                                                }
                                                readOnly
                                            />

                                            <button
                                                className="minus-btn"
                                                type="button"
                                                name="button"
                                                onClick={() =>
                                                    handleDecreaseQuantity(
                                                        item.id
                                                    )
                                                }
                                            >
                                                <i className="bi bi-dash-square-fill"></i>
                                            </button>

                                        </div>

                                        <div
                                            className="total-price"
                                            style={{
                                                textAlign:
                                                    "center"
                                            }}
                                        >
                                            $
                                            {
                                                Number(
                                                    item.price
                                                ) *
                                                item.quantity
                                            }
                                        </div>

                                        <button
                                            className="remove-btn"
                                            onClick={() =>
                                                handleRemoveFromCart(
                                                    item.id
                                                )
                                            }
                                        >
                                            <i className="bi bi-trash3-fill"></i>
                                        </button>

                                    </div>

                                </li>
                            )
                        )}

                        <div className="total">
                            Total: ${totalPrice}
                        </div>

                        <Button
                            className="btn btn-primary"
                            style={{
                                width: "100%"
                            }}
                            onClick={() =>
                                setShowModal(true)
                            }
                        >
                            Checkout
                        </Button>

                    </>
                )}

            </div>

            <CheckoutPopup
                show={showModal}
                handleClose={() =>
                    setShowModal(false)
                }
                cartItems={cartItems}
                totalPrice={totalPrice}
                handleCheckout={
                    handleCheckout
                }
            />

        </div>
    );
};

export default Cart;