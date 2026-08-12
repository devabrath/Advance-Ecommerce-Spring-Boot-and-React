import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../axios";

interface Product {
    id: number;
    name: string;
    description: string;
    brand: string;
    price: number;
    categoryId: number | null;
    categoryName: string | null;
    releaseDate: string | null;
    productAvailable: boolean;
    stockQuantity: number;
    imageName: string | null;
    imageType: string | null;
}

interface UpdateProductData {
    id: number | null;
    name: string;
    description: string;
    brand: string;
    price: number | string;
    categoryId: number | null;
    releaseDate: string;
    productAvailable: boolean;
    stockQuantity: number | string;
}

const UpdateProduct = () => {

    const { id } = useParams<{ id: string }>();

    const [product, setProduct] =
        useState<Product | null>(null);

    const [image, setImage] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState<string>("");

    const [updateProduct, setUpdateProduct] =
        useState<UpdateProductData>({
            id: null,
            name: "",
            description: "",
            brand: "",
            price: "",
            categoryId: null,
            releaseDate: "",
            productAvailable: false,
            stockQuantity: ""
        });

    useEffect(() => {

        const fetchProduct = async (): Promise<void> => {

            if (!id) {
                return;
            }

            try {

                const response =
                    await API.get<Product>(
                        `/product/${id}`
                    );

                const productData =
                    response.data;

                setProduct(productData);

                setUpdateProduct({
                    id: productData.id,
                    name: productData.name || "",
                    description:
                        productData.description ||
                        "",
                    brand:
                        productData.brand || "",
                    price:
                        productData.price,
                    categoryId:
                        productData.categoryId,
                    releaseDate:
                        productData.releaseDate ||
                        "",
                    productAvailable:
                        productData.productAvailable,
                    stockQuantity:
                        productData.stockQuantity
                });

                const responseImage =
                    await API.get(
                        `/product/${id}/image`,
                        {
                            responseType:
                                "blob"
                        }
                    );

                const imageFile =
                    await convertUrlToFile(
                        responseImage.data,
                        productData.imageName ||
                            `product-${id}.jpg`
                    );

                setImage(imageFile);

                const previewUrl =
                    URL.createObjectURL(
                        responseImage.data
                    );

                setImagePreview(
                    previewUrl
                );

            } catch (error) {

                console.error(
                    "Error fetching product:",
                    error
                );
            }
        };

        fetchProduct();

        return () => {

            if (imagePreview) {
                URL.revokeObjectURL(
                    imagePreview
                );
            }

        };

    }, [id]);

    const convertUrlToFile = async (
        blobData: Blob,
        fileName: string
    ): Promise<File> => {

        return new File(
            [blobData],
            fileName,
            {
                type: blobData.type
            }
        );
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        if (!id) {
            return;
        }

        try {

            console.log(
                "Image:",
                image
            );

            console.log(
                "Product:",
                updateProduct
            );

            const updatedProduct =
                new FormData();

            if (image) {

                updatedProduct.append(
                    "imageFile",
                    image
                );
            }

            updatedProduct.append(
                "product",
                new Blob(
                    [
                        JSON.stringify(
                            updateProduct
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                )
            );

            await API.put(
                `/product/${id}`,
                updatedProduct
            );

            console.log(
                "Product updated successfully"
            );

            alert(
                "Product updated successfully!"
            );

        } catch (error) {

            console.error(
                "Error updating product:",
                error
            );

            alert(
                "Failed to update product. Please try again."
            );
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ): void => {

        const {
            name,
            value
        } = e.target;

        setUpdateProduct(
            (previous) => ({
                ...previous,
                [name]:
                    name === "price" ||
                    name === "stockQuantity"
                        ? value
                        : value
            })
        );
    };

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {

        const file =
            e.target.files?.[0];

        if (!file) {
            return;
        }

        setImage(file);

        const previewUrl =
            URL.createObjectURL(file);

        setImagePreview(
            previewUrl
        );
    };

    if (!product) {

        return (
            <div
                className="text-center"
                style={{
                    padding: "10rem"
                }}
            >
                <h2>
                    Loading...
                </h2>
            </div>
        );
    }

    return (
        <div
            className="update-product-container"
        >

            <div
                className="center-container"
                style={{
                    marginTop: "7rem"
                }}
            >

                <h1>
                    Update Product
                </h1>

                <form
                    className="row g-3 pt-1"
                    onSubmit={handleSubmit}
                >

                    <div className="col-md-6">

                        <label className="form-label">
                            <h6>Name</h6>
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder={
                                product.name
                            }
                            value={
                                updateProduct.name
                            }
                            onChange={
                                handleChange
                            }
                            name="name"
                        />

                    </div>

                    <div className="col-md-6">

                        <label className="form-label">
                            <h6>Brand</h6>
                        </label>

                        <input
                            type="text"
                            name="brand"
                            className="form-control"
                            placeholder={
                                product.brand
                            }
                            value={
                                updateProduct.brand
                            }
                            onChange={
                                handleChange
                            }
                            id="brand"
                        />

                    </div>

                    <div className="col-12">

                        <label className="form-label">
                            <h6>
                                Description
                            </h6>
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder={
                                product.description
                            }
                            name="description"
                            onChange={
                                handleChange
                            }
                            value={
                                updateProduct.description
                            }
                            id="description"
                        />

                    </div>

                    <div className="col-5">

                        <label className="form-label">
                            <h6>Price</h6>
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            onChange={
                                handleChange
                            }
                            value={
                                updateProduct.price
                            }
                            placeholder={
                                String(
                                    product.price
                                )
                            }
                            name="price"
                            id="price"
                        />

                    </div>

                    <div className="col-md-6">

                        <label className="form-label">
                            <h6>
                                Category
                            </h6>
                        </label>

                        <select
                            className="form-select"
                            value={
                                updateProduct.categoryId ??
                                ""
                            }
                            onChange={
                                handleChange
                            }
                            name="categoryId"
                            id="categoryId"
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

                    <div className="col-md-4">

                        <label className="form-label">
                            <h6>
                                Stock Quantity
                            </h6>
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            onChange={
                                handleChange
                            }
                            placeholder={String(
                                product.stockQuantity
                            )}
                            value={
                                updateProduct.stockQuantity
                            }
                            name="stockQuantity"
                            id="stockQuantity"
                        />

                    </div>

                    <div className="col-md-8">

                        <label className="form-label">
                            <h6>Image</h6>
                        </label>

                        <img
                            src={
                                imagePreview ||
                                "Image unavailable"
                            }
                            alt={
                                product.imageName ||
                                product.name
                            }
                            style={{
                                width: "100%",
                                height: "180px",
                                objectFit:
                                    "cover",
                                padding: "5px",
                                margin: "0"
                            }}
                        />

                        <input
                            className="form-control"
                            type="file"
                            onChange={
                                handleImageChange
                            }
                            name="imageUrl"
                            id="imageUrl"
                            accept="image/*"
                        />

                    </div>

                    <div className="col-12">

                        <div className="form-check">

                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="productAvailable"
                                id="gridCheck"
                                checked={
                                    updateProduct.productAvailable
                                }
                                onChange={(
                                    e
                                ) =>
                                    setUpdateProduct(
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

export default UpdateProduct;