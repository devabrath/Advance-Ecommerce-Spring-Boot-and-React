import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios";

interface Vendor {
    id: number;
    shopName: string;
    email: string;
}

interface Category {
    id: number;
    name: string;
}

const AdminAddProduct = () => {

    const navigate = useNavigate();

    const [name, setName] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [brand, setBrand] =
        useState("");

    const [price, setPrice] =
        useState("");

    const [categoryId, setCategoryId] =
        useState("");

    const [vendorId, setVendorId] =
        useState("");

    const [stockQuantity, setStockQuantity] =
        useState("");

    const [releaseDate, setReleaseDate] =
        useState("");

    const [productAvailable, setProductAvailable] =
        useState(true);

    const [imageFile, setImageFile] =
        useState<File | null>(null);

    const [vendors, setVendors] =
        useState<Vendor[]>([]);

    const [categories, setCategories] =
        useState<Category[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    /*
     * Load vendors + categories
     */
    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);

                const [
                    vendorsResponse,
                    categoriesResponse
                ] = await Promise.all([

                    API.get<Vendor[]>(
                        "/admin/vendors"
                    ),

                    API.get<Category[]>(
                        "/admin/categories"
                    )

                ]);


                setVendors(
                    vendorsResponse.data
                );

                setCategories(
                    categoriesResponse.data
                );

                setError("");

            } catch (err: any) {

                console.error(
                    "Admin product form error:",
                    err
                );

                setError(
                    err?.response?.data ||
                    "Unable to load vendors or categories."
                );

            } finally {

                setLoading(false);
            }
        };


        loadData();

    }, []);


    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        setError("");


        if (!vendorId) {

            setError(
                "Please select a vendor."
            );

            return;
        }


        if (!categoryId) {

            setError(
                "Please select a category."
            );

            return;
        }


        try {

            setSaving(true);


            const product = {

                name,

                description,

                brand,

                price:
                    Number(price),

                categoryId:
                    Number(categoryId),

                vendorId:
                    Number(vendorId),

                releaseDate:
                    releaseDate
                        ? `${releaseDate}T00:00:00`
                        : null,

                productAvailable,

                stockQuantity:
                    Number(stockQuantity)

            };


            const formData =
                new FormData();


            formData.append(
                "product",
                new Blob(
                    [
                        JSON.stringify(
                            product
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                )
            );


            if (imageFile) {

                formData.append(
                    "imageFile",
                    imageFile
                );
            }


            await API.post(
                "/admin/products",
                formData
            );


            alert(
                "Product added successfully!"
            );


            navigate(
                "/admin/products"
            );


        } catch (err: any) {

            console.error(
                "Add admin product error:",
                err
            );

            const responseData =
                err?.response?.data;

            setError(
                typeof responseData === "string"
                    ? responseData
                    : "Unable to add product."
            );

        } finally {

            setSaving(false);
        }
    };


    if (loading) {

        return (

            <div className="admin-page">

                <h1>
                    Add Product
                </h1>

                <p>
                    Loading form...
                </p>

            </div>
        );
    }


    return (

        <div className="admin-page">

            <div
                className="admin-page-header"
            >

                <div>

                    <h1>
                        Add Product
                    </h1>

                    <p>
                        Add a new product to Dunique.
                    </p>

                </div>

            </div>


            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            <div className="card shadow-sm" style={{width: "auto"}}>

                <div className="card-body">

                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="row g-3">


                            {/* PRODUCT NAME */}

                            <div className="col-md-6">

                                <label className="form-label">
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    onChange={e =>
                                        setName(
                                            e.target.value
                                        )
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
                                    className="form-control"
                                    value={brand}
                                    onChange={e =>
                                        setBrand(
                                            e.target.value
                                        )
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
                                    rows={4}
                                    value={description}
                                    onChange={e =>
                                        setDescription(
                                            e.target.value
                                        )
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
                                    className="form-control"
                                    min="0.01"
                                    step="0.01"
                                    value={price}
                                    onChange={e =>
                                        setPrice(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            {/* STOCK */}

                            <div className="col-md-4">

                                <label className="form-label">
                                    Stock Quantity
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    value={stockQuantity}
                                    onChange={e =>
                                        setStockQuantity(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            {/* RELEASE DATE */}

                            <div className="col-md-4">

                                <label className="form-label">
                                    Release Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    value={releaseDate}
                                    onChange={e =>
                                        setReleaseDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* CATEGORY */}

                            <div className="col-md-6">

                                <label className="form-label">
                                    Category
                                </label>

                                <select
                                    className="form-select"
                                    value={categoryId}
                                    onChange={e =>
                                        setCategoryId(
                                            e.target.value
                                        )
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    {categories.map(
                                        category => (

                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* VENDOR */}

                            <div className="col-md-6">

                                <label className="form-label">
                                    Vendor
                                </label>

                                <select
                                    className="form-select"
                                    value={vendorId}
                                    onChange={e =>
                                        setVendorId(
                                            e.target.value
                                        )
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Vendor
                                    </option>

                                    {vendors.map(
                                        vendor => (

                                            <option
                                                key={
                                                    vendor.id
                                                }
                                                value={
                                                    vendor.id
                                                }
                                            >

                                                {
                                                    vendor.shopName
                                                }

                                                {" - "}

                                                {
                                                    vendor.email
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* IMAGE */}

                            <div className="col-12">

                                <label className="form-label">
                                    Product Image
                                </label>

                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={e =>
                                        setImageFile(
                                            e.target.files?.[0] ||
                                            null
                                        )
                                    }
                                />

                            </div>


                            {/* AVAILABILITY */}

                            <div className="col-12">

                                <div className="form-check">

                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="productAvailable"
                                        checked={
                                            productAvailable
                                        }
                                        onChange={e =>
                                            setProductAvailable(
                                                e.target.checked
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

                            <div
                                className="col-12 d-flex gap-2 mt-4"
                            >

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Adding Product..."
                                        : "Add Product"}

                                </button>


                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        navigate(
                                            "/admin/products"
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default AdminAddProduct;