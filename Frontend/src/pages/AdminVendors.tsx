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

const ITEMS_PER_PAGE = 20;

const AdminVendors = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [form, setForm] = useState<VendorForm>(emptyForm);

    // Load vendors
    const loadVendors = async () => {
        try {
            setLoading(true);
            const response = await API.get<Vendor[]>("/admin/vendors");
            setVendors(response.data);
            setError("");
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data || "Unable to load vendors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, []);

    // Form change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Add vendor
    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    // Edit vendor
    const openEdit = (vendor: Vendor) => {
        setEditingId(vendor.vendorId);
        setForm({
            firstName: vendor.firstName,
            lastName: vendor.lastName,
            email: vendor.email,
            phone: vendor.phone || "",
            password: "",
            shopName: vendor.shopName,
            description: vendor.description || ""
        });
        setShowForm(true);
    };

    // Add or update
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingId) {
                await API.put(`/admin/vendors/${editingId}`, form);
            } else {
                await API.post("/admin/vendors", form);
            }

            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
            await loadVendors();
        } catch (err: any) {
            alert(err?.response?.data || "Unable to save vendor.");
        }
    };

    // Enable or disable
    const toggleStatus = async (vendor: Vendor) => {
        try {
            await API.patch(`/admin/vendors/${vendor.vendorId}/status`, null, {
                params: { active: !vendor.active }
            });
            await loadVendors();
        } catch (err: any) {
            alert(err?.response?.data || "Unable to update vendor status.");
        }
    };

    // Search vendors
    const filteredVendors = vendors.filter(vendor => {
        const text = `${vendor.firstName} ${vendor.lastName} ${vendor.email} ${vendor.phone || ""} ${vendor.shopName}`.toLowerCase();
        return text.includes(search.toLowerCase());
    });

    // Reset page on search
    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    // Pagination
    const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedVendors = filteredVendors.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Loading
    if (loading) {
        return (
            <div className="admin-customers-page">
                <div className="customer-loading">Loading vendors...</div>
            </div>
        );
    }

    return (
        <div className="admin-customers-page">
            {/* Header */}
            <div className="customers-header">
                <div>
                    <h1>Manage Vendors</h1>
                    <p>Manage vendor accounts and shops.</p>
                </div>
                <button className="customer-add-button" onClick={openAdd}>+ Add Vendor</button>
            </div>

            {/* Error */}
            {error && <div className="customer-error">{error}</div>}

            {/* Toolbar */}
            <div className="customer-toolbar">
                <input
                    type="text"
                    placeholder="Search vendor, shop, email or phone..."
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                />
                <span>
                    {filteredVendors.length === 0
                        ? "Showing 0 vendors"
                        : `Showing ${startIndex + 1} - ${Math.min(endIndex, filteredVendors.length)} of ${filteredVendors.length} vendors`}
                </span>
            </div>

            {/* Vendors table */}
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
                        {paginatedVendors.map(vendor => (
                            <tr key={vendor.vendorId}>
                                <td>#{vendor.vendorId}</td>
                                <td><strong>{vendor.shopName}</strong></td>
                                <td>{vendor.firstName} {vendor.lastName}</td>
                                <td>{vendor.email}</td>
                                <td>{vendor.phone || "-"}</td>
                                <td>
                                    <span className={vendor.active ? "customer-status active" : "customer-status disabled"}>
                                        {vendor.active ? "Active" : "Disabled"}
                                    </span>
                                </td>
                                <td>
                                    <div className="customer-actions">
                                        <button type="button" onClick={() => setSelectedVendor(vendor)}>View</button>
                                        <button type="button" onClick={() => openEdit(vendor)}>Edit</button>
                                        <button type="button" onClick={() => toggleStatus(vendor)}>
                                            {vendor.active ? "Disable" : "Enable"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {paginatedVendors.length === 0 && (
                            <tr>
                                <td colSpan={7} className="empty-customers">No vendors found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="customer-pagination">
                    <button
                        type="button"
                        className="pagination-button"
                        disabled={currentPage === 1}
                        onClick={() => goToPage(currentPage - 1)}
                    >
                        ← Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                        <button
                            key={page}
                            type="button"
                            className={currentPage === page ? "pagination-button active" : "pagination-button"}
                            onClick={() => goToPage(page)}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type="button"
                        className="pagination-button"
                        disabled={currentPage === totalPages}
                        onClick={() => goToPage(currentPage + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Add/Edit modal */}
            {showForm && (
                <div className="customer-modal-overlay">
                    <div className="customer-modal">
                        <div className="customer-modal-header">
                            <h2>{editingId ? "Edit Vendor" : "Add Vendor"}</h2>
                            <button type="button" onClick={() => setShowForm(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="customer-form-grid">
                                <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
                                <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
                                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                                <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
                            </div>

                            <input name="shopName" placeholder="Shop Name" value={form.shopName} onChange={handleChange} required />
                            <textarea name="description" placeholder="Shop Description" value={form.description} onChange={handleChange} rows={3} />
                            <input
                                name="password"
                                type="password"
                                placeholder={editingId ? "New Password (optional)" : "Password"}
                                value={form.password}
                                onChange={handleChange}
                                required={!editingId}
                            />

                            <div className="customer-form-actions">
                                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit">{editingId ? "Update Vendor" : "Create Vendor"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vendor details */}
            {selectedVendor && (
                <div className="customer-modal-overlay">
                    <div className="customer-modal">
                        <div className="customer-modal-header">
                            <h2>Vendor Details</h2>
                            <button type="button" onClick={() => setSelectedVendor(null)}>×</button>
                        </div>

                        <div className="customer-detail-list">
                            <div><span>Vendor ID</span><strong>#{selectedVendor.vendorId}</strong></div>
                            <div><span>Shop</span><strong>{selectedVendor.shopName}</strong></div>
                            <div><span>Owner</span><strong>{selectedVendor.firstName} {selectedVendor.lastName}</strong></div>
                            <div><span>Email</span><strong>{selectedVendor.email}</strong></div>
                            <div><span>Phone</span><strong>{selectedVendor.phone || "-"}</strong></div>
                            <div><span>Description</span><strong>{selectedVendor.description || "-"}</strong></div>
                            <div><span>Status</span><strong>{selectedVendor.active ? "Active" : "Disabled"}</strong></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;