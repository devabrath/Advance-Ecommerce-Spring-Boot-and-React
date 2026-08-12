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

const emptyForm: AddressForm = {
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

    const { user } = useAuth();

    const [addresses, setAddresses] =
        useState<Address[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [form, setForm] =
        useState<AddressForm>(emptyForm);

    const [saving, setSaving] =
        useState(false);


    /*
     * =========================
     * LOAD ADDRESSES
     * =========================
     */

    const fetchAddresses = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await API.get<Address[]>(
                    "/customer/addresses"
                );

            console.log(
                "ADDRESSES:",
                response.data
            );

            setAddresses(response.data);

        } catch (error: any) {

            console.error(
                "Error loading addresses:",
                error
            );

            setError(
                error?.response?.data ||
                "Unable to load your addresses."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchAddresses();

    }, []);


    /*
     * =========================
     * FORM CHANGE
     * =========================
     */

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >
    ) => {

        const { name, value } =
            e.target;

        setForm({
            ...form,
            [name]: value
        });
    };


    const handleDefaultChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        setForm({
            ...form,
            defaultAddress:
                e.target.checked
        });
    };


    /*
     * =========================
     * OPEN ADD
     * =========================
     */

    const openAddModal = () => {

        setEditingId(null);

        setForm({
            ...emptyForm,
            fullName:
                `${user?.firstName || ""}`.trim()
        });

        setShowModal(true);
    };


    /*
     * =========================
     * OPEN EDIT
     * =========================
     */

    const openEditModal = (
        address: Address
    ) => {

        setEditingId(address.id);

        setForm({
            fullName: address.fullName,
            phone: address.phone,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            landmark:
                address.landmark || "",
            addressType:
                address.addressType,
            defaultAddress:
                address.defaultAddress
        });

        setShowModal(true);
    };


    /*
     * =========================
     * SAVE ADDRESS
     * =========================
     */

    const saveAddress = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        try {

            setSaving(true);

            if (editingId === null) {

                await API.post(
                    "/customer/addresses",
                    form
                );

                alert(
                    "Address added successfully."
                );

            } else {

                await API.put(
                    `/customer/addresses/${editingId}`,
                    form
                );

                alert(
                    "Address updated successfully."
                );
            }

            setShowModal(false);

            setEditingId(null);

            setForm(emptyForm);

            await fetchAddresses();

        } catch (error: any) {

            console.error(
                "Error saving address:",
                error
            );

            alert(
                error?.response?.data ||
                "Unable to save address."
            );

        } finally {

            setSaving(false);

        }
    };


    /*
     * =========================
     * DELETE ADDRESS
     * =========================
     */

    const deleteAddress = async (
        id: number
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this address?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await API.delete(
                `/customer/addresses/${id}`
            );

            alert(
                "Address deleted successfully."
            );

            await fetchAddresses();

        } catch (error: any) {

            console.error(
                "Error deleting address:",
                error
            );

            alert(
                error?.response?.data ||
                "Unable to delete address."
            );
        }
    };


    /*
     * =========================
     * LOADING
     * =========================
     */

    if (loading) {

        return (

            <div
                style={{
                    paddingTop: "8rem",
                    textAlign: "center"
                }}
            >

                <Spinner animation="border" />

                <p className="mt-3">
                    Loading profile...
                </p>

            </div>
        );
    }


    /*
     * =========================
     * PAGE
     * =========================
     */

    return (

        <div
            style={{
                paddingTop: "7rem",
                paddingBottom: "4rem",
                maxWidth: "1000px",
                margin: "auto",
                paddingLeft: "20px",
                paddingRight: "20px"
            }}
        >

            {/* PROFILE */}

            <Card className="mb-4 shadow-sm">

                <Card.Body>

                    <div
                        className="d-flex justify-content-between align-items-center"
                    >

                        <div>

                            <h3>
                                My Profile
                            </h3>

                            <p className="mb-1">
                                <strong>
                                    Name:
                                </strong>{" "}
                                {user?.firstName}
                            </p>

                            <p className="mb-0">
                                <strong>
                                    Email:
                                </strong>{" "}
                                {user?.email}
                            </p>

                        </div>

                    </div>

                </Card.Body>

            </Card>


            {/* ADDRESSES */}

            <div
                className="d-flex justify-content-between align-items-center mb-3"
            >

                <h3>
                    My Addresses
                </h3>

                <Button
                    variant="primary"
                    onClick={openAddModal}
                >
                    + Add Address
                </Button>

            </div>


            {error && (

                <Alert variant="danger">
                    {error}
                </Alert>

            )}


            {addresses.length === 0 && !error && (

                <Card className="shadow-sm">

                    <Card.Body
                        className="text-center"
                    >

                        <h5>
                            No saved addresses
                        </h5>

                        <p className="text-muted">
                            Add an address for faster
                            checkout.
                        </p>

                        <Button
                            onClick={openAddModal}
                        >
                            Add Your First Address
                        </Button>

                    </Card.Body>

                </Card>

            )}


            {addresses.map(
                (address) => (

                    <Card
                        key={address.id}
                        className="mb-3 shadow-sm"
                    >

                        <Card.Body>

                            <div
                                className="d-flex justify-content-between"
                            >

                                <div>

                                    <div
                                        className="d-flex align-items-center gap-2 mb-2"
                                    >

                                        <h5 className="mb-0">
                                            {
                                                address.fullName
                                            }
                                        </h5>

                                        <span
                                            className="badge bg-secondary"
                                        >
                                            {
                                                address.addressType
                                            }
                                        </span>

                                        {address.defaultAddress && (

                                            <span
                                                className="badge bg-success"
                                            >
                                                Default
                                            </span>

                                        )}

                                    </div>


                                    <p className="mb-1">
                                        {
                                            address.addressLine
                                        }
                                    </p>

                                    <p className="mb-1">

                                        {
                                            address.city
                                        },{" "}

                                        {
                                            address.state
                                        } -{" "}

                                        {
                                            address.postalCode
                                        }

                                    </p>

                                    <p className="mb-1">

                                        Phone:{" "}
                                        {
                                            address.phone
                                        }

                                    </p>

                                    {address.landmark && (

                                        <p className="mb-0">

                                            Landmark:{" "}
                                            {
                                                address.landmark
                                            }

                                        </p>

                                    )}

                                </div>


                                <div
                                    className="d-flex gap-2 align-items-start"
                                >

                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() =>
                                            openEditModal(
                                                address
                                            )
                                        }
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() =>
                                            deleteAddress(
                                                address.id
                                            )
                                        }
                                    >
                                        Delete
                                    </Button>

                                </div>

                            </div>

                        </Card.Body>

                    </Card>

                )
            )}


            {/* ADDRESS MODAL */}

            <Modal
                show={showModal}
                onHide={() =>
                    setShowModal(false)
                }
                size="lg"
            >

                <Form
                    onSubmit={saveAddress}
                >

                    <Modal.Header closeButton>

                        <Modal.Title>

                            {editingId === null
                                ? "Add Address"
                                : "Edit Address"}

                        </Modal.Title>

                    </Modal.Header>


                    <Modal.Body>

                        <div className="row g-3">

                            <div className="col-md-6">

                                <Form.Group>

                                    <Form.Label>
                                        Full Name
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={
                                            form.fullName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </Form.Group>

                            </div>


                            <div className="col-md-6">

                                <Form.Group>

                                    <Form.Label>
                                        Phone
                                    </Form.Label>

                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </Form.Group>

                            </div>


                            <div className="col-12">

                                <Form.Group>

                                    <Form.Label>
                                        Address
                                    </Form.Label>

                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="addressLine"
                                        value={
                                            form.addressLine
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </Form.Group>

                            </div>


                            <div className="col-md-4">

                                <Form.Group>

                                    <Form.Label>
                                        City
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="city"
                                        value={
                                            form.city
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </Form.Group>

                            </div>


                            <div className="col-md-4">

                                <Form.Group>

                                    <Form.Label>
                                        State
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="state"
                                        value={
                                            form.state
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </Form.Group>

                            </div>


                            <div className="col-md-4">

                                <Form.Group>

                                    <Form.Label>
                                        Postal Code
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="postalCode"
                                        value={
                                            form.postalCode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </Form.Group>

                            </div>


                            <div className="col-md-6">

                                <Form.Group>

                                    <Form.Label>
                                        Landmark
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="landmark"
                                        value={
                                            form.landmark
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </Form.Group>

                            </div>


                            <div className="col-md-6">

                                <Form.Group>

                                    <Form.Label>
                                        Address Type
                                    </Form.Label>

                                    <Form.Select
                                        name="addressType"
                                        value={
                                            form.addressType
                                        }
                                        onChange={
                                            handleChange
                                        }
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

                                </Form.Group>

                            </div>


                            <div className="col-12">

                                <Form.Check
                                    type="checkbox"
                                    label="Set as default address"
                                    checked={
                                        form.defaultAddress
                                    }
                                    onChange={
                                        handleDefaultChange
                                    }
                                />

                            </div>

                        </div>

                    </Modal.Body>


                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={() =>
                                setShowModal(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : editingId === null
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