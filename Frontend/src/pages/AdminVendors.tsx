import React, { useEffect, useState } from "react";
import API from "../axios";

interface Vendor {
    vendorId: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    shopName: string;
    description?: string;
    active: boolean;
}

interface VendorForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    shopName: string;
    description: string;
}

const emptyForm: VendorForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    shopName: "",
    description: ""
};

const AdminVendors = () => {

    const [vendors, setVendors] =
        useState<Vendor[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [selectedVendor, setSelectedVendor] =
        useState<Vendor | null>(null);

    const [form, setForm] =
        useState<VendorForm>(emptyForm);


    const loadVendors = async () => {

        try {

            setLoading(true);

            const response =
                await API.get<Vendor[]>(
                    "/admin/vendors"
                );

            setVendors(response.data);

            setError("");

        } catch (err: any) {

            console.error(err);

            setError(
                err?.response?.data ||
                "Unable to load vendors."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadVendors();

    }, []);


    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };


    const openAdd = () => {

        setEditingId(null);

        setForm(emptyForm);

        setShowForm(true);
    };


    const openEdit = (
        vendor: Vendor
    ) => {

        setEditingId(
            vendor.vendorId
        );

        setForm({

            firstName:
                vendor.firstName,

            lastName:
                vendor.lastName,

            email:
                vendor.email,

            phone:
                vendor.phone || "",

            password: "",

            shopName:
                vendor.shopName,

            description:
                vendor.description || ""
        });

        setShowForm(true);
    };


    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        try {

            if (editingId) {

                await API.put(
                    `/admin/vendors/${editingId}`,
                    form
                );

            } else {

                await API.post(
                    "/admin/vendors",
                    form
                );
            }


            setShowForm(false);

            setEditingId(null);

            setForm(emptyForm);

            await loadVendors();

        } catch (err: any) {

            alert(
                err?.response?.data ||
                "Unable to save vendor."
            );
        }
    };


    const toggleStatus = async (
        vendor: Vendor
    ) => {

        try {

            await API.patch(
                `/admin/vendors/${vendor.vendorId}/status`,
                null,
                {
                    params: {
                        active:
                            !vendor.active
                    }
                }
            );

            await loadVendors();

        } catch (err: any) {

            alert(
                err?.response?.data ||
                "Unable to update vendor status."
            );
        }
    };


    const filteredVendors =
        vendors.filter(vendor => {

            const text =
                `${vendor.firstName}
                ${vendor.lastName}
                ${vendor.email}
                ${vendor.phone || ""}
                ${vendor.shopName}`
                    .toLowerCase();

            return text.includes(
                search.toLowerCase()
            );
        });


    return (

        <div className="admin-customers-page">

            <div className="customers-header">

                <div>

                    <h1>
                        Manage Vendors
                    </h1>

                    <p>
                        Manage vendor accounts and
                        shops.
                    </p>

                </div>

                <button
                    className="customer-add-button"
                    onClick={openAdd}
                >
                    + Add Vendor
                </button>

            </div>


            <div className="customer-toolbar">

                <input
                    type="text"
                    placeholder="Search vendor, shop, email or phone..."
                    value={search}
                    onChange={e =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <span>
                    {filteredVendors.length}
                    {" "}
                    vendors
                </span>

            </div>


            {error && (

                <div className="customer-error">
                    {error}
                </div>

            )}


            {loading ? (

                <div className="customer-loading">
                    Loading vendors...
                </div>

            ) : (

                <div className="customer-table-container">

                    <table className="customer-table">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Shop</th>

                                <th>Owner</th>

                                <th>Email</th>

                                <th>Phone</th>

                                <th>Status</th>

                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredVendors.map(
                                vendor => (

                                    <tr
                                        key={
                                            vendor.vendorId
                                        }
                                    >

                                        <td>
                                            #
                                            {
                                                vendor.vendorId
                                            }
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    vendor.shopName
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                vendor.firstName
                                            }
                                            {" "}
                                            {
                                                vendor.lastName
                                            }
                                        </td>

                                        <td>
                                            {
                                                vendor.email
                                            }
                                        </td>

                                        <td>
                                            {
                                                vendor.phone
                                                    || "-"
                                            }
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    vendor.active
                                                        ? "customer-status active"
                                                        : "customer-status disabled"
                                                }
                                            >
                                                {
                                                    vendor.active
                                                        ? "Active"
                                                        : "Disabled"
                                                }
                                            </span>

                                        </td>

                                        <td>

                                            <div className="customer-actions">

                                                <button
                                                    onClick={() =>
                                                        setSelectedVendor(
                                                            vendor
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openEdit(
                                                            vendor
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            vendor
                                                        )
                                                    }
                                                >
                                                    {
                                                        vendor.active
                                                            ? "Disable"
                                                            : "Enable"
                                                    }
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )}


                            {filteredVendors.length === 0 && (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className="empty-customers"
                                    >
                                        No vendors found.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>
            )}


            {/* ADD / EDIT */}

            {showForm && (

                <div className="customer-modal-overlay">

                    <div className="customer-modal">

                        <div className="customer-modal-header">

                            <h2>
                                {
                                    editingId
                                        ? "Edit Vendor"
                                        : "Add Vendor"
                                }
                            </h2>

                            <button
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="customer-form-grid">

                                <input
                                    name="firstName"
                                    placeholder="First Name"
                                    value={
                                        form.firstName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                                <input
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={
                                        form.lastName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                                <input
                                    name="phone"
                                    placeholder="Phone"
                                    value={
                                        form.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            <input
                                name="shopName"
                                placeholder="Shop Name"
                                value={
                                    form.shopName
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />


                            <textarea
                                name="description"
                                placeholder="Shop Description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows={3}
                            />


                            <input
                                name="password"
                                type="password"
                                placeholder={
                                    editingId
                                        ? "New Password (optional)"
                                        : "Password"
                                }
                                value={
                                    form.password
                                }
                                onChange={
                                    handleChange
                                }
                                required={
                                    !editingId
                                }
                            />


                            <div className="customer-form-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button type="submit">

                                    {
                                        editingId
                                            ? "Update Vendor"
                                            : "Create Vendor"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* VIEW */}

            {selectedVendor && (

                <div className="customer-modal-overlay">

                    <div className="customer-modal">

                        <div className="customer-modal-header">

                            <h2>
                                Vendor Details
                            </h2>

                            <button
                                onClick={() =>
                                    setSelectedVendor(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="customer-detail-list">

                            <div>
                                <span>
                                    Vendor ID
                                </span>

                                <strong>
                                    #
                                    {
                                        selectedVendor.vendorId
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Shop
                                </span>

                                <strong>
                                    {
                                        selectedVendor.shopName
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Owner
                                </span>

                                <strong>
                                    {
                                        selectedVendor.firstName
                                    }
                                    {" "}
                                    {
                                        selectedVendor.lastName
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {
                                        selectedVendor.email
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {
                                        selectedVendor.phone
                                            || "-"
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Description
                                </span>

                                <strong>
                                    {
                                        selectedVendor.description
                                            || "-"
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Status
                                </span>

                                <strong>
                                    {
                                        selectedVendor.active
                                            ? "Active"
                                            : "Disabled"
                                    }
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminVendors;