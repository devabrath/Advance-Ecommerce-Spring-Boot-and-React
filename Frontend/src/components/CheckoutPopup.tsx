import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import API from "../axios";

import type { CartItem } from "../Context/Context";

interface CheckoutItem extends CartItem {
    imageUrl: string;
}

interface Address {
    id: number;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
    addressType: string;
    defaultAddress: boolean;
}

interface CheckoutPopupProps {
    show: boolean;
    handleClose: () => void;
    cartItems: CheckoutItem[];
    totalPrice: number;
    handleCheckout: (addressId: number) => void | Promise<void>;
}

const CheckoutPopup: React.FC<CheckoutPopupProps> = ({
    show,
    handleClose,
    cartItems,
    totalPrice,
    handleCheckout
}) => {

    const [addresses, setAddresses] =
        useState<Address[]>([]);

    const [selectedAddressId, setSelectedAddressId] =
        useState<number | null>(null);

    const [loadingAddresses, setLoadingAddresses] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        if (!show) {
            return;
        }

        const fetchAddresses = async () => {

            setLoadingAddresses(true);
            setError("");

            try {

                const response =
                    await API.get<Address[]>(
                        "/customer/addresses"
                    );

                setAddresses(response.data);

                // Automatically select default address
                const defaultAddress =
                    response.data.find(
                        (address) =>
                            address.defaultAddress
                    );

                if (defaultAddress) {

                    setSelectedAddressId(
                        defaultAddress.id
                    );

                } else if (
                    response.data.length > 0
                ) {

                    setSelectedAddressId(
                        response.data[0].id
                    );
                }

            } catch (err) {

                console.error(
                    "Error fetching addresses:",
                    err
                );

                setError(
                    "Unable to load your addresses."
                );

            } finally {

                setLoadingAddresses(false);
            }
        };

        fetchAddresses();

    }, [show]);


    const confirmPurchase = async () => {

        if (selectedAddressId === null) {

            setError(
                "Please select a delivery address."
            );

            return;
        }

        await handleCheckout(
            selectedAddressId
        );
    };


    return (

        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
        >

            <Modal.Header closeButton>

                <Modal.Title>
                    Checkout
                </Modal.Title>

            </Modal.Header>


            <Modal.Body>

                {/* ========================= */}
                {/* ORDER ITEMS */}
                {/* ========================= */}

                <h5 className="mb-3">
                    Your Order
                </h5>

                <div className="checkout-items">

                    {cartItems.map((item) => (

                        <div
                            key={item.id}
                            className="checkout-item"
                            style={{
                                display: "flex",
                                marginBottom: "15px",
                                paddingBottom: "15px",
                                borderBottom:
                                    "1px solid #ddd"
                            }}
                        >

                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="cart-item-image"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "cover",
                                    marginRight: "15px"
                                }}
                            />

                            <div>

                                <strong>
                                    {item.name}
                                </strong>

                                <p className="mb-1">
                                    Brand: {item.brand}
                                </p>

                                <p className="mb-1">
                                    Quantity:{" "}
                                    {item.quantity}
                                </p>

                                <p className="mb-0">
                                    Price: ₹
                                    {Number(
                                        item.price
                                    ) *
                                        item.quantity}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>


                {/* ========================= */}
                {/* ADDRESS */}
                {/* ========================= */}

                <h5 className="mt-4 mb-3">
                    Delivery Address
                </h5>


                {loadingAddresses && (

                    <p>
                        Loading addresses...
                    </p>

                )}


                {error && (

                    <Alert variant="danger">
                        {error}
                    </Alert>

                )}


                {!loadingAddresses &&
                    addresses.length === 0 &&
                    !error && (

                        <Alert variant="warning">

                            You don't have a saved
                            address.

                            <br />

                            Please add an address
                            before placing your order.

                        </Alert>

                    )}


                {addresses.length > 0 && (

                    <div>

                        {addresses.map(
                            (address) => (

                                <Form.Check
                                    key={address.id}
                                    type="radio"
                                    name="deliveryAddress"
                                    id={`address-${address.id}`}
                                    className="mb-3"
                                    checked={
                                        selectedAddressId ===
                                        address.id
                                    }
                                    onChange={() =>
                                        setSelectedAddressId(
                                            address.id
                                        )
                                    }
                                    label={
                                        <div
                                            style={{
                                                marginLeft:
                                                    "8px"
                                            }}
                                        >

                                            <strong>
                                                {
                                                    address.fullName
                                                }
                                            </strong>

                                            {address.defaultAddress && (

                                                <span
                                                    className="badge bg-success ms-2"
                                                >
                                                    Default
                                                </span>

                                            )}

                                            <div>
                                                {
                                                    address.addressLine
                                                }
                                            </div>

                                            <div>
                                                {
                                                    address.city
                                                }
                                                ,{" "}
                                                {
                                                    address.state
                                                }{" "}
                                                -{" "}
                                                {
                                                    address.postalCode
                                                }
                                            </div>

                                            <div>
                                                Phone:{" "}
                                                {
                                                    address.phone
                                                }
                                            </div>

                                            {address.landmark && (

                                                <div>
                                                    Landmark:{" "}
                                                    {
                                                        address.landmark
                                                    }
                                                </div>

                                            )}

                                            <small>
                                                {
                                                    address.addressType
                                                }
                                            </small>

                                        </div>
                                    }
                                />

                            )
                        )}

                    </div>

                )}


                {/* ========================= */}
                {/* TOTAL */}
                {/* ========================= */}

                <div
                    className="mt-4 pt-3"
                    style={{
                        borderTop:
                            "2px solid #ddd"
                    }}
                >

                    <h4
                        className="text-center"
                    >
                        Total: ₹{totalPrice}
                    </h4>

                    <p
                        className="text-center text-muted"
                    >
                        Demo Payment: Successful
                    </p>

                </div>

            </Modal.Body>


            <Modal.Footer>

                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    Close
                </Button>


                <Button
                    variant="primary"
                    onClick={confirmPurchase}
                    disabled={
                        loadingAddresses ||
                        addresses.length === 0 ||
                        selectedAddressId === null
                    }
                >
                    Confirm Purchase
                </Button>

            </Modal.Footer>

        </Modal>

    );
};

export default CheckoutPopup;