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

const AdminCustomers = () => {

    const [customers, setCustomers] =
        useState<Customer[]>([]);

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

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [form, setForm] =
        useState<CustomerForm>(emptyForm);


    const loadCustomers = async () => {

        try {

            setLoading(true);

            const response =
                await API.get<Customer[]>(
                    "/admin/customers"
                );

            setCustomers(response.data);

            setError("");

        } catch (err: any) {

            console.error(err);

            setError(
                err?.response?.data ||
                "Unable to load customers."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadCustomers();

    }, []);


    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement
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
        customer: Customer
    ) => {

        setEditingId(customer.id);

        setForm({
            firstName:
                customer.firstName,

            lastName:
                customer.lastName,

            email:
                customer.email,

            phone:
                customer.phone || "",

            password: ""
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
                    `/admin/customers/${editingId}`,
                    form
                );

            } else {

                await API.post(
                    "/admin/customers",
                    form
                );
            }


            setShowForm(false);

            setEditingId(null);

            setForm(emptyForm);

            await loadCustomers();

        } catch (err: any) {

            alert(
                err?.response?.data ||
                "Unable to save customer."
            );
        }
    };


    const toggleStatus = async (
        customer: Customer
    ) => {

        try {

            await API.patch(
                `/admin/customers/${customer.id}/status`,
                null,
                {
                    params: {
                        enabled:
                            !customer.enabled
                    }
                }
            );

            await loadCustomers();

        } catch (err: any) {

            alert(
                err?.response?.data ||
                "Unable to update status."
            );
        }
    };


    const filteredCustomers =
        customers.filter(customer => {

            const text =
                `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone || ""}`
                    .toLowerCase();

            return text.includes(
                search.toLowerCase()
            );
        });


    return (

        <div className="admin-customers-page">

            {/* HEADER */}

            <div className="customers-header">

                <div>

                    <h1>
                        Manage Customers
                    </h1>

                    <p>
                        View and manage all customer
                        accounts.
                    </p>

                </div>

                <button
                    className="customer-add-button"
                    onClick={openAdd}
                >
                    + Add Customer
                </button>

            </div>


            {/* SEARCH */}

            <div className="customer-toolbar">

                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={search}
                    onChange={e =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <span>
                    {filteredCustomers.length}
                    {" "}
                    customers
                </span>

            </div>


            {/* ERROR */}

            {error && (

                <div className="customer-error">
                    {error}
                </div>
            )}


            {/* TABLE */}

            {loading ? (

                <div className="customer-loading">
                    Loading customers...
                </div>

            ) : (

                <div className="customer-table-container">

                    <table className="customer-table">

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Email
                                </th>

                                <th>
                                    Phone
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Joined
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredCustomers.map(
                                customer => (

                                    <tr
                                        key={
                                            customer.id
                                        }
                                    >

                                        <td>
                                            #
                                            {
                                                customer.id
                                            }
                                        </td>


                                        <td>

                                            <strong>
                                                {
                                                    customer.firstName
                                                }
                                                {" "}
                                                {
                                                    customer.lastName
                                                }
                                            </strong>

                                        </td>


                                        <td>
                                            {
                                                customer.email
                                            }
                                        </td>


                                        <td>
                                            {
                                                customer.phone
                                                    || "-"
                                            }
                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    customer.enabled
                                                        ? "customer-status active"
                                                        : "customer-status disabled"
                                                }
                                            >
                                                {
                                                    customer.enabled
                                                        ? "Active"
                                                        : "Disabled"
                                                }
                                            </span>

                                        </td>


                                        <td>

                                            {new Date(
                                                customer.createdAt
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}

                                        </td>


                                        <td>

                                            <div className="customer-actions">

                                                <button
                                                    onClick={() =>
                                                        setSelectedCustomer(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openEdit(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    {
                                                        customer.enabled
                                                            ? "Disable"
                                                            : "Enable"
                                                    }
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )}


                            {filteredCustomers.length === 0 && (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className="empty-customers"
                                    >
                                        No customers found.
                                    </td>

                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>
            )}


            {/* ADD / EDIT MODAL */}

            {showForm && (

                <div className="customer-modal-overlay">

                    <div className="customer-modal">

                        <div className="customer-modal-header">

                            <h2>
                                {
                                    editingId
                                        ? "Edit Customer"
                                        : "Add Customer"
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

                                <button
                                    type="submit"
                                >
                                    {
                                        editingId
                                            ? "Update Customer"
                                            : "Create Customer"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* VIEW MODAL */}

            {selectedCustomer && (

                <div className="customer-modal-overlay">

                    <div className="customer-modal customer-details">

                        <div className="customer-modal-header">

                            <h2>
                                Customer Details
                            </h2>

                            <button
                                onClick={() =>
                                    setSelectedCustomer(
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
                                    Customer ID
                                </span>

                                <strong>
                                    #
                                    {
                                        selectedCustomer.id
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Name
                                </span>

                                <strong>
                                    {
                                        selectedCustomer.firstName
                                    }
                                    {" "}
                                    {
                                        selectedCustomer.lastName
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {
                                        selectedCustomer.email
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {
                                        selectedCustomer.phone
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
                                        selectedCustomer.enabled
                                            ? "Active"
                                            : "Disabled"
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Joined
                                </span>

                                <strong>
                                    {new Date(
                                        selectedCustomer.createdAt
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminCustomers;