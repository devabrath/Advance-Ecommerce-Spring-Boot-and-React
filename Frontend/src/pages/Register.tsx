import { useState } from "react";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import API from "../axios";

interface RegisterForm {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
}

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterForm>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await API.post("/auth/register", form);

            setSuccess("Registration successful! Redirecting to login...");

            setTimeout(() => navigate("/login"), 1500);
        } catch (error: any) {
            setError(
                error.response?.data ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <Card className="auth-card border-0 shadow">
                <Card.Body className="p-4 p-md-5">
                    <div className="auth-header">
                        <h2>Create Account</h2>
                        <p>Join us and start shopping today</p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="col-md-6 mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    required
                                />
                            </Form.Group>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                minLength={6}
                                required
                            />
                        </Form.Group>

                        <Button
                            type="submit"
                            className="w-100 auth-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </Form>

                    <p className="auth-footer">
                        Already have an account?{" "}
                        <Link to="/login">Login</Link>
                    </p>
                </Card.Body>
            </Card>
        </main>
    );
};

export default Register;