import React, { useState } from "react";
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

    const [product, setProduct] =
        useState<ProductForm>({
            name: "",
            brand: "",
            description: "",
            price: "",
            categoryId: "",
            stockQuantity: "",
            releaseDate: "",
            productAvailable: false
        });

    const [image, setImage] =
        useState<File | null>(null);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ): void => {

        const {
            name,
            value
        } = e.target;

        setProduct((previous) => ({
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

        try {

            if (!image) {
                alert("Please select a product image");
                return;
            }

            if (!product.categoryId) {
                alert("Please select a category");
                return;
            }

            const productRequest = {
                name: product.name,
                brand: product.brand,
                description: product.description,
                price: Number(product.price),
                categoryId: Number(product.categoryId),
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
                    "/admin/products",
                    formData
                );

            console.log(
                "Product added successfully:",
                response.data
            );

            alert(
                "Product added successfully"
            );

            setProduct({
                name: "",
                brand: "",
                description: "",
                price: "",
                categoryId: "",
                stockQuantity: "",
                releaseDate: "",
                productAvailable: false
            });

            setImage(null);

        } catch (error) {

            console.error(
                "Error adding product:",
                error
            );

            alert(
                "Error adding product"
            );
        }
    };

    return (
        <div className="container">

            <div className="center-container">

                <form
                    className="row g-3 pt-5"
                    onSubmit={submitHandler}
                >

                    {/* Name */}
                    <div className="col-md-6">

                        <label className="form-label">
                            <h6>Name</h6>
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

                    {/* Brand */}
                    <div className="col-md-6">

                        <label className="form-label">
                            <h6>Brand</h6>
                        </label>

                        <input
                            type="text"
                            name="brand"
                            className="form-control"
                            placeholder="Enter your Brand"
                            value={
                                product.brand
                            }
                            onChange={
                                handleInputChange
                            }
                            id="brand"
                        />

                    </div>

                    {/* Description */}
                    <div className="col-12">

                        <label className="form-label">
                            <h6>
                                Description
                            </h6>
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Add product description"
                            value={
                                product.description
                            }
                            name="description"
                            onChange={
                                handleInputChange
                            }
                            id="description"
                        />

                    </div>

                    {/* Price */}
                    <div className="col-5">

                        <label className="form-label">
                            <h6>Price</h6>
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            placeholder="Eg: 1000"
                            onChange={
                                handleInputChange
                            }
                            value={
                                product.price
                            }
                            name="price"
                            id="price"
                            min="0"
                            step="0.01"
                            required
                        />

                    </div>

                    {/* Category */}
                    <div className="col-md-6">

                        <label className="form-label">
                            <h6>
                                Category
                            </h6>
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
                            id="categoryId"
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

                    {/* Stock */}
                    <div className="col-md-4">

                        <label className="form-label">
                            <h6>
                                Stock Quantity
                            </h6>
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            placeholder="Stock Remaining"
                            onChange={
                                handleInputChange
                            }
                            value={
                                product.stockQuantity
                            }
                            name="stockQuantity"
                            id="stockQuantity"
                            min="0"
                            required
                        />

                    </div>

                    {/* Release Date */}
                    <div className="col-md-4">

                        <label className="form-label">
                            <h6>
                                Release Date
                            </h6>
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
                            id="releaseDate"
                        />

                    </div>

                    {/* Image */}
                    <div className="col-md-4">

                        <label className="form-label">
                            <h6>Image</h6>
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

                    {/* Availability */}
                    <div className="col-12">

                        <div className="form-check">

                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="productAvailable"
                                id="gridCheck"
                                checked={
                                    product.productAvailable
                                }
                                onChange={(
                                    e
                                ) =>
                                    setProduct(
                                        (
                                            previous
                                        ) => ({
                                            ...previous,
                                            productAvailable:
                                                e
                                                    .target
                                                    .checked
                                        })
                                    )
                                }
                            />

                            <label
                                className="form-check-label"
                                htmlFor="gridCheck"
                            >
                                Product Available
                            </label>

                        </div>

                    </div>

                    {/* Submit */}
                    <div className="col-12">

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Submit
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default AddProduct;