import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import API from "../axios";
import { useAuth } from "../Context/AuthContext";

interface AuthResponse {
    token: string;
    userId: number;
    firstName: string;
    email: string;
    role: string;
}

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await API.post<AuthResponse>(
                "/auth/login",
                { email, password }
            );

            login(data);

            if (data.role === "ADMIN") {
                navigate("/admin/dashboard");
            } else if (data.role === "VENDOR") {
                navigate("/vendor/dashboard");
            } else {
                navigate("/");
            }
        } catch (error: any) {
            setError(
                error.response?.data ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-wrapper">
                <Card className="auth-card border-0 shadow" style={{width:"auto"}}>
                    <Card.Body className="auth-card-body">
                        <div className="auth-header">
                            <div className="auth-icon">🛍️</div>
                            <h2>Welcome Back</h2>
                            <p>Sign in to continue shopping</p>
                        </div>

                        {error && (
                            <Alert
                                variant="danger"
                                className="auth-error"
                            >
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>

                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={e =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter your email"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Password</Form.Label>

                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={e =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    required
                                />
                            </Form.Group>

                            <Button
                                type="submit"
                                className="auth-submit w-100"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                        />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                        </Form>

                        <p className="auth-footer">
                            Don't have an account?{" "}
                            <Link to="/register">
                                Create Account
                            </Link>
                        </p>
                    </Card.Body>
                </Card>
            </div>
        </main>
    );
};

export default Login;