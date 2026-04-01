import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">Vi Notes</span>
                </Link>
                <div className="nav-buttons">
                    {isAuthenticated ? (
                        <>
                            <Link to="/notes" className="nav-link">My Notes</Link>
                            <button onClick={logout} className="nav-button logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ border: "1px solid #ccc", padding: "8px 16px", borderRadius: "4px" }}>Login</Link>
                            <Link to="/register" style={{ border: "1px solid #ccc", padding: "8px 16px", borderRadius: "4px" }}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
