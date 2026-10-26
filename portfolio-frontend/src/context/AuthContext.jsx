import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    // =========================================================
    // AUTH TOKEN
    // =========================================================

    const [token, setToken] = useState(
        localStorage.getItem("adminToken")
    );


    // =========================================================
    // ADMIN DATA
    // =========================================================

    const [admin, setAdmin] = useState(() => {

        const savedAdmin = localStorage.getItem("admin");

        return savedAdmin
            ? JSON.parse(savedAdmin)
            : null;
    });


    // =========================================================
    // LOADING
    // =========================================================

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        setLoading(false);

    }, []);


    // =========================================================
    // ADMIN LOGIN
    // EMAIL + PASSWORD
    // =========================================================

    const login = async (email, password) => {

        try {

            const response = await api.post(
                "/api/auth/admin/login",
                {
                    email,
                    password
                }
            );

            const data = response.data;


            // =====================================================
            // SAVE JWT TOKEN
            // =====================================================

            localStorage.setItem(
                "adminToken",
                data.token
            );


            // =====================================================
            // SAVE ADMIN INFORMATION
            // =====================================================

            const adminData = {
                username: data.username,
                email: data.email,
                role: data.role
            };

            localStorage.setItem(
                "admin",
                JSON.stringify(adminData)
            );


            // =====================================================
            // UPDATE STATE
            // =====================================================

            setToken(data.token);

            setAdmin(adminData);


            // =====================================================
            // SUCCESS
            // =====================================================

            return {
                success: true,
                data
            };

        } catch (error) {

            console.error(
                "Admin Login Error:",
                error
            );


            // =====================================================
            // ERROR MESSAGE
            // =====================================================

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Invalid email or password"
            };
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        localStorage.removeItem("adminToken");

        localStorage.removeItem("admin");

        setToken(null);

        setAdmin(null);
    };


    // =========================================================
    // AUTHENTICATION STATUS
    // =========================================================

    const isAuthenticated = Boolean(token);


    // =========================================================
    // CONTEXT PROVIDER
    // =========================================================

    return (
        <AuthContext.Provider
            value={{
                token,
                admin,
                loading,
                isAuthenticated,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


// =============================================================
// useAuth HOOK
// =============================================================

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};