import React, { useEffect, useState } from "react";
import API from "../axios";

interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    enabled: boolean;
}

const AdminCustomers = () => {

    const [customers, setCustomers] =
        useState<Customer[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchCustomers = async () => {

            try {

                const response =
                    await API.get<Customer[]>(
                        "/admin/customers"
                    );

                setCustomers(response.data);

            } catch (err: any) {

                console.error(
                    "Admin customers error:",
                    err
                );

                setError(
                    err?.response?.data ||
                    "Unable to load customers."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchCustomers();

    }, []);


    if (loading) {
        return (
            <div className="admin-page">
                <h1>Customers</h1>
                <p>Loading customers...</p>
            </div>
        );
    }


    return (
        <div className="admin-page">

            <div className="admin-page-header">

                <div>
                    <h1>Customers</h1>

                    <p>
                        Manage Dunique customers.
                    </p>
                </div>

            </div>


            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}


            <div className="card shadow-sm" style={{width: "auto"}}>

                <div className="table-responsive">

                    <table className="table table-hover mb-0">

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                            </tr>

                        </thead>

                        <tbody>

                            {customers.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={5}
                                        className="text-center py-4"
                                    >
                                        No customers found.
                                    </td>

                                </tr>

                            ) : (

                                customers.map(customer => (

                                    <tr
                                        key={customer.id}
                                    >

                                        <td>
                                            {customer.id}
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    customer.firstName
                                                }{" "}
                                                {
                                                    customer.lastName
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {customer.email}
                                        </td>

                                        <td>
                                            {customer.phone || "-"}
                                        </td>

                                        <td>

                                            {customer.enabled ? (

                                                <span className="badge bg-success">
                                                    Active
                                                </span>

                                            ) : (

                                                <span className="badge bg-danger">
                                                    Disabled
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default AdminCustomers;