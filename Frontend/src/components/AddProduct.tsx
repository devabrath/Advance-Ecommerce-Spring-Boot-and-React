import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const AddProduct = () => {

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
        useState(false);


    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ): void => {

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
    ): void => {

        const file =
            e.target.files?.[0] ?? null;

        setImage(file);
    };


    const submitHandler = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        event.preventDefault();

        if (!image) {
            alert("Please select a product image");
            return;
        }

        if (!product.categoryId) {
            alert("Please select a category");
            return;
        }

        try {

            setLoading(true);

            const productRequest = {

                name: product.name,

                brand: product.brand,

                description: product.description,

                price: Number(product.price),

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
                "imageFile",
                image
            );


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


            const response =
                await API.post(
                    "/vendor/products",
                    formData
                );


            console.log(
                "Vendor product added:",
                response.data
            );


            alert(
                "Product added successfully!"
            );


            navigate(
                "/vendor/products"
            );


        } catch (error: any) {

            console.error(
                "Error adding vendor product:",
                error
            );

            const message =
                error?.response?.data;

            alert(
                typeof message === "string"
                    ? message
                    : "Error adding product"
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div
            className="container"
            style={{
                marginTop: "100px",
                marginBottom: "50px"
            }}
        >

            <div
                className="center-container"
            >

                <h2 className="mb-4">
                    Add Product
                </h2>


                <form
                    className="row g-3"
                    onSubmit={submitHandler}
                >


                    {/* NAME */}

                    <div className="col-md-6">

                        <label className="form-label">
                            Product Name
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Product Name"
                            onChange={
                                handleInputChange
                            }
                            value={
                                product.name
                            }
                            name="name"
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
                            placeholder="Brand"
                            value={
                                product.brand
                            }
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
                            className="form-control"
                            placeholder="Product description"
                            value={
                                product.description
                            }
                            name="description"
                            onChange={
                                handleInputChange
                            }
                            rows={3}
                        />

                    </div>


                    {/* PRICE */}

                    <div className="col-md-4">

                        <label className="form-label">
                            Price
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            placeholder="Eg: 69999"
                            onChange={
                                handleInputChange
                            }
                            value={
                                product.price
                            }
                            name="price"
                            min="0.01"
                            step="0.01"
                            required
                        />

                    </div>


                    {/* CATEGORY */}

                    <div className="col-md-4">

                        <label className="form-label">
                            Category
                        </label>

                        <select
                            className="form-select"
                            value={
                                product.categoryId
                            }
                            onChange={
                                handleInputChange
                            }
                            name="categoryId"
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
                            className="form-control"
                            placeholder="Stock"
                            onChange={
                                handleInputChange
                            }
                            value={
                                product.stockQuantity
                            }
                            name="stockQuantity"
                            min="0"
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
                            className="form-control"
                            value={
                                product.releaseDate
                            }
                            name="releaseDate"
                            onChange={
                                handleInputChange
                            }
                        />

                    </div>


                    {/* IMAGE */}

                    <div className="col-md-6">

                        <label className="form-label">
                            Product Image
                        </label>

                        <input
                            className="form-control"
                            type="file"
                            onChange={
                                handleImageChange
                            }
                            accept="image/*"
                            required
                        />

                    </div>


                    {/* AVAILABILITY */}

                    <div className="col-12">

                        <div className="form-check">

                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="productAvailable"
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


                    {/* BUTTON */}

                    <div className="col-12">

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >

                            {loading
                                ? "Adding..."
                                : "Add Product"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default AddProduct;