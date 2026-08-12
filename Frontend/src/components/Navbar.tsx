import React, { useEffect, useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";
import { useAppContext } from "../Context/Context";
import axios from "axios";

import { useAuth } from "../Context/AuthContext";

interface NavbarProps {
    onSelectCategory: (category: string) => void;
}

const Navbar = ({
    onSelectCategory
}: NavbarProps) => {

    // =========================
    // AUTH
    // =========================

    const navigate = useNavigate();

    const {
    user,
    isAuthenticated,
    logout
} = useAuth();

const { clearCart } = useAppContext();


    // =========================
    // THEME
    // =========================

    const getInitialTheme = () => {

        const storedTheme =
            localStorage.getItem("theme");

        return storedTheme
            ? storedTheme
            : "light-theme";
    };

    const [theme, setTheme] =
        useState<string>(
            getInitialTheme()
        );


    // =========================
    // SEARCH
    // =========================

    const [input, setInput] =
        useState<string>("");

    const [searchResults, setSearchResults] =
        useState<any[]>([]);

    const [noResults, setNoResults] =
        useState<boolean>(false);

    const [showSearchResults, setShowSearchResults] =
        useState<boolean>(false);


    // =========================
    // CATEGORIES
    // =========================

    const categories = [
        "Laptop",
        "Headphone",
        "Mobile",
        "Electronics",
        "Toys",
        "Fashion"
    ];


    // =========================
    // LOAD PRODUCTS
    // =========================

    useEffect(() => {

        fetchData();

    }, []);


    const fetchData = async () => {

        try {

            const response =
                await axios.get(
                    "http://localhost:8080/api/products"
                );

            setSearchResults(
                response.data
            );

        } catch (error) {

            console.error(
                "Error fetching products:",
                error
            );

        }
    };


    // =========================
    // SEARCH
    // =========================

    const handleChange = async (
        value: string
    ) => {

        setInput(value);

        if (value.length >= 1) {

            setShowSearchResults(true);

            try {

                const response =
                    await axios.get(
                        `http://localhost:8080/api/products/search?keyword=${encodeURIComponent(value)}`
                    );

                setSearchResults(
                    response.data
                );

                setNoResults(
                    response.data.length === 0
                );

            } catch (error) {

                console.error(
                    "Error searching:",
                    error
                );

                setSearchResults([]);

                setNoResults(true);
            }

        } else {

            setShowSearchResults(false);

            setSearchResults([]);

            setNoResults(false);
        }
    };


    // =========================
    // CATEGORY
    // =========================

    const handleCategorySelect = (
        category: string
    ) => {

        onSelectCategory(category);
    };


    // =========================
    // THEME
    // =========================

    const toggleTheme = () => {

        const newTheme =
            theme === "dark-theme"
                ? "light-theme"
                : "dark-theme";

        setTheme(newTheme);

        localStorage.setItem(
            "theme",
            newTheme
        );
    };


    useEffect(() => {

        document.body.className =
            theme;

    }, [theme]);


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

    clearCart();

    localStorage.removeItem("cart");

    logout();

    navigate("/login");
};


    // =========================
    // UI
    // =========================

    return (

        <header>

            <nav className="navbar navbar-expand-lg fixed-top">

                <div className="container-fluid">


                    {/* BRAND */}

                    <Link
                        className="navbar-brand"
                        to="/"
                    >
                        Dunique Shopping 🛒
                    </Link>


                    {/* MOBILE MENU BUTTON */}

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >

                        <span className="navbar-toggler-icon"></span>

                    </button>


                    <div
                        className="collapse navbar-collapse"
                        id="navbarSupportedContent"
                    >


                        {/* ========================= */}
                        {/* LEFT MENU */}
                        {/* ========================= */}

                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">


                            {/* HOME */}

                            <li className="nav-item">

                                <Link
                                    className="nav-link active"
                                    to="/"
                                >
                                    Home
                                </Link>

                            </li>


                            {/* CATEGORIES */}

                            <li className="nav-item dropdown">

                                <button
                                    className="nav-link dropdown-toggle btn btn-link"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Categories
                                </button>


                                <ul className="dropdown-menu">

                                    {categories.map(
                                        (category) => (

                                            <li
                                                key={category}
                                            >

                                                <button
                                                    className="dropdown-item"
                                                    onClick={() =>
                                                        handleCategorySelect(
                                                            category
                                                        )
                                                    }
                                                >
                                                    {category}
                                                </button>

                                            </li>

                                        )
                                    )}

                                </ul>

                            </li>

                        </ul>


                        {/* ========================= */}
                        {/* RIGHT SIDE */}
                        {/* ========================= */}

                        <div className="d-flex align-items-center gap-2">


                            {/* THEME */}

                            <button
                                className="theme-btn"
                                type="button"
                                onClick={
                                    toggleTheme
                                }
                            >

                                {theme ===
                                "dark-theme" ? (

                                    <i className="bi bi-moon-fill"></i>

                                ) : (

                                    <i className="bi bi-sun-fill"></i>

                                )}

                            </button>


                            {/* CART */}

                            <Link
                                to="/cart"
                                className="nav-link"
                            >

                                <i className="bi bi-cart me-2">
                                    Cart
                                </i>

                            </Link>


                            {/* ========================= */}
                            {/* AUTH */}
                            {/* ========================= */}

                            {isAuthenticated ? (

                                <>

                                    <span
                                        className="nav-link"
                                        style={{
                                            whiteSpace:
                                                "nowrap"
                                        }}
                                    >
                                        Hi,{" "}
                                        {user?.firstName}
                                    </span>


                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={
                                            handleLogout
                                        }
                                    >
                                        Logout
                                    </button>

                                </>

                            ) : (

                                <>

                                    <Link
                                        className="btn btn-outline-primary"
                                        to="/login"
                                    >
                                        Login
                                    </Link>


                                    <Link
                                        className="btn btn-primary"
                                        to="/register"
                                    >
                                        Register
                                    </Link>

                                </>

                            )}


                            {/* ========================= */}
                            {/* SEARCH */}
                            {/* ========================= */}

                            <div
                                style={{
                                    position:
                                        "relative"
                                }}
                            >

                                <input
                                    className="form-control"
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search"
                                    value={input}
                                    onChange={(e) =>
                                        handleChange(
                                            e.target.value
                                        )
                                    }
                                />


                                {showSearchResults && (

                                    <ul
                                        className="list-group"
                                        style={{
                                            position:
                                                "absolute",

                                            top:
                                                "100%",

                                            right: 0,

                                            width:
                                                "300px",

                                            zIndex:
                                                1000,

                                            maxHeight:
                                                "300px",

                                            overflowY:
                                                "auto"
                                        }}
                                    >

                                        {searchResults.length >
                                        0 ? (

                                            searchResults.map(
                                                (result) => (

                                                    <li
                                                        key={
                                                            result.id
                                                        }
                                                        className="list-group-item"
                                                    >

                                                        <Link
                                                            to={`/product/${result.id}`}
                                                            className="search-result-link"
                                                            onClick={() =>
                                                                setShowSearchResults(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            {
                                                                result.name
                                                            }
                                                        </Link>

                                                    </li>

                                                )
                                            )

                                        ) : (

                                            noResults && (

                                                <li className="list-group-item">
                                                    No Product
                                                    with such
                                                    Name
                                                </li>

                                            )

                                        )}

                                    </ul>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </nav>

        </header>
    );
};

export default Navbar;