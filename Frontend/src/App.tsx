import "./App.css";

import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";
import ProtectedRoute from "./components/ProtectedRoute";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import { AppProvider } from "./Context/Context";
import { AuthProvider } from "./Context/AuthContext";

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

        <AuthProvider>

            <AppProvider>

                <BrowserRouter>

                    <Navbar
                        onSelectCategory={
                            handleCategorySelect
                        }
                    />

                    <Routes>

                        {/* ========================= */}
                        {/* PUBLIC PAGES */}
                        {/* ========================= */}

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
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />

                        <Route
                            path="/product/:id"
                            element={<Product />}
                        />


                        {/* ========================= */}
                        {/* TEMPORARILY PUBLIC */}
                        {/* ========================= */}

                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute
                                    allowedRoles={["CUSTOMER"]}
                                >
                                    <Cart />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/add_product"
                            element={<AddProduct />}
                        />

                        <Route
                            path="/product/update/:id"
                            element={
                                <UpdateProduct />
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute
                                    allowedRoles={["CUSTOMER"]}
                                >
                                    <MyOrders />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                                path="/orders/:id"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={["CUSTOMER"]}
                                    >
                                        <OrderDetails />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={["CUSTOMER"]}
                                    >
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />

                    </Routes>

                </BrowserRouter>

            </AppProvider>

        </AuthProvider>

    );
}

export default App;