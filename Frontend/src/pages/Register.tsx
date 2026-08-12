import { useState } from "react";
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

    const [form, setForm] =
        useState<RegisterForm>({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: ""
        });

    const [error, setError] =
        useState<string>("");

    const [success, setSuccess] =
        useState<string>("");

    const [loading, setLoading] =
        useState<boolean>(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {

        const {
            name,
            value
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            await API.post(
                "/auth/register",
                form
            );

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error: any) {

            console.error(
                "Registration error:",
                error
            );

            setError(
                error.response?.data ||
                "Registration failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div
            className="container"
            style={{
                marginTop: "100px",
                maxWidth: "600px"
            }}
        >

            <div className="card shadow p-4">

                <h2
                    className="text-center mb-4"
                >
                    Create Account
                </h2>

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

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label className="form-label">
                                First Name
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="firstName"
                                value={
                                    form.firstName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="First name"
                                required
                            />

                        </div>

                        <div className="col-md-6 mb-3">

                            <label className="form-label">
                                Last Name
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="lastName"
                                value={
                                    form.lastName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Last name"
                                required
                            />

                        </div>

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Email
                        </label>

                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={
                                form.email
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter your email"
                            required
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Phone
                        </label>

                        <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={
                                form.phone
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter phone number"
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Password
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={
                                form.password
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Minimum 6 characters"
                            minLength={6}
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Register"}
                    </button>

                </form>

                <p className="text-center mt-3">

                    Already have an account?{" "}

                    <Link to="/login">
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
};

export default Register;