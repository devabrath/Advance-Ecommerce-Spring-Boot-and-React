import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Form,
    Modal,
    Spinner
} from "react-bootstrap";
import API from "../axios";
import { useAuth } from "../Context/AuthContext";

interface Address {
    id: number;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
    addressType: string;
    defaultAddress: boolean;
}

interface ProfileData {
    token: string;
    userId: number;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: string;
}

interface ProfileForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface AddressForm {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    landmark: string;
    addressType: string;
    defaultAddress: boolean;
}

const emptyAddress: AddressForm = {
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    landmark: "",
    addressType: "HOME",
    defaultAddress: false
};

const Profile: React.FC = () => {
    const { login } = useAuth();

    const [profile, setProfile] =
        useState<ProfileData | null>(null);

    const [profileForm, setProfileForm] =
        useState<ProfileForm>({
            firstName: "",
            lastName: "",
            email: "",
            phone: ""
        });

    const [passwordForm, setPasswordForm] =
        useState<PasswordForm>({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

    const [addresses, setAddresses] =
        useState<Address[]>([]);

    const [addressForm, setAddressForm] =
        useState<AddressForm>(emptyAddress);

    const [loading, setLoading] = useState(true);
    const [addressLoading, setAddressLoading] =
        useState(false);
    const [savingProfile, setSavingProfile] =
        useState(false);
    const [changingPassword, setChangingPassword] =
        useState(false);
    const [error, setError] = useState("");

    const [showProfileEdit, setShowProfileEdit] =
        useState(false);

    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [showAddressModal, setShowAddressModal] =
        useState(false);

    const [editingAddressId, setEditingAddressId] =
        useState<number | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const { data } =
                await API.get<ProfileData>(
                    "/customer/profile"
                );

            setProfile(data);

            setProfileForm({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email || "",
                phone: data.phone || ""
            });

        } catch (error: any) {
            setError(
                error?.response?.data ||
                "Unable to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            setAddressLoading(true);

            const { data } =
                await API.get<Address[]>(
                    "/customer/addresses"
                );

            setAddresses(data);

        } catch (error) {
            console.error(error);
        } finally {
            setAddressLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchAddresses();
    }, []);

    const handleProfileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const updateProfile = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            setSavingProfile(true);

            const { data } =
                await API.put<ProfileData>(
                    "/customer/profile",
                    profileForm
                );

            login({
                token: data.token,
                userId: data.userId,
                firstName: data.firstName,
                email: data.email,
                role: data.role
            });

            setProfile(data);
            setShowProfileEdit(false);

            alert("Profile updated successfully.");

        } catch (error: any) {
            alert(
                error?.response?.data ||
                "Unable to update profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const changePassword = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {
            alert("New passwords do not match.");
            return;
        }

        try {
            setChangingPassword(true);

            await API.put(
                "/customer/profile/password",
                {
                    currentPassword:
                        passwordForm.currentPassword,
                    newPassword:
                        passwordForm.newPassword
                }
            );

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            setShowPasswordModal(false);

            alert("Password changed successfully.");

        } catch (error: any) {
            alert(
                error?.response?.data ||
                "Unable to change password."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    const handleAddressChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setAddressForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openAddAddress = () => {
        setEditingAddressId(null);

        setAddressForm({
            ...emptyAddress,
            fullName: [
                profile?.firstName,
                profile?.lastName
            ].filter(Boolean).join(" "),
            phone: profile?.phone || ""
        });

        setShowAddressModal(true);
    };

    const openEditAddress = (
        address: Address
    ) => {
        setEditingAddressId(address.id);

        setAddressForm({
            fullName: address.fullName,
            phone: address.phone,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            landmark: address.landmark || "",
            addressType: address.addressType,
            defaultAddress: address.defaultAddress
        });

        setShowAddressModal(true);
    };

    const saveAddress = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            const url =
                editingAddressId === null
                    ? "/customer/addresses"
                    : `/customer/addresses/${editingAddressId}`;

            await API[
                editingAddressId === null
                    ? "post"
                    : "put"
            ](url, addressForm);

            alert(
                editingAddressId === null
                    ? "Address added successfully."
                    : "Address updated successfully."
            );

            setShowAddressModal(false);
            setEditingAddressId(null);
            setAddressForm(emptyAddress);

            await fetchAddresses();

        } catch (error: any) {
            alert(
                error?.response?.data ||
                "Unable to save address."
            );
        }
    };

    const deleteAddress = async (id: number) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this address?"
            )
        ) {
            return;
        }

        try {
            await API.delete(
                `/customer/addresses/${id}`
            );

            alert("Address deleted successfully.");

            await fetchAddresses();

        } catch (error: any) {
            alert(
                error?.response?.data ||
                "Unable to delete address."
            );
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <Spinner animation="border" />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">

            {error && (
                <Alert variant="danger">
                    {error}
                </Alert>
            )}

            <Card className="profile-card">
                <Card.Body>

                    <div className="profile-header">
                        <h3>My Profile</h3>

                        <Button
                            onClick={() =>
                                setShowProfileEdit(true)
                            }
                        >
                            Edit Profile
                        </Button>
                    </div>

                    <hr />

                    <div className="row">
                        <div className="col-md-6">
                            <p>
                                <strong>First Name:</strong>{" "}
                                {profile?.firstName}
                            </p>

                            <p>
                                <strong>Last Name:</strong>{" "}
                                {profile?.lastName || "-"}
                            </p>
                        </div>

                        <div className="col-md-6">
                            <p>
                                <strong>Email:</strong>{" "}
                                {profile?.email}
                            </p>

                            <p>
                                <strong>Phone:</strong>{" "}
                                {profile?.phone || "-"}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline-danger"
                        onClick={() =>
                            setShowPasswordModal(true)
                        }
                    >
                        Change Password
                    </Button>

                </Card.Body>
            </Card>

            <div className="profile-header">
                <h3>My Addresses</h3>

                <Button onClick={openAddAddress}>
                    + Add Address
                </Button>
            </div>

            {addressLoading && (
                <div className="address-loader">
                    <Spinner
                        animation="border"
                        size="sm"
                    />
                </div>
            )}

            {!addressLoading &&
                addresses.length === 0 && (
                    <Card className="profile-card empty-address-card">
                        <Card.Body>
                            <h5>No saved addresses</h5>
                            <p>
                                Add an address for faster checkout.
                            </p>
                        </Card.Body>
                    </Card>
                )}

            {addresses.map(address => (
                <Card
                    key={address.id}
                    className="profile-card address-card"
                >
                    <Card.Body>

                        <div className="address-content">

                            <div>
                                <div className="address-title">
                                    <h5>
                                        {address.fullName}
                                    </h5>

                                    <span className="badge bg-secondary">
                                        {address.addressType}
                                    </span>

                                    {address.defaultAddress && (
                                        <span className="badge bg-success">
                                            Default
                                        </span>
                                    )}
                                </div>

                                <p>
                                    {address.addressLine}
                                </p>

                                <p>
                                    {address.city}, {address.state} -{" "}
                                    {address.postalCode}
                                </p>

                                <p>
                                    Phone: {address.phone}
                                </p>

                                {address.landmark && (
                                    <p>
                                        Landmark: {address.landmark}
                                    </p>
                                )}
                            </div>

                            <div className="address-actions">
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() =>
                                        openEditAddress(address)
                                    }
                                >
                                    Edit
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() =>
                                        deleteAddress(address.id)
                                    }
                                >
                                    Delete
                                </Button>
                            </div>

                        </div>

                    </Card.Body>
                </Card>
            ))}

            <Modal
                show={showProfileEdit}
                onHide={() =>
                    setShowProfileEdit(false)
                }
            >
                <Form onSubmit={updateProfile}>

                    <Modal.Header closeButton>
                        <Modal.Title>
                            Edit Profile
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                First Name
                            </Form.Label>

                            <Form.Control
                                name="firstName"
                                value={profileForm.firstName}
                                onChange={handleProfileChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Last Name
                            </Form.Label>

                            <Form.Control
                                name="lastName"
                                value={profileForm.lastName}
                                onChange={handleProfileChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Email
                            </Form.Label>

                            <Form.Control
                                type="email"
                                name="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>
                                Phone Number
                            </Form.Label>

                            <Form.Control
                                type="tel"
                                name="phone"
                                value={profileForm.phone}
                                onChange={handleProfileChange}
                            />
                        </Form.Group>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setShowProfileEdit(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={savingProfile}
                        >
                            {savingProfile
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </Modal.Footer>

                </Form>
            </Modal>

            <Modal
                show={showPasswordModal}
                onHide={() =>
                    setShowPasswordModal(false)
                }
            >
                <Form onSubmit={changePassword}>

                    <Modal.Header closeButton>
                        <Modal.Title>
                            Change Password
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Current Password
                            </Form.Label>

                            <Form.Control
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                New Password
                            </Form.Label>

                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                minLength={6}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>
                                Confirm New Password
                            </Form.Label>

                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                minLength={6}
                                required
                            />
                        </Form.Group>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setShowPasswordModal(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="danger"
                            disabled={changingPassword}
                        >
                            {changingPassword
                                ? "Changing..."
                                : "Change Password"}
                        </Button>
                    </Modal.Footer>

                </Form>
            </Modal>

            <Modal
                show={showAddressModal}
                onHide={() =>
                    setShowAddressModal(false)
                }
                size="lg"
            >
                <Form onSubmit={saveAddress}>

                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editingAddressId === null
                                ? "Add Address"
                                : "Edit Address"}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>

                        <div className="row g-3">

                            <div className="col-md-6">
                                <Form.Label>
                                    Full Name
                                </Form.Label>

                                <Form.Control
                                    name="fullName"
                                    value={addressForm.fullName}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Label>
                                    Phone
                                </Form.Label>

                                <Form.Control
                                    name="phone"
                                    value={addressForm.phone}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <Form.Label>
                                    Address
                                </Form.Label>

                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="addressLine"
                                    value={addressForm.addressLine}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <Form.Label>
                                    City
                                </Form.Label>

                                <Form.Control
                                    name="city"
                                    value={addressForm.city}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <Form.Label>
                                    State
                                </Form.Label>

                                <Form.Control
                                    name="state"
                                    value={addressForm.state}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <Form.Label>
                                    Postal Code
                                </Form.Label>

                                <Form.Control
                                    name="postalCode"
                                    value={addressForm.postalCode}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Label>
                                    Landmark
                                </Form.Label>

                                <Form.Control
                                    name="landmark"
                                    value={addressForm.landmark}
                                    onChange={handleAddressChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Label>
                                    Address Type
                                </Form.Label>

                                <Form.Select
                                    name="addressType"
                                    value={addressForm.addressType}
                                    onChange={handleAddressChange}
                                >
                                    <option value="HOME">
                                        HOME
                                    </option>

                                    <option value="WORK">
                                        WORK
                                    </option>

                                    <option value="OTHER">
                                        OTHER
                                    </option>
                                </Form.Select>
                            </div>

                            <div className="col-12">
                                <Form.Check
                                    type="checkbox"
                                    label="Set as default address"
                                    checked={
                                        addressForm.defaultAddress
                                    }
                                    onChange={e =>
                                        setAddressForm(prev => ({
                                            ...prev,
                                            defaultAddress:
                                                e.target.checked
                                        }))
                                    }
                                />
                            </div>

                        </div>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setShowAddressModal(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button type="submit">
                            {editingAddressId === null
                                ? "Add Address"
                                : "Update Address"}
                        </Button>
                    </Modal.Footer>

                </Form>
            </Modal>

        </div>
    );
};

export default Profile;