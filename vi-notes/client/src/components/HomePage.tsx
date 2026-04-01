import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar";
import "../styles/HomePage.css";

export function HomePage() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            <Navbar />
            <div className="home-container">
                <section className="hero">
                    <div className="hero-content">
                        <h1>Welcome to Vi Notes</h1>
                        <p className="hero-subtitle">
                            A powerful note-taking application with version history and writing analytics
                        </p>

                        <div className="features">
                            <div className="feature-card">
                                <div className="feature-icon"></div>
                                <h3>Create & Edit Notes</h3>
                                <p>Easily create and edit your notes with a clean, intuitive interface</p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon"></div>
                                <h3>Version History</h3>
                                <p>Track every change with complete version history and session management</p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon"></div>
                                <h3>Writing Analytics</h3>
                                <p>Get insights on your typing vs pasting ratio and writing session duration</p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon"></div>
                                <h3>Secure & Private</h3>
                                <p>Your notes are secure and only accessible to you with authentication</p>
                            </div>
                        </div>

                        {!isAuthenticated && (
                            <div className="cta-buttons">
                                <a href="/register" className="btn btn-primary">
                                    Get Started Free
                                </a>
                                <a href="/login" className="btn btn-secondary">
                                    Sign In
                                </a>
                            </div>
                        )}

                        {isAuthenticated && (
                            <div className="cta-buttons">
                                <a href="/notes" className="btn btn-primary">
                                    Go to Your Notes
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                <section className="about">
                    <h2>About Vi Notes</h2>
                    <p>
                        Vi Notes is a modern note-taking application designed for writers, students, and professionals
                        who value their writing process. Unlike traditional note apps, Vi Notes tracks your writing journey
                        with detailed session history and writing metrics. Each keystroke and paste is recorded to give you
                        insights into your writing habits. Whether you're journaling, studying, or writing essays, Vi Notes
                        keeps your work organized and gives you the ability to review how your notes evolved over time.
                    </p>
                </section>
            </div>
        </>
    );
}
