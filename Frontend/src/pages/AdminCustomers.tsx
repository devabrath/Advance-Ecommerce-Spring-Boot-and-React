import React, { useEffect, useState } from "react";
import API from "../axios";

interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    enabled: boolean;
    createdAt: string;
}

interface CustomerForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
}

const emptyForm: CustomerForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
};

const ITEMS_PER_PAGE = 20;

const AdminCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [form, setForm] = useState<CustomerForm>(emptyForm);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get<Customer[]>("/admin/customers");
            setCustomers(data);
            setError("");
        } catch (err: any) {
            setError(err?.response?.data || "Unable to load customers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (customer: Customer) => {
        setEditingId(customer.id);
        setForm({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone || "",
            password: ""
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            editingId
                ? await API.put(`/admin/customers/${editingId}`, form)
                : await API.post("/admin/customers", form);

            closeForm();
            loadCustomers();
        } catch (err: any) {
            alert(err?.response?.data || "Unable to save customer.");
        }
    };

    const toggleStatus = async (customer: Customer) => {
        try {
            await API.patch(
                `/admin/customers/${customer.id}/status`,
                null,
                { params: { enabled: !customer.enabled } }
            );
            loadCustomers();
        } catch (err: any) {
            alert(err?.response?.data || "Unable to update status.");
        }
    };

    const filteredCustomers = customers.filter(customer =>
        [
            customer.firstName,
            customer.lastName,
            customer.email,
            customer.phone || ""
        ].join(" ").toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCustomers = filteredCustomers.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="admin-customers-page">
                <div className="customer-loading">Loading customers...</div>
            </div>
        );
    }

    return (
        <div className="admin-customers-page">

            <div className="customers-header">
                <div>
                    <h1>Manage Customers</h1>
                    <p>View and manage all customer accounts.</p>
                </div>

                <button className="customer-add-button" onClick={openAdd}>
                    + Add Customer
                </button>
            </div>

            {error && <div className="customer-error">{error}</div>}

            <div className="customer-toolbar">
                <input
                    placeholder="Search by name, email or phone..."
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />

                <span>
                    {filteredCustomers.length
                        ? `Showing ${startIndex + 1} - ${Math.min(
                            startIndex + ITEMS_PER_PAGE,
                            filteredCustomers.length
                        )} of ${filteredCustomers.length} customers`
                        : "Showing 0 customers"}
                </span>
            </div>

            <div className="customer-table-container">
                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedCustomers.map(customer => (
                            <tr key={customer.id}>
                                <td>#{customer.id}</td>
                                <td><strong>{customer.firstName} {customer.lastName}</strong></td>
                                <td>{customer.email}</td>
                                <td>{customer.phone || "-"}</td>

                                <td>
                                    <span className={`customer-status ${customer.enabled ? "active" : "disabled"}`}>
                                        {customer.enabled ? "Active" : "Disabled"}
                                    </span>
                                </td>

                                <td>
                                    {new Date(customer.createdAt).toLocaleDateString("en-IN")}
                                </td>

                                <td>
                                    <div className="customer-actions">
                                        <button onClick={() => setSelectedCustomer(customer)}>View</button>
                                        <button onClick={() => openEdit(customer)}>Edit</button>
                                        <button onClick={() => toggleStatus(customer)}>
                                            {customer.enabled ? "Disable" : "Enable"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {!paginatedCustomers.length && (
                            <tr>
                                <td colSpan={7} className="empty-customers">
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="customer-pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        ← Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={currentPage === page ? "active" : ""}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}

            {showForm && (
                <div className="customer-modal-overlay">
                    <div className="customer-modal">
                        <div className="customer-modal-header">
                            <h2>{editingId ? "Edit Customer" : "Add Customer"}</h2>
                            <button onClick={closeForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="customer-form-grid">
                                {(["firstName", "lastName", "email", "phone"] as const).map(name => (
                                    <input
                                        key={name}
                                        name={name}
                                        type={name === "email" ? "email" : "text"}
                                        placeholder={name.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                                        value={form[name]}
                                        onChange={handleChange}
                                        required={name !== "phone"}
                                    />
                                ))}
                            </div>

                            <input
                                name="password"
                                type="password"
                                placeholder={editingId ? "New Password (optional)" : "Password"}
                                value={form.password}
                                onChange={handleChange}
                                required={!editingId}
                            />

                            <div className="customer-form-actions">
                                <button type="button" onClick={closeForm}>Cancel</button>
                                <button type="submit">
                                    {editingId ? "Update Customer" : "Create Customer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedCustomer && (
                <div className="customer-modal-overlay">
                    <div className="customer-modal customer-details">
                        <div className="customer-modal-header">
                            <h2>Customer Details</h2>
                            <button onClick={() => setSelectedCustomer(null)}>×</button>
                        </div>

                        <div className="customer-detail-list">
                            {[
                                ["Customer ID", `#${selectedCustomer.id}`],
                                ["Name", `${selectedCustomer.firstName} ${selectedCustomer.lastName}`],
                                ["Email", selectedCustomer.email],
                                ["Phone", selectedCustomer.phone || "-"],
                                ["Status", selectedCustomer.enabled ? "Active" : "Disabled"],
                                ["Joined", new Date(selectedCustomer.createdAt).toLocaleString("en-IN")]
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <span>{label}</span>
                                    <strong>{value}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminCustomers;