import React, { useEffect, useState } from "react";
import API from "../axios";
import type { Product } from "../Context/Context";

interface NavbarProps {
    onSelectCategory: (category: string) => void;
    onSearch?: (value: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
    onSelectCategory,
    onSearch
}) => {

    const getInitialTheme = (): string => {
        const storedTheme =
            localStorage.getItem("theme");

        return storedTheme
            ? storedTheme
            : "light-theme";
    };

    const [selectedCategory, setSelectedCategory] =
        useState<string>("");

    const [theme, setTheme] =
        useState<string>(getInitialTheme);

    const [input, setInput] =
        useState<string>("");

    const [searchResults, setSearchResults] =
        useState<Product[]>([]);

    const [noResults, setNoResults] =
        useState<boolean>(false);

    const [searchFocused, setSearchFocused] =
        useState<boolean>(false);

    const [showSearchResults, setShowSearchResults] =
        useState<boolean>(false);

    useEffect(() => {

        fetchData();

    }, []);

    const fetchData = async (): Promise<void> => {

        try {

            const response =
                await API.get<Product[]>(
                    "/products"
                );

            setSearchResults(response.data);

            console.log(response.data);

        } catch (error) {

            console.error(
                "Error fetching data:",
                error
            );
        }
    };

    const handleChange = async (
        value: string
    ): Promise<void> => {

        setInput(value);

        if (value.length >= 1) {

            setShowSearchResults(true);

            try {

                const response =
                    await API.get<Product[]>(
                        `/products/search?keyword=${encodeURIComponent(
                            value
                        )}`
                    );

                setSearchResults(response.data);

                setNoResults(
                    response.data.length === 0
                );

                console.log(response.data);

            } catch (error) {

                console.error(
                    "Error searching:",
                    error
                );
            }

        } else {

            setShowSearchResults(false);

            setSearchResults([]);

            setNoResults(false);
        }

        if (onSearch) {
            onSearch(value);
        }
    };

    const handleCategorySelect = (
        category: string
    ): void => {

        setSelectedCategory(category);

        onSelectCategory(category);
    };

    const toggleTheme = (): void => {

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

        document.body.className = theme;

    }, [theme]);

    const categories: string[] = [
        "Laptop",
        "Headphone",
        "Mobile",
        "Electronics",
        "Toys",
        "Fashion"
    ];

    return (
        <>
            <header>

                <nav className="navbar navbar-expand-lg fixed-top">

                    <div className="container-fluid">

                        <a
                            className="navbar-brand"
                            href="https://www.linkedin.com/in/harish-kumar-gatti-663066249/"
                        >
                            HiTeckKart
                        </a>

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

                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                                <li className="nav-item">

                                    <a
                                        className="nav-link active"
                                        aria-current="page"
                                        href="/"
                                    >
                                        Home
                                    </a>

                                </li>

                                <li className="nav-item">

                                    <a
                                        className="nav-link"
                                        href="/add_product"
                                    >
                                        Add Product
                                    </a>

                                </li>

                                <li className="nav-item dropdown">

                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="/"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Categories
                                    </a>

                                    <ul className="dropdown-menu">

                                        {categories.map(
                                            (category) => (

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
                                                    >
                                                        {category}
                                                    </button>

                                                </li>
                                            )
                                        )}

                                    </ul>

                                </li>

                            </ul>

                            <button
                                className="theme-btn"
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

                            <div className="d-flex align-items-center cart">

                                <a
                                    href="/cart"
                                    className="nav-link text-dark"
                                >

                                    <i
                                        className="bi bi-cart me-2"
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center"
                                        }}
                                    >
                                        Cart
                                    </i>

                                </a>

                                <input
                                    className="form-control me-2"
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search"
                                    value={input}
                                    onChange={(e) =>
                                        handleChange(
                                            e.target.value
                                        )
                                    }
                                    onFocus={() =>
                                        setSearchFocused(
                                            true
                                        )
                                    }
                                    onBlur={() =>
                                        setSearchFocused(
                                            false
                                        )
                                    }
                                />

                                {showSearchResults && (

                                    <ul className="list-group">

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

                                                        <a
                                                            href={`/product/${result.id}`}
                                                            className="search-result-link"
                                                        >

                                                            <span>
                                                                {
                                                                    result.name
                                                                }
                                                            </span>

                                                        </a>

                                                    </li>
                                                )
                                            )

                                        ) : (

                                            noResults && (

                                                <p className="no-results-message">
                                                    No Product with
                                                    such Name
                                                </p>

                                            )
                                        )}

                                    </ul>

                                )}

                                <div />

                            </div>

                        </div>

                    </div>

                </nav>

            </header>
        </>
    );
};

export default Navbar;