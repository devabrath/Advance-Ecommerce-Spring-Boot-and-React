import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../axios";

interface AuthResponse {
    token: string;
    userId: number;
    firstName: string;
    email: string;
    role: string;
}

const Login = () => {

    const navigate = useNavigate();

    const [email, setEmail] =
        useState<string>("");

    const [password, setPassword] =
        useState<string>("");

    const [error, setError] =
        useState<string>("");

    const [loading, setLoading] =
        useState<boolean>(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response =
                await API.post<AuthResponse>(
                    "/auth/login",
                    {
                        email,
                        password
                    }
                );

            const authData =
                response.data;

            localStorage.setItem(
                "token",
                authData.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(authData)
            );

            API.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${authData.token}`;

            if (authData.role === "ADMIN") {
                navigate("/admin");
            } else if (
                authData.role === "VENDOR"
            ) {
                navigate("/vendor");
            } else {
                navigate("/");
            }

        } catch (error: any) {

            console.error(
                "Login error:",
                error
            );

            setError(
                error.response?.data ||
                "Invalid email or password"
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
                maxWidth: "500px"
            }}
        >

            <div className="card shadow p-4">

                <h2
                    className="text-center mb-4"
                >
                    Login
                </h2>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                >

                    <div className="mb-3">

                        <label className="form-label">
                            Email
                        </label>

                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            placeholder="Enter your email"
                            required
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Password
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter your password"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <p className="text-center mt-3">

                    Don't have an account?{" "}

                    <Link to="/register">
                        Register
                    </Link>

                </p>

            </div>

        </div>
    );
};

export default Login;