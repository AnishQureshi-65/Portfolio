import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {

    const {
        isAuthenticated,
        loading
    } = useAuth();


    // =========================================================
    // AUTH CHECK LOADING
    // =========================================================

    if (loading) {

        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "600"
                }}
            >
                Loading...
            </div>
        );

    }


    // =========================================================
    // NOT AUTHENTICATED
    // =========================================================

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );

    }


    // =========================================================
    // AUTHENTICATED
    // =========================================================

    return <Outlet />;
};


export default ProtectedRoute;
