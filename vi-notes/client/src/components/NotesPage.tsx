import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MdEdit } from "react-icons/md";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

type Note = {
    _id: string;
    title: string;
    content: string;
};

function NotesCard({ note }: { note: Note }) {

    const navigate = useNavigate();

    return (
        <div className="notes-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong>{note.title}</strong>
                <div>
                    <MdEdit style={{ cursor: "pointer" }} title="Edit note" onClick={() => navigate(`/notes/${note._id}/edit`)} />
                </div>
            </div>
            <div>{note.content}</div>
        </div>
    );
};

export function NotesPage() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [notes, setNotes] = useState<Note[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;

        (async () => {
            setError("");

            const res = await fetch(`${API}/notes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setNotes([]);
                setError(json?.error || json?.message || `Request failed (${res.status})`);
                return;
            }

            setNotes(Array.isArray(json?.notes) ? json.notes : []);
        })();
    }, [token]);


    const createNote = () => {
        // console.log("Creating new note...");
        (async () => {
            setError("");
            const res = await fetch(`${API}/notes/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: `New Note + ${new Date().toLocaleString()}`,
                    content: "",
                }),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(json?.error || json?.message || `Request failed (${res.status})`);
                return;
            }
            // console.log("Note created:", json?.note, new Date().toLocaleString());
            const newNoteId = json?.note?.id;
            // console.log("New note ID:", newNoteId);
            if (newNoteId) {
                navigate(`/notes/${newNoteId}/edit`);
            } else {
                setError("Failed to create note.");
            }
        })();
    };

    return (
        <>
            <div className="notes-header">
                <h2 style={{ margin: 0 }}>My Notes</h2>
                <button onClick={() => { logout(); navigate("/", { replace: true }); }} className="logout-btn">
                    Logout
                </button>
            </div>
            <section className="notes-page">
                {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

                {notes.length > 0 ? (
                    <ul>
                        {notes.map((note) => (
                            <NotesCard key={note._id} note={note} />
                        ))}
                    </ul>
                ) : (
                    <p>No notes found.</p>
                )}

                <button onClick={createNote} className="create-note-btn">Create New Note</button>
            </section>
        </>
    );
}