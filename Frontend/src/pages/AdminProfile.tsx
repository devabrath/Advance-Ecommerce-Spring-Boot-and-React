import React, {
    useEffect,
    useState
} from "react";

import API from "../axios";

interface ProfileData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: string;
}

const AdminProfile = () => {

    const [profile, setProfile] =
        useState<ProfileData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const response =
                    await API.get<ProfileData>(
                        "/admin/profile"
                    );

                setProfile(
                    response.data
                );

            } catch (err: any) {

                console.error(
                    "Admin profile error:",
                    err
                );

                setError(
                    err?.response?.data ||
                    "Unable to load profile."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchProfile();

    }, []);


    if (loading) {

        return (
            <div className="admin-page">

                <h1>
                    Profile
                </h1>

                <p>
                    Loading profile...
                </p>

            </div>
        );
    }


    if (error) {

        return (
            <div className="admin-page">

                <h1>
                    Profile
                </h1>

                <div className="alert alert-danger">
                    {error}
                </div>

            </div>
        );
    }


    if (!profile) {
        return null;
    }


    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <div>

                    <h1>
                        Profile
                    </h1>

                    <p>
                        Manage your administrator account.
                    </p>

                </div>

            </div>


            <div
                className="card shadow-sm"
                style={{
                    maxWidth: "700px"
                }}
            >

                <div className="card-body">

                    <div className="row g-4">

                        <div className="col-md-6">

                            <label className="form-label">
                                First Name
                            </label>

                            <input
                                className="form-control"
                                value={
                                    profile.firstName
                                }
                                readOnly
                            />

                        </div>


                        <div className="col-md-6">

                            <label className="form-label">
                                Last Name
                            </label>

                            <input
                                className="form-control"
                                value={
                                    profile.lastName
                                }
                                readOnly
                            />

                        </div>


                        <div className="col-md-6">

                            <label className="form-label">
                                Email
                            </label>

                            <input
                                className="form-control"
                                value={
                                    profile.email
                                }
                                readOnly
                            />

                        </div>


                        <div className="col-md-6">

                            <label className="form-label">
                                Phone
                            </label>

                            <input
                                className="form-control"
                                value={
                                    profile.phone || ""
                                }
                                readOnly
                            />

                        </div>


                        <div className="col-12">

                            <label className="form-label">
                                Role
                            </label>

                            <input
                                className="form-control"
                                value={
                                    profile.role
                                }
                                readOnly
                            />

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AdminProfile;