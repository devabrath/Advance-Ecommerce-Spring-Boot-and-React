import React, { useEffect, useState } from "react";
import API from "../axios";

interface Vendor {
    id: number;
    shopName: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    active: boolean;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
    };
}

const AdminVendors = () => {

    const [vendors, setVendors] =
        useState<Vendor[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchVendors = async () => {

            try {

                const response =
                    await API.get<Vendor[]>(
                        "/admin/vendors"
                    );

                setVendors(response.data);

            } catch (err: any) {

                console.error(
                    "Admin vendors error:",
                    err
                );

                setError(
                    err?.response?.data ||
                    "Unable to load vendors."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchVendors();

    }, []);


    if (loading) {
        return (
            <div className="admin-page">
                <h1>Vendors</h1>
                <p>Loading vendors...</p>
            </div>
        );
    }


    return (
        <div className="admin-page">

            <div className="admin-page-header">
                <div>
                    <h1>Vendors</h1>
                    <p>
                        Manage vendors registered on Dunique.
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
                                <th>Shop</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {vendors.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-4"
                                    >
                                        No vendors found.
                                    </td>
                                </tr>

                            ) : (

                                vendors.map(vendor => (

                                    <tr key={vendor.id}>

                                        <td>
                                            {vendor.id}
                                        </td>

                                        <td>
                                            <strong>
                                                {vendor.shopName}
                                            </strong>
                                        </td>

                                        <td>
                                            {vendor.email || "-"}
                                        </td>

                                        <td>
                                            {vendor.phone || "-"}
                                        </td>

                                        <td>

                                            {vendor.active ? (
                                                <span className="badge bg-success">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="badge bg-danger">
                                                    Inactive
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

export default AdminVendors;