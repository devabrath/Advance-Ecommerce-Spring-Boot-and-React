import React, {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../axios";

interface Product {
    id: number;
    name: string;
    description: string;
    brand: string;
    price: number;
    categoryId: number | null;
    categoryName: string | null;
    vendorId: number | null;
    shopName: string | null;
    releaseDate: string | null;
    productAvailable: boolean;
    stockQuantity: number;
    imageName: string | null;
    imageType: string | null;
}

const VendorProducts = () => {

    const navigate = useNavigate();

    const [products, setProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchProducts = async () => {

        try {

            setLoading(true);

            const response =
                await API.get<Product[]>(
                    "/vendor/products"
                );

            setProducts(
                response.data
            );

            setError("");

        } catch (error: any) {

            console.error(
                "Error fetching vendor products:",
                error
            );

            setError(
                error?.response?.data ||
                "Unable to load your products."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchProducts();

    }, []);


    const handleDelete = async (
        productId: number
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await API.delete(
                `/vendor/products/${productId}`
            );

            setProducts(
                previous =>
                    previous.filter(
                        product =>
                            product.id !== productId
                    )
            );

            alert(
                "Product deleted successfully."
            );

        } catch (error: any) {

            console.error(
                "Error deleting product:",
                error
            );

            alert(
                error?.response?.data ||
                "Unable to delete product."
            );
        }
    };


    const getImageUrl = (
        productId: number
    ) => {

        return `${API.defaults.baseURL}/product/${productId}/image`;
    };


    if (loading) {

        return (

            <div
                className="container text-center"
                style={{
                    marginTop: "120px"
                }}
            >

                <h3>
                    Loading your products...
                </h3>

            </div>
        );
    }


    return (

        <div
            className="container"
            style={{
                marginTop: "100px",
                marginBottom: "50px"
            }}
        >

            <div
                className="d-flex justify-content-between align-items-center mb-4"
            >

                <div>

                    <h2>
                        My Products
                    </h2>

                    <p className="text-muted">
                        Manage products listed by your shop.
                    </p>

                </div>


                <Link
                    to="/vendor/products/add"
                    className="btn btn-primary"
                >
                    + Add Product
                </Link>

            </div>


            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            {!error &&
                products.length === 0 && (

                    <div
                        className="text-center border rounded p-5"
                    >

                        <h4>
                            No products yet
                        </h4>

                        <p className="text-muted">
                            Add your first product to
                            start selling.
                        </p>

                        <Link
                            to="/vendor/products/add"
                            className="btn btn-primary"
                        >
                            Add Product
                        </Link>

                    </div>

                )}


            {products.length > 0 && (

                <div className="row g-4">

                    {products.map(product => (

                        <div
                            className="col-md-6 col-lg-4"
                            key={product.id}
                        >

                            <div
                                className="card h-100 shadow-sm"
                            >


                                {/* IMAGE */}

                                <img
                                    src={
                                        getImageUrl(
                                            product.id
                                        )
                                    }
                                    className="card-img-top"
                                    alt={
                                        product.name
                                    }
                                    style={{
                                        height:
                                            "220px",
                                        objectFit:
                                            "contain",
                                        padding:
                                            "15px"
                                    }}
                                />


                                <div
                                    className="card-body"
                                >

                                    <h5
                                        className="card-title"
                                    >
                                        {product.name}
                                    </h5>


                                    <p
                                        className="text-muted mb-1"
                                    >
                                        {product.brand}
                                    </p>


                                    <h5
                                        className="text-primary"
                                    >
                                        ₹
                                        {Number(
                                            product.price
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </h5>


                                    <p className="mb-1">

                                        Stock:{" "}

                                        <strong>
                                            {
                                                product.stockQuantity
                                            }
                                        </strong>

                                    </p>


                                    <p>

                                        Status:{" "}

                                        <strong
                                            className={
                                                product.productAvailable
                                                    ? "text-success"
                                                    : "text-danger"
                                            }
                                        >
                                            {product.productAvailable
                                                ? "Available"
                                                : "Unavailable"}
                                        </strong>

                                    </p>


                                    {/* ACTIONS */}

                                    <div
                                        className="d-flex gap-2"
                                    >

                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() =>
                                                navigate(
                                                    `/vendor/products/edit/${product.id}`
                                                )
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() =>
                                                handleDelete(
                                                    product.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};

export default VendorProducts;