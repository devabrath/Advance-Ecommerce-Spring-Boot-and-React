import "./App.css";
import { useState } from "react";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "./Context/Context";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {

    const [selectedCategory, setSelectedCategory] =
        useState<string>("");

    const handleCategorySelect = (
        category: string
    ) => {

        setSelectedCategory(category);

        console.log(
            "Selected category:",
            category
        );
    };

    return (
        <AppProvider>

            <BrowserRouter>

                <Navbar
                    onSelectCategory={
                        handleCategorySelect
                    }
                />

                <Routes>

                    <Route
                        path="/"
                        element={
                            <Home
                                selectedCategory={
                                    selectedCategory
                                }
                            />
                        }
                    />

                    <Route
                        path="/add_product"
                        element={<AddProduct />}
                    />

                    <Route
                        path="/product"
                        element={<Product />}
                    />

                    <Route
                        path="/product/:id"
                        element={<Product />}
                    />

                    <Route
                        path="/cart"
                        element={<Cart />}
                    />

                    <Route
                        path="/product/update/:id"
                        element={
                            <UpdateProduct />
                        }
                    />

                </Routes>

            </BrowserRouter>

        </AppProvider>
    );
}

export default App;