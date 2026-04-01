import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import "../App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        // console.log("Registering with", { email, password });

        try {
            const res = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || json?.message || "Register failed");

            login(json.token);
            navigate("/notes", { replace: true });
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <Link to="/" className="auth-back-btn">Back</Link>
            <section className="register">
                <h2>Register</h2>

                <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
                    <button type="submit">Register</button>
                </form>

                {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </section>
        </div>
    );
}