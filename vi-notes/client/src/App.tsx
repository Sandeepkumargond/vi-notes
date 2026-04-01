import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./context/RequireAuth.tsx";
import { HomePage } from "./components/HomePage.tsx";
import { LoginPage } from "./components/LoginPage.tsx";
import { RegisterPage } from "./components/RegisterPage.tsx";
import { NotesPage } from "./components/NotesPage.tsx";
import { EditNotesPage } from "./components/EditNotesPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/notes"
        element={
          <RequireAuth>
            <NotesPage />
          </RequireAuth>
        }
      />

      <Route
        path="/notes/:id/edit"
        element={
          <RequireAuth>
            <EditNotesPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}