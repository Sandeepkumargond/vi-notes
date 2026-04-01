import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        const tok = localStorage.getItem("token");
        return tok ? tok : null;
    });

    useEffect(() => {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    }, [token]);

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            isAuthenticated: Boolean(token),
            login: (newToken) => setToken(newToken),
            logout: () => setToken(null),
        }),
        [token]
    );

    return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}