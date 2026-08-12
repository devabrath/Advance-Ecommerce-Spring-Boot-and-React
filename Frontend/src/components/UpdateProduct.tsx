import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../axios";

interface ProductForm {
    name: string;
    brand: string;
    description: string;
    price: string;
    categoryId: string;
    stockQuantity: string;
    releaseDate: string;
    productAvailable: boolean;
}

interface ProductResponse {
    id: number;
    name: string;
    description: string;
    brand: string;
    price: number;
    categoryId: number | null;
    releaseDate: string | null;
    productAvailable: boolean;
    stockQuantity: number;
    imageName: string | null;
}

const UpdateProduct = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] =
        useState<ProductForm>({
            name: "",
            brand: "",
            description: "",
            price: "",
            categoryId: "",
            stockQuantity: "",
            releaseDate: "",
            productAvailable: true
        });

    const [image, setImage] =
        useState<File | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    /*
     * Load the vendor's product.
     */
    useEffect(() => {

        const fetchProduct = async () => {

            if (!id) {
                setError("Product ID is missing.");
                setLoading(false);
                return;
            }

            try {

                setLoading(true);

                /*
                 * IMPORTANT:
                 * This endpoint returns only the
                 * logged-in vendor's products.
                 */
                const response =
                    await API.get<ProductResponse>(
                        `/product/${id}`
                    );

                const data =
                    response.data;

                setProduct({
                    name: data.name || "",
                    brand: data.brand || "",
                    description:
                        data.description || "",
                    price:
                        String(data.price ?? ""),
                    categoryId:
                        data.categoryId
                            ? String(data.categoryId)
                            : "",
                    stockQuantity:
                        String(
                            data.stockQuantity ?? 0
                        ),
                    releaseDate:
                        data.releaseDate
                            ? data.releaseDate.substring(
                                  0,
                                  10
                              )
                            : "",
                    productAvailable:
                        data.productAvailable
                });

            } catch (err: any) {

                console.error(
                    "Error loading product:",
                    err
                );

                setError(
                    err?.response?.data ||
                    "Unable to load product."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchProduct();

    }, [id]);


    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >
    ) => {

        const {
            name,
            value
        } = e.target;

        setProduct(previous => ({
            ...previous,
            [name]: value
        }));
    };


    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file =
            e.target.files?.[0] ?? null;

        setImage(file);
    };


    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        if (!id) {
            alert("Product ID is missing.");
            return;
        }

        try {

            setSaving(true);

            const productRequest = {

                name:
                    product.name,

                brand:
                    product.brand,

                description:
                    product.description,

                price:
                    Number(product.price),

                categoryId:
                    Number(product.categoryId),

                stockQuantity:
                    Number(product.stockQuantity),

                releaseDate:
                    product.releaseDate
                        ? `${product.releaseDate}T00:00:00`
                        : null,

                productAvailable:
                    product.productAvailable
            };


            const formData =
                new FormData();


            formData.append(
                "product",
                new Blob(
                    [
                        JSON.stringify(
                            productRequest
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                )
            );


            if (image) {

                formData.append(
                    "imageFile",
                    image
                );
            }


            /*
             * IMPORTANT:
             *
             * Vendor update endpoint.
             *
             * NOT:
             * /product/{id}
             *
             * NOT:
             * /admin/products/{id}
             */
            await API.put(
                `/vendor/products/${id}`,
                formData
            );


            alert(
                "Product updated successfully!"
            );


            navigate(
                "/vendor/products"
            );

        } catch (err: any) {

            console.error(
                "Error updating product:",
                err
            );

            const message =
                err?.response?.data;

            alert(
                typeof message === "string"
                    ? message
                    : "Unable to update product."
            );

        } finally {

            setSaving(false);
        }
    };


    if (loading) {

        return (
            <div
                className="container"
                style={{
                    marginTop: "100px"
                }}
            >
                <h3>
                    Loading product...
                </h3>
            </div>
        );
    }


    if (error) {

        return (
            <div
                className="container"
                style={{
                    marginTop: "100px"
                }}
            >

                <div className="alert alert-danger">
                    {error}
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate(
                            "/vendor/products"
                        )
                    }
                >
                    Back to My Products
                </button>

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

            <div className="mb-4">

                <h2>
                    Edit Product
                </h2>

                <p className="text-muted">
                    Update your product information.
                </p>

            </div>


            <form
                className="row g-3"
                onSubmit={handleSubmit}
            >

                {/* NAME */}

                <div className="col-md-6">

                    <label className="form-label">
                        Product Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={product.name}
                        onChange={
                            handleInputChange
                        }
                        required
                    />

                </div>


                {/* BRAND */}

                <div className="col-md-6">

                    <label className="form-label">
                        Brand
                    </label>

                    <input
                        type="text"
                        name="brand"
                        className="form-control"
                        value={product.brand}
                        onChange={
                            handleInputChange
                        }
                    />

                </div>


                {/* DESCRIPTION */}

                <div className="col-12">

                    <label className="form-label">
                        Description
                    </label>

                    <textarea
                        name="description"
                        className="form-control"
                        rows={4}
                        value={
                            product.description
                        }
                        onChange={
                            handleInputChange
                        }
                    />

                </div>


                {/* PRICE */}

                <div className="col-md-4">

                    <label className="form-label">
                        Price
                    </label>

                    <input
                        type="number"
                        name="price"
                        className="form-control"
                        min="0.01"
                        step="0.01"
                        value={product.price}
                        onChange={
                            handleInputChange
                        }
                        required
                    />

                </div>


                {/* CATEGORY */}

                <div className="col-md-4">

                    <label className="form-label">
                        Category
                    </label>

                    <select
                        name="categoryId"
                        className="form-select"
                        value={
                            product.categoryId
                        }
                        onChange={
                            handleInputChange
                        }
                        required
                    >

                        <option value="">
                            Select category
                        </option>

                        <option value="1">
                            Laptop
                        </option>

                        <option value="2">
                            Headphone
                        </option>

                        <option value="3">
                            Mobile
                        </option>

                        <option value="4">
                            Electronics
                        </option>

                        <option value="5">
                            Toys
                        </option>

                        <option value="6">
                            Fashion
                        </option>

                    </select>

                </div>


                {/* STOCK */}

                <div className="col-md-4">

                    <label className="form-label">
                        Stock Quantity
                    </label>

                    <input
                        type="number"
                        name="stockQuantity"
                        className="form-control"
                        min="0"
                        value={
                            product.stockQuantity
                        }
                        onChange={
                            handleInputChange
                        }
                        required
                    />

                </div>


                {/* RELEASE DATE */}

                <div className="col-md-6">

                    <label className="form-label">
                        Release Date
                    </label>

                    <input
                        type="date"
                        name="releaseDate"
                        className="form-control"
                        value={
                            product.releaseDate
                        }
                        onChange={
                            handleInputChange
                        }
                    />

                </div>


                {/* IMAGE */}

                <div className="col-md-6">

                    <label className="form-label">
                        Replace Product Image
                    </label>

                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={
                            handleImageChange
                        }
                    />

                    <small className="text-muted">
                        Leave empty to keep the existing image.
                    </small>

                </div>


                {/* AVAILABILITY */}

                <div className="col-12">

                    <div className="form-check">

                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="productAvailable"
                            checked={
                                product.productAvailable
                            }
                            onChange={e =>
                                setProduct(
                                    previous => ({
                                        ...previous,
                                        productAvailable:
                                            e.target.checked
                                    })
                                )
                            }
                        />

                        <label
                            className="form-check-label"
                            htmlFor="productAvailable"
                        >
                            Product Available
                        </label>

                    </div>

                </div>


                {/* BUTTONS */}

                <div className="col-12 d-flex gap-2">

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >

                        {saving
                            ? "Saving..."
                            : "Update Product"}

                    </button>


                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate(
                                "/vendor/products"
                            )
                        }
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    );
};

export default UpdateProduct;