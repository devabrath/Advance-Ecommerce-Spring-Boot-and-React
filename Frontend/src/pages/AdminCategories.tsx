import React, {
    useEffect,
    useState
} from "react";

import API from "../axios";

interface Category {
    id: number;
    name: string;
}

const AdminCategories = () => {

    const [categories, setCategories] =
        useState<Category[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const response =
                    await API.get<Category[]>(
                        "/admin/categories"
                    );

                setCategories(
                    response.data
                );

            } catch (err: any) {

                console.error(
                    "Admin categories error:",
                    err
                );

                setError(
                    err?.response?.data ||
                    "Unable to load categories."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchCategories();

    }, []);


    if (loading) {

        return (
            <div className="admin-page">

                <h1>
                    Categories
                </h1>

                <p>
                    Loading categories...
                </p>

            </div>
        );
    }


    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <div>

                    <h1>
                        Categories
                    </h1>

                    <p>
                        Manage product categories.
                    </p>

                </div>

            </div>


            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            <div className="card shadow-sm" style={{width : "auto"}}>

                <div className="table-responsive">

                    <table
                        className="table table-hover mb-0"
                    >

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Category Name
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {categories.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={2}
                                        className="text-center py-4"
                                    >
                                        No categories found.
                                    </td>

                                </tr>

                            ) : (

                                categories.map(
                                    category => (

                                        <tr
                                            key={
                                                category.id
                                            }
                                        >

                                            <td>
                                                {
                                                    category.id
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        category.name
                                                    }
                                                </strong>
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default AdminCategories;