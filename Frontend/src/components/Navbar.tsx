import React, { useEffect, useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import { useAppContext } from "../Context/Context";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";

import "bootstrap/dist/js/bootstrap.bundle.min.js";

interface NavbarProps {
    onSelectCategory: (category: string) => void;
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

const Navbar = ({
    onSelectCategory
}: NavbarProps) => {

    const navigate = useNavigate();

    const {
        user,
        isAuthenticated,
        logout
    } = useAuth();

    const {
        clearCart
    } = useAppContext();


    /* =========================
       CATEGORIES
    ========================= */

    const categories = [
        "Laptop",
        "Headphone",
        "Mobile",
        "Electronics",
        "Toys",
        "Fashion"
    ];


    /* =========================
       SEARCH
    ========================= */

    const [input, setInput] =
        useState("");

    const [searchResults, setSearchResults] =
        useState<any[]>([]);

    const [noResults, setNoResults] =
        useState(false);

    const [showSearchResults, setShowSearchResults] =
        useState(false);


    /* =========================
       DELIVERY ADDRESS
    ========================= */

    const [defaultAddress, setDefaultAddress] =
        useState<Address | null>(null);


    /* =========================
       FETCH DEFAULT ADDRESS
    ========================= */

    useEffect(() => {

        const fetchDefaultAddress =
            async () => {

                if (
                    !isAuthenticated ||
                    user?.role !== "CUSTOMER"
                ) {

                    setDefaultAddress(null);

                    return;
                }

                try {

                    const response =
                        await API.get<Address[]>(
                            "/customer/addresses"
                        );

                    const addresses =
                        response.data;

                    const address =
                        addresses.find(
                            item =>
                                item.defaultAddress
                        );

                    setDefaultAddress(
                        address ||
                        addresses[0] ||
                        null
                    );

                } catch (error) {

                    console.error(
                        "Unable to load delivery address:",
                        error
                    );

                    setDefaultAddress(null);
                }
            };

        fetchDefaultAddress();

    }, [
        isAuthenticated,
        user?.userId
    ]);


    /* =========================
       SEARCH
    ========================= */

    const handleSearch = async (
        value: string
    ) => {

        setInput(value);

        if (value.trim().length === 0) {

            setShowSearchResults(false);
            setSearchResults([]);
            setNoResults(false);

            return;
        }

        setShowSearchResults(true);

        try {

            const response =
                await API.get(
                    `/products/search?keyword=${encodeURIComponent(
                        value.trim()
                    )}`
                );

            setSearchResults(
                response.data
            );

            setNoResults(
                response.data.length === 0
            );

        } catch (error) {

            console.error(
                "Search error:",
                error
            );

            setSearchResults([]);

            setNoResults(true);
        }
    };


    /* =========================
       SEARCH SUBMIT
    ========================= */

    const handleSearchSubmit = (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!input.trim()) {
            return;
        }

        setShowSearchResults(false);

        navigate(
            `/?search=${encodeURIComponent(
                input.trim()
            )}`
        );
    };


    /* =========================
       CATEGORY
    ========================= */

    const handleCategorySelect = (
        category: string
    ) => {

        onSelectCategory(category);

        navigate("/");
    };


    /* =========================
       LOGOUT
    ========================= */

    const handleLogout = () => {

        clearCart();

        localStorage.removeItem("cart");

        logout();

        setDefaultAddress(null);

        navigate("/login");
    };


    return (

        <>

            <header>

                <nav
                    className="navbar navbar-expand-xl fixed-top"
                    style={{
                        backgroundColor: "#ffffff",
                        borderBottom:
                            "1px solid #e5e7eb",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.08)",
                        minHeight: "72px",
                        zIndex: 1050
                    }}
                >

                    <div
                        className="container-fluid px-3"
                    >


                        {/* =========================
                            LOGO + HOME
                        ========================= */}

                        <div
                            className="d-flex align-items-center"
                            style={{
                                whiteSpace:
                                    "nowrap"
                            }}
                        >

                            <Link
                                to="/"
                                className="text-decoration-none fw-bold"
                                style={{
                                    color: "#1769aa",
                                    fontSize: "21px",
                                    marginRight: "18px"
                                }}
                            >
                                Dunique
                            </Link>


                            <Link
                                to="/"
                                className="text-decoration-none"
                                style={{
                                    color: "#172b4d",
                                    fontSize: "15px",
                                    fontWeight: 600
                                }}
                            >
                                Home
                            </Link>

                        </div>


                        {/* =========================
                            MOBILE TOGGLE
                        ========================= */}

                        <button
                            className="navbar-toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#mainNavbar"
                            aria-controls="mainNavbar"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >

                            <span
                                className="navbar-toggler-icon"
                            />

                        </button>


                        {/* =========================
                            NAVBAR CONTENT
                        ========================= */}

                        <div
                            className="collapse navbar-collapse"
                            id="mainNavbar"
                        >

                            <div
                                className="w-100 d-flex align-items-center gap-2"
                            >


                                {/* =========================
                                    DELIVERY
                                ========================= */}

                                <Link
                                    to={
                                        isAuthenticated
                                            ? "/profile"
                                            : "/login"
                                    }
                                    className="text-decoration-none"
                                    style={{
                                        minWidth:
                                            "175px",
                                        padding:
                                            "5px 8px",
                                        color:
                                            "#172b4d"
                                    }}
                                >

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center"
                                        }}
                                    >

                                        <span
                                            style={{
                                                fontSize:
                                                    "22px",
                                                marginRight:
                                                    "7px"
                                            }}
                                        >
                                            🚚
                                        </span>


                                        <div>

                                            <div
                                                style={{
                                                    fontSize:
                                                        "11px",
                                                    color:
                                                        "#6b7280"
                                                }}
                                            >
                                                Deliver to
                                            </div>


                                            <div
                                                style={{
                                                    fontSize:
                                                        "14px",
                                                    fontWeight:
                                                        600
                                                }}
                                            >

                                                {isAuthenticated
                                                    ? user?.firstName
                                                    : "Sign in"}

                                            </div>


                                            {defaultAddress && (

                                                <div
                                                    style={{
                                                        fontSize:
                                                            "11px",
                                                        color:
                                                            "#6b7280"
                                                    }}
                                                >

                                                    {
                                                        defaultAddress.city
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        defaultAddress.postalCode
                                                    }

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </Link>


                                {/* =========================
                                    CATEGORIES
                                ========================= */}

                                <div
                                    className="dropdown"
                                >

                                    <button
                                        className="btn dropdown-toggle"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{
                                            color:
                                                "#172b4d",
                                            fontWeight:
                                                500,
                                            border:
                                                "none",
                                            background:
                                                "#ffffff"
                                        }}
                                    >
                                        Categories
                                    </button>


                                    <ul
                                        className="dropdown-menu shadow"
                                        style={{
                                            backgroundColor:
                                                "#ffffff",
                                            border:
                                                "1px solid #e5e7eb",
                                            borderRadius:
                                                "8px",
                                            padding:
                                                "6px",
                                            minWidth:
                                                "180px",
                                            opacity: 1
                                        }}
                                    >

                                        {categories.map(
                                            category => (

                                                <li
                                                    key={
                                                        category
                                                    }
                                                >

                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() =>
                                                            handleCategorySelect(
                                                                category
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                "#ffffff",
                                                            color:
                                                                "#172b4d",
                                                            borderRadius:
                                                                "6px",
                                                            padding:
                                                                "9px 12px"
                                                        }}
                                                    >
                                                        {category}
                                                    </button>

                                                </li>

                                            )
                                        )}

                                    </ul>

                                </div>


                                {/* =========================
                                    SEARCH
                                ========================= */}

                                <form
                                    className="d-flex flex-grow-1"
                                    onSubmit={
                                        handleSearchSubmit
                                    }
                                    style={{
                                        position:
                                            "relative",
                                        maxWidth:
                                            "750px"
                                    }}
                                >

                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search products..."
                                        value={input}
                                        onChange={
                                            e =>
                                                handleSearch(
                                                    e.target.value
                                                )
                                        }
                                        onFocus={() => {

                                            if (
                                                input.trim()
                                                    .length > 0
                                            ) {

                                                setShowSearchResults(
                                                    true
                                                );
                                            }

                                        }}
                                        style={{
                                            height:
                                                "42px",
                                            border:
                                                "1px solid #cbd5e1",
                                            borderRight:
                                                "none",
                                            borderRadius:
                                                "6px 0 0 6px",
                                            boxShadow:
                                                "none"
                                        }}
                                    />


                                    <button
                                        type="submit"
                                        style={{
                                            width:
                                                "52px",
                                            border:
                                                "1px solid #f59e0b",
                                            background:
                                                "#fbbf24",
                                            borderRadius:
                                                "0 6px 6px 0",
                                            fontSize:
                                                "18px"
                                        }}
                                    >
                                        🔍
                                    </button>


                                    {/* SEARCH RESULTS */}

                                    {showSearchResults && (

                                        <ul
                                            className="list-group"
                                            style={{
                                                position:
                                                    "absolute",
                                                top:
                                                    "46px",
                                                left: 0,
                                                right: 0,
                                                zIndex:
                                                    2000,
                                                maxHeight:
                                                    "350px",
                                                overflowY:
                                                    "auto",
                                                backgroundColor:
                                                    "#ffffff",
                                                border:
                                                    "1px solid #e5e7eb",
                                                boxShadow:
                                                    "0 5px 15px rgba(0,0,0,0.15)"
                                            }}
                                        >

                                            {searchResults.length >
                                            0 ? (

                                                searchResults.map(
                                                    result => (

                                                        <li
                                                            key={
                                                                result.id
                                                            }
                                                            className="list-group-item"
                                                            style={{
                                                                backgroundColor:
                                                                    "#ffffff"
                                                            }}
                                                        >

                                                            <Link
                                                                to={`/product/${result.id}`}
                                                                className="text-decoration-none"
                                                                style={{
                                                                    color:
                                                                        "#172b4d"
                                                                }}
                                                                onClick={() => {

                                                                    setShowSearchResults(
                                                                        false
                                                                    );

                                                                    setInput(
                                                                        ""
                                                                    );

                                                                }}
                                                            >

                                                                <strong>
                                                                    {
                                                                        result.name
                                                                    }
                                                                </strong>


                                                                {result.brand && (

                                                                    <small
                                                                        className="text-muted ms-2"
                                                                    >
                                                                        {
                                                                            result.brand
                                                                        }
                                                                    </small>

                                                                )}

                                                            </Link>

                                                        </li>

                                                    )
                                                )

                                            ) : (

                                                noResults && (

                                                    <li
                                                        className="list-group-item"
                                                        style={{
                                                            backgroundColor:
                                                                "#ffffff",
                                                            color:
                                                                "#6b7280"
                                                        }}
                                                    >
                                                        No products found
                                                    </li>

                                                )

                                            )}

                                        </ul>

                                    )}

                                </form>


                                {/* =========================
                                    ACCOUNT
                                ========================= */}

                                <div
                                    className="dropdown"
                                >

                                    <button
                                        className="btn dropdown-toggle"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{
                                            color:
                                                "#172b4d",
                                            border:
                                                "none",
                                            background:
                                                "#ffffff",
                                            padding:
                                                "5px 8px",
                                            whiteSpace:
                                                "nowrap"
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize:
                                                    "11px",
                                                color:
                                                    "#6b7280",
                                                textAlign:
                                                    "left"
                                            }}
                                        >
                                            Hello,{" "}
                                            {isAuthenticated
                                                ? user?.firstName
                                                : "Sign in"}
                                        </div>


                                        <div
                                            style={{
                                                fontWeight:
                                                    700,
                                                fontSize:
                                                    "14px"
                                            }}
                                        >
                                            Account
                                        </div>

                                    </button>


                                    <ul
                                        className="dropdown-menu dropdown-menu-end shadow"
                                        style={{
                                            backgroundColor:
                                                "#ffffff",
                                            border:
                                                "1px solid #e5e7eb",
                                            borderRadius:
                                                "8px",
                                            padding:
                                                "6px",
                                            minWidth:
                                                "210px",
                                            opacity: 1
                                        }}
                                    >

                                        {isAuthenticated ? (

                                            <>

                                                {/* CUSTOMER */}

                                                {user?.role ===
                                                    "CUSTOMER" && (

                                                    <>

                                                        <li>

                                                            <Link
                                                                className="dropdown-item"
                                                                to="/profile"
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    color:
                                                                        "#172b4d",
                                                                    borderRadius:
                                                                        "6px",
                                                                    padding:
                                                                        "9px 12px"
                                                                }}
                                                            >
                                                                👤 Your Profile
                                                            </Link>

                                                        </li>


                                                        <li>

                                                            <Link
                                                                className="dropdown-item"
                                                                to="/orders"
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    color:
                                                                        "#172b4d",
                                                                    borderRadius:
                                                                        "6px",
                                                                    padding:
                                                                        "9px 12px"
                                                                }}
                                                            >
                                                                📦 Your Orders
                                                            </Link>

                                                        </li>

                                                    </>

                                                )}


                                                {/* VENDOR */}

                                                {user?.role ===
                                                    "VENDOR" && (

                                                    <li>

                                                        <Link
                                                            className="dropdown-item"
                                                            to="/vendor/dashboard"
                                                            style={{
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                color:
                                                                    "#172b4d",
                                                                borderRadius:
                                                                    "6px",
                                                                padding:
                                                                    "9px 12px"
                                                            }}
                                                        >
                                                            📊 Vendor Dashboard
                                                        </Link>

                                                    </li>

                                                )}


                                                {/* ADMIN */}

                                                {user?.role ===
                                                    "ADMIN" && (

                                                    <li>

                                                        <Link
                                                            className="dropdown-item"
                                                            to="/admin/dashboard"
                                                            style={{
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                color:
                                                                    "#172b4d",
                                                                borderRadius:
                                                                    "6px",
                                                                padding:
                                                                    "9px 12px"
                                                            }}
                                                        >
                                                            📊 Admin Dashboard
                                                        </Link>

                                                    </li>

                                                )}


                                                <li>

                                                    <hr
                                                        className="dropdown-divider"
                                                    />

                                                </li>


                                                {/* LOGOUT */}

                                                <li>

                                                    <button
                                                        className="dropdown-item"
                                                        onClick={
                                                            handleLogout
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                "#ffffff",
                                                            color:
                                                                "#dc2626",
                                                            borderRadius:
                                                                "6px",
                                                            padding:
                                                                "9px 12px"
                                                        }}
                                                    >
                                                        🚪 Logout
                                                    </button>

                                                </li>

                                            </>

                                        ) : (

                                            <>

                                                <li>

                                                    <Link
                                                        className="dropdown-item"
                                                        to="/login"
                                                        style={{
                                                            backgroundColor:
                                                                "#ffffff",
                                                            color:
                                                                "#172b4d",
                                                            borderRadius:
                                                                "6px",
                                                            padding:
                                                                "9px 12px"
                                                        }}
                                                    >
                                                        🔐 Login
                                                    </Link>

                                                </li>


                                                <li>

                                                    <Link
                                                        className="dropdown-item"
                                                        to="/register"
                                                        style={{
                                                            backgroundColor:
                                                                "#ffffff",
                                                            color:
                                                                "#172b4d",
                                                            borderRadius:
                                                                "6px",
                                                            padding:
                                                                "9px 12px"
                                                        }}
                                                    >
                                                        📝 Register
                                                    </Link>

                                                </li>

                                            </>

                                        )}

                                    </ul>

                                </div>


                                {/* =========================
                                    RETURNS & ORDERS
                                ========================= */}

                                <Link
                                    to={
                                        isAuthenticated &&
                                        user?.role ===
                                            "CUSTOMER"
                                            ? "/orders"
                                            : "/login"
                                    }
                                    className="text-decoration-none"
                                    style={{
                                        color:
                                            "#172b4d",
                                        minWidth:
                                            "105px",
                                        padding:
                                            "5px 8px",
                                        whiteSpace:
                                            "nowrap"
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize:
                                                "11px",
                                            color:
                                                "#6b7280"
                                        }}
                                    >
                                        Returns
                                    </div>


                                    <div
                                        style={{
                                            fontSize:
                                                "14px",
                                            fontWeight:
                                                700
                                        }}
                                    >
                                        & Orders
                                    </div>

                                </Link>


                                {/* =========================
                                    CART
                                ========================= */}

                                <Link
                                    to={
                                        isAuthenticated
                                            ? "/cart"
                                            : "/login"
                                    }
                                    className="text-decoration-none d-flex align-items-end"
                                    style={{
                                        color:
                                            "#1769aa",
                                        padding:
                                            "5px 8px",
                                        whiteSpace:
                                            "nowrap"
                                    }}
                                >

                                    <span
                                        style={{
                                            fontSize:
                                                "27px",
                                            marginRight:
                                                "4px"
                                        }}
                                    >
                                        🛒
                                    </span>


                                    <strong
                                        style={{
                                            fontSize:
                                                "14px"
                                        }}
                                    >
                                        Cart
                                    </strong>

                                </Link>


                            </div>

                        </div>

                    </div>

                </nav>

            </header>


            {/* =========================
                DROPDOWN FIX
            ========================= */}

            <style>
                {`
                    .navbar .dropdown-menu {
                        background-color: #ffffff !important;
                        opacity: 1 !important;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                    }

                    .navbar .dropdown-item {
                        background-color: #ffffff !important;
                        color: #172b4d !important;
                        opacity: 1 !important;
                    }

                    .navbar .dropdown-item:hover,
                    .navbar .dropdown-item:focus {
                        background-color: #eaf4ff !important;
                        color: #1769aa !important;
                    }

                    .navbar .dropdown-divider {
                        border-top-color: #e5e7eb !important;
                    }

                    .navbar .dropdown-toggle:hover {
                        color: #1769aa !important;
                    }

                    .navbar a:hover {
                        text-decoration: none;
                    }
                `}
            </style>

        </>

    );
};

export default Navbar;