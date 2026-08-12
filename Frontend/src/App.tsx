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
import VendorOrders from "./components/VendorOrders";

import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import VendorProfile from "./pages/VendorProfile";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProducts from "./components/VendorProducts";
import VendorLayout from "./layouts/VendorLayout";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminVendors from "./pages/AdminVendors";
import AdminCustomers from "./pages/AdminCustomers";
import AdminCategories from "./pages/AdminCategories";
import AdminProfile from "./pages/AdminProfile";
import AdminOrders from "./pages/AdminOrders";
import AdminRevenue from "./pages/AdminRevenue";

import {
    BrowserRouter,
    Routes,
    Route,
    useLocation
} from "react-router-dom";

import { AppProvider } from "./Context/Context";
import { AuthProvider } from "./Context/AuthContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


interface CustomerNavbarProps {
    onSelectCategory: (category: string) => void;
}


const CustomerNavbar = ({
    onSelectCategory
}: CustomerNavbarProps) => {

    const location = useLocation();

    /*
     * Customer Navbar must NOT appear
     * on Vendor or Admin pages.
     */

    const isVendorRoute =
        location.pathname.startsWith("/vendor");

    const isAdminRoute =
        location.pathname.startsWith("/admin");

    if (
        isVendorRoute ||
        isAdminRoute
    ) {
        return null;
    }

    return (
        <Navbar
            onSelectCategory={
                onSelectCategory
            }
        />
    );
};


function App() {

    const [
        selectedCategory,
        setSelectedCategory
    ] = useState<string>("");


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

                    {/* ================================= */}
                    {/* CUSTOMER NAVBAR ONLY */}
                    {/* ================================= */}

                    <CustomerNavbar
                        onSelectCategory={
                            handleCategorySelect
                        }
                    />


                    <Routes>


                        {/* ================================= */}
                        {/* CUSTOMER PUBLIC PAGES */}
                        {/* ================================= */}

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
                            element={
                                <Login />
                            }
                        />


                        <Route
                            path="/register"
                            element={
                                <Register />
                            }
                        />


                        <Route
                            path="/product/:id"
                            element={
                                <Product />
                            }
                        />


                        {/* ================================= */}
                        {/* CUSTOMER PROTECTED PAGES */}
                        {/* ================================= */}

                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "CUSTOMER"
                                    ]}
                                >
                                    <Cart />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "CUSTOMER"
                                    ]}
                                >
                                    <MyOrders />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/orders/:id"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "CUSTOMER"
                                    ]}
                                >
                                    <OrderDetails />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "CUSTOMER"
                                    ]}
                                >
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />


                        {/* ================================= */}
                        {/* OLD CUSTOMER/ADMIN PRODUCT ROUTES */}
                        {/* ================================= */}

                        <Route
                            path="/add_product"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "ADMIN"
                                    ]}
                                >
                                    <AddProduct />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/product/update/:id"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "ADMIN"
                                    ]}
                                >
                                    <UpdateProduct />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={["ADMIN"]}
                                >
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >

                            

                                    <Route
                                        path="/admin/dashboard"
                                        element={<AdminDashboard />}
                                    />
                                    <Route
                                            path="/admin/orders"
                                            element={
                                                <AdminOrders />
                                            }
                                        />
                                        <Route
                                            path="/admin/profile"
                                            element={
                                                <AdminProfile />
                                            }
                                        />
                                        <Route
                                            path="/admin/revenue"
                                            element={<AdminRevenue />}
                                        />

                                    <Route
                                        path="/admin/products"
                                        element={<AdminProducts />}
                                    />

                                    <Route
                                        path="/admin/products/add"
                                        element={<AdminAddProduct />}
                                    />

                                    <Route
                                        path="/admin/vendors"
                                        element={<AdminVendors />}
                                    />

                                    <Route
                                        path="/admin/customers"
                                        element={<AdminCustomers />}
                                    />

                                    <Route
                                        path="/admin/categories"
                                        element={<AdminCategories />}
                                    />  

                        </Route>
                        


                        {/* ================================= */}
                        {/* VENDOR APPLICATION */}
                        {/* ================================= */}

                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "VENDOR"
                                    ]}
                                >
                                    <VendorLayout />
                                </ProtectedRoute>
                            }
                        >

                            <Route
                                path="/vendor/dashboard"
                                element={
                                    <VendorDashboard />
                                }
                            />
                            <Route
                                path="/vendor/orders"
                                element={
                                    <VendorOrders />
                                }
                            />
                            <Route
                                path="/vendor/profile"
                                element={
                                    <VendorProfile />
                                }
                            />

                            <Route
                                path="/vendor/products"
                                element={
                                    <VendorProducts />
                                }
                            />


                            <Route
                                path="/vendor/products/add"
                                element={
                                    <AddProduct />
                                }
                            />


                            <Route
                                path="/vendor/products/edit/:id"
                                element={
                                    <UpdateProduct />
                                }
                            />

                        </Route>


                        {/* ================================= */}
                        {/* ADMIN WILL COME HERE */}
                        {/* ================================= */}

                        {/*

                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "ADMIN"
                                    ]}
                                >
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >

                            <Route
                                path="/admin/dashboard"
                                element={
                                    <AdminDashboard />
                                }
                            />

                        </Route>

                        */}


                    </Routes>

                </BrowserRouter>

            </AppProvider>

        </AuthProvider>
    );
}


export default App;