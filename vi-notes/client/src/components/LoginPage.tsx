import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import "../App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        // console.log("Logging in with", { email, password });

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || json?.message || "Login failed");

            login(json.token);
            navigate("/notes", { replace: true });
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <Link to="/" className="auth-back-btn">Back</Link>
            <section className="login">
                <h2>Login</h2>

                <form onSubmit={onSubmit}>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
                    <button type="submit">Login</button>
                </form>

                {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

                <p style={{
                    marginTop: "2px"
                }}>
                    Not registered? <Link to="/register">Register</Link>
                </p>
            </section>
        </div>
    );
}