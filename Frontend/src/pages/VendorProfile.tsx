import React, {
    useEffect,
    useState
} from "react";

import API from "../axios";

interface VendorProfileData {

    vendorId: number;

    userId: number;

    firstName: string;

    lastName: string;

    email: string;

    phone: string;

    shopName: string;

    description: string;

    active: boolean;
}


const VendorProfile = () => {

    const [
        profile,
        setProfile
    ] = useState<VendorProfileData | null>(
        null
    );


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    const fetchProfile = async () => {

        try {

            setLoading(true);

            const response =
                await API.get<VendorProfileData>(
                    "/vendor/profile"
                );

            setProfile(
                response.data
            );

            setError("");

        } catch (err: any) {

            console.error(
                "Vendor profile error:",
                err
            );

            setError(
                err?.response?.data ||
                "Unable to load vendor profile."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchProfile();

    }, []);


    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement
        >
    ) => {

        if (!profile) {
            return;
        }

        const {
            name,
            value
        } = e.target;


        setProfile({

            ...profile,

            [name]: value

        });
    };


    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!profile) {
            return;
        }


        try {

            setSaving(true);

            setError("");

            setSuccess("");


            const response =
                await API.put<VendorProfileData>(
                    "/vendor/profile",
                    {
                        firstName:
                            profile.firstName,

                        lastName:
                            profile.lastName,

                        email:
                            profile.email,

                        phone:
                            profile.phone,

                        shopName:
                            profile.shopName,

                        description:
                            profile.description
                    }
                );


            setProfile(
                response.data
            );


            setSuccess(
                "Profile updated successfully!"
            );


        } catch (err: any) {

            console.error(
                "Profile update error:",
                err
            );

            setError(
                err?.response?.data ||
                "Unable to update profile."
            );

        } finally {

            setSaving(false);
        }
    };


    if (loading) {

        return (

            <div
                className="container"
                style={{
                    marginTop: "100px"
                }}
            >

                <h3>
                    Loading profile...
                </h3>

            </div>
        );
    }


    if (!profile) {

        return (

            <div
                className="container"
                style={{
                    marginTop: "100px"
                }}
            >

                <div className="alert alert-danger">

                    {error ||
                        "Profile not found."}

                </div>

            </div>
        );
    }


    return (

        <div
            className="container"
            style={{
                marginTop: "100px",
                marginBottom: "50px",
                maxWidth: "900px"
            }}
        >

            <div className="mb-4">

                <h2>
                    Vendor Profile
                </h2>

                <p className="text-muted">
                    Manage your personal and
                    shop information.
                </p>

            </div>


            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {success && (

                <div className="alert alert-success">

                    {success}

                </div>

            )}


            <form
                onSubmit={handleSubmit}
            >

                {/* PERSONAL INFORMATION */}

                <div
                    className="card shadow-sm mb-4"
                >

                    <div className="card-body">

                        <h5 className="mb-4">
                            Personal Information
                        </h5>


                        <div className="row g-3">


                            {/* FIRST NAME */}

                            <div className="col-md-6">

                                <label className="form-label">
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-control"
                                    value={
                                        profile.firstName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* LAST NAME */}

                            <div className="col-md-6">

                                <label className="form-label">
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-control"
                                    value={
                                        profile.lastName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="col-md-6">

                                <label className="form-label">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={
                                        profile.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* PHONE */}

                            <div className="col-md-6">

                                <label className="form-label">
                                    Phone
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    value={
                                        profile.phone || ""
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* SHOP INFORMATION */}

                <div
                    className="card shadow-sm mb-4"
                >

                    <div className="card-body">

                        <h5 className="mb-4">
                            Shop Information
                        </h5>


                        <div className="row g-3">


                            {/* SHOP NAME */}

                            <div className="col-12">

                                <label className="form-label">
                                    Shop Name
                                </label>

                                <input
                                    type="text"
                                    name="shopName"
                                    className="form-control"
                                    value={
                                        profile.shopName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="col-12">

                                <label className="form-label">
                                    Shop Description
                                </label>

                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows={5}
                                    value={
                                        profile.description ||
                                        ""
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Tell customers about your shop..."
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* ACCOUNT STATUS */}

                <div
                    className="card shadow-sm mb-4"
                >

                    <div className="card-body">

                        <h5>
                            Account Status
                        </h5>

                        <p className="mb-0">

                            Status:{" "}

                            {profile.active ? (

                                <span className="badge bg-success">
                                    Active
                                </span>

                            ) : (

                                <span className="badge bg-danger">
                                    Inactive
                                </span>

                            )}

                        </p>

                    </div>

                </div>


                {/* SAVE */}

                <div className="d-flex justify-content-end">

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

            </form>

        </div>
    );
};


export default VendorProfile;