import React, { useEffect, useState } from "react";
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
    const [profile, setProfile] = useState<VendorProfileData | null>(null);
    const [originalProfile, setOriginalProfile] = useState<VendorProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // LOAD PROFILE
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get<VendorProfileData>("/vendor/profile");

            setProfile(response.data);
            setOriginalProfile(response.data);
        } catch (err: any) {
            console.error("Vendor profile error:", err);

            setError(
                typeof err?.response?.data === "string"
                    ? err.response.data
                    : "Unable to load vendor profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // INPUT CHANGE
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!profile) return;

        const { name, value } = e.target;

        setProfile({
            ...profile,
            [name]: value
        });
    };

    // ENTER EDIT MODE
    const handleEdit = () => {
        setError("");
        setSuccess("");
        setEditMode(true);
    };

    // CANCEL EDIT
    const handleCancel = () => {
        if (originalProfile) setProfile(originalProfile);

        setEditMode(false);
        setError("");
        setSuccess("");
    };

    // SAVE PROFILE
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!profile) return;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await API.put<VendorProfileData>("/vendor/profile", {
                firstName: profile.firstName.trim(),
                lastName: profile.lastName.trim(),
                email: profile.email.trim(),
                phone: profile.phone.trim(),
                shopName: profile.shopName.trim(),
                description: profile.description.trim()
            });

            setProfile(response.data);
            setOriginalProfile(response.data);
            setEditMode(false);
            setSuccess("Profile updated successfully!");
        } catch (err: any) {
            console.error("Profile update error:", err);

            setError(
                typeof err?.response?.data === "string"
                    ? err.response.data
                    : "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // LOADING
    if (loading) {
        return (
            <div className="admin-customers-page">
                <div className="customer-loading">Loading profile...</div>
            </div>
        );
    }

    // PROFILE NOT FOUND
    if (!profile) {
        return (
            <div className="admin-customers-page">
                <div className="customer-error">{error || "Profile not found."}</div>
            </div>
        );
    }

    return (
        <div className="admin-customers-page">

            {/* HEADER */}
            <div className="customers-header">
                <div>
                    <h1>Vendor Profile</h1>
                    <p>View and manage your personal and shop information.</p>
                </div>

                {!editMode && (
                    <button type="button" className="customer-add-button" onClick={handleEdit}>
                        Edit Profile
                    </button>
                )}
            </div>

            {/* ERROR */}
            {error && <div className="customer-error">{error}</div>}

            {/* SUCCESS */}
            {success && (
                <div
                    className="customer-status active"
                    style={{ display: "block", padding: "14px", borderRadius: "8px", marginBottom: "18px" }}
                >
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* PERSONAL INFORMATION */}
                <div
                    className="customer-table-container"
                    style={{ padding: "25px", marginBottom: "20px", overflow: "visible" }}
                >
                    <div style={{ marginBottom: "22px" }}>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>Personal Information</h2>
                        <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: "13px" }}>
                            Your account information.
                        </p>
                    </div>

                    <div className="customer-form-grid">

                        {/* FIRST NAME */}
                        <div>
                            <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600 }}>
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={profile.firstName || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                                required
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    background: editMode ? "" : "#f8fafc"
                                }}
                            />
                        </div>

                        {/* LAST NAME */}
                        <div>
                            <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600 }}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={profile.lastName || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                                required
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    background: editMode ? "" : "#f8fafc"
                                }}
                            />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600 }}>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                                required
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    background: editMode ? "" : "#f8fafc"
                                }}
                            />
                        </div>

                        {/* PHONE */}
                        <div>
                            <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600 }}>
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    background: editMode ? "" : "#f8fafc"
                                }}
                            />
                        </div>

                    </div>
                </div>

                {/* SHOP INFORMATION */}
                <div
                    className="customer-table-container"
                    style={{ padding: "25px", marginBottom: "20px", overflow: "visible" }}
                >
                    <div style={{ marginBottom: "22px" }}>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>Shop Information</h2>
                        <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: "13px" }}>
                            Manage your shop details.
                        </p>
                    </div>

                    {/* SHOP NAME */}
                    <div style={{ marginBottom: "18px" }}>
                        <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600 }}>
                            Shop Name
                        </label>
                        <input
                            type="text"
                            name="shopName"
                            value={profile.shopName || ""}
                            onChange={handleChange}
                            disabled={!editMode}
                            required
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "11px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                outline: "none",
                                background: editMode ? "" : "#f8fafc"
                            }}
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600 }}>
                            Shop Description
                        </label>
                        <textarea
                            name="description"
                            value={profile.description || ""}
                            onChange={handleChange}
                            disabled={!editMode}
                            rows={5}
                            placeholder="Tell customers about your shop..."
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "11px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                resize: "vertical",
                                outline: "none",
                                fontFamily: "inherit",
                                background: editMode ? "" : "#f8fafc"
                            }}
                        />
                    </div>
                </div>

                {/* ACCOUNT STATUS */}
                <div
                    className="customer-table-container"
                    style={{ padding: "20px 25px", marginBottom: "20px", overflow: "visible" }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "20px"
                        }}
                    >
                        <div>
                            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Account Status</h2>
                            <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: "13px" }}>
                                Current vendor account status.
                            </p>
                        </div>

                        <span className={`customer-status ${profile.active ? "active" : "disabled"}`}>
                            {profile.active ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>

                {/* ACTIONS */}
                {editMode && (
                    <div className="customer-form-actions" style={{ marginBottom: "40px" }}>
                        <button type="button" onClick={handleCancel} disabled={saving}>
                            Cancel
                        </button>

                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}

            </form>
        </div>
    );
};

export default VendorProfile;