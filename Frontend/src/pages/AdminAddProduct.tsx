import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

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

    const navigate =
        useNavigate();


    // =====================================================
    // FORM STATE
    // =====================================================

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


    // =====================================================
    // DATA STATE
    // =====================================================

    const [vendors, setVendors] =
        useState<Vendor[]>([]);

    const [categories, setCategories] =
        useState<Category[]>([]);


    // =====================================================
    // PAGE STATE
    // =====================================================

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD VENDORS + CATEGORIES
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);

                setError("");


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


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        setError("");


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!name.trim()) {

            setError(
                "Please enter a product name."
            );

            return;
        }


        if (!price || Number(price) <= 0) {

            setError(
                "Please enter a valid price."
            );

            return;
        }


        if (
            !stockQuantity ||
            Number(stockQuantity) < 0
        ) {

            setError(
                "Please enter a valid stock quantity."
            );

            return;
        }


        if (!categoryId) {

            setError(
                "Please select a category."
            );

            return;
        }


        if (!vendorId) {

            setError(
                "Please select a vendor."
            );

            return;
        }


        try {

            setSaving(true);


            const product = {

                name:
                    name.trim(),

                description:
                    description.trim(),

                brand:
                    brand.trim(),

                price:
                    Number(price),

                categoryId:
                    Number(categoryId),

                vendorId:
                    Number(vendorId),

                stockQuantity:
                    Number(stockQuantity),

                releaseDate:
                    releaseDate
                        ? `${releaseDate}T00:00:00`
                        : null,

                productAvailable

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


            navigate(
                "/admin/products"
            );


        } catch (err: any) {

            console.error(
                "Add product error:",
                err
            );


            const responseData =
                err?.response?.data;


            setError(

                typeof responseData ===
                "string"

                    ? responseData

                    : "Unable to add product."

            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-customers-page">

                <div className="customer-loading">

                    Loading product form...

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-customers-page">


            {/* ============================================= */}
            {/* HEADER */}
            {/* ============================================= */}

            <div className="customers-header">

                <div>

                    <h1>
                        Add Product
                    </h1>

                    <p>
                        Add a new product to Dunique.
                    </p>

                </div>


                <button
                    type="button"
                    className="customer-add-button"
                    onClick={() =>
                        navigate(
                            "/admin/products"
                        )
                    }
                >
                    ← Back to Products
                </button>

            </div>


            {/* ============================================= */}
            {/* ERROR */}
            {/* ============================================= */}

            {error && (

                <div className="customer-error">

                    {error}

                </div>

            )}


            {/* ============================================= */}
            {/* FORM */}
            {/* ============================================= */}

            <div className="admin-product-form-card">

                <div className="admin-product-form-header">

                    <div>

                        <h2>
                            Product Information
                        </h2>

                        <p>
                            Enter the details for the
                            new product.
                        </p>

                    </div>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="admin-product-form"
                >


                    {/* ========================================= */}
                    {/* BASIC INFORMATION */}
                    {/* ========================================= */}

                    <div className="admin-form-section">

                        <h3>
                            Basic Information
                        </h3>


                        <div className="admin-form-grid">


                            {/* PRODUCT NAME */}

                            <div className="admin-form-field">

                                <label>
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter product name"
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

                            <div className="admin-form-field">

                                <label>
                                    Brand
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter brand name"
                                    value={brand}
                                    onChange={e =>
                                        setBrand(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="admin-form-field">

                            <label>
                                Description
                            </label>

                            <textarea
                                rows={5}
                                placeholder="Describe the product..."
                                value={description}
                                onChange={e =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {/* ========================================= */}
                    {/* PRICE + STOCK */}
                    {/* ========================================= */}

                    <div className="admin-form-section">

                        <h3>
                            Pricing & Inventory
                        </h3>


                        <div className="admin-form-grid admin-form-grid-three">


                            {/* PRICE */}

                            <div className="admin-form-field">

                                <label>
                                    Price (₹)
                                </label>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
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

                            <div className="admin-form-field">

                                <label>
                                    Stock Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="0"
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

                            <div className="admin-form-field">

                                <label>
                                    Release Date
                                </label>

                                <input
                                    type="date"
                                    value={releaseDate}
                                    onChange={e =>
                                        setReleaseDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    {/* ========================================= */}
                    {/* CATEGORY + VENDOR */}
                    {/* ========================================= */}

                    <div className="admin-form-section">

                        <h3>
                            Classification
                        </h3>


                        <div className="admin-form-grid">


                            {/* CATEGORY */}

                            <div className="admin-form-field">

                                <label>
                                    Category
                                </label>

                                <select
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

                            <div className="admin-form-field">

                                <label>
                                    Vendor
                                </label>

                                <select
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

                                                {" — "}

                                                {
                                                    vendor.email
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                    </div>


                    {/* ========================================= */}
                    {/* IMAGE + AVAILABILITY */}
                    {/* ========================================= */}

                    <div className="admin-form-section">

                        <h3>
                            Product Media & Status
                        </h3>


                        {/* IMAGE */}

                        <div className="admin-form-field">

                            <label>
                                Product Image
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={e =>
                                    setImageFile(
                                        e.target.files?.[0] ||
                                        null
                                    )
                                }
                            />

                            <small>
                                Upload an image for this
                                product.
                            </small>

                        </div>


                        {/* AVAILABILITY */}

                        <label
                            className="admin-checkbox-row"
                        >

                            <input
                                type="checkbox"
                                checked={
                                    productAvailable
                                }
                                onChange={e =>
                                    setProductAvailable(
                                        e.target.checked
                                    )
                                }
                            />

                            <span>

                                <strong>
                                    Product Available
                                </strong>

                                <small>
                                    Customers can purchase
                                    this product when enabled.
                                </small>

                            </span>

                        </label>

                    </div>


                    {/* ========================================= */}
                    {/* ACTIONS */}
                    {/* ========================================= */}

                    <div className="admin-form-actions">

                        <button
                            type="button"
                            className="admin-form-cancel-button"
                            onClick={() =>
                                navigate(
                                    "/admin/products"
                                )
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="admin-form-submit-button"
                            disabled={saving}
                        >

                            {saving
                                ? "Adding Product..."
                                : "Add Product"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default AdminAddProduct;