import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLogin.css";

const AdminLogin = () => {

    const navigate = useNavigate();

    const {
        login,
        isAuthenticated
    } = useAuth();


    // =========================================================
    // FORM DATA
    // =========================================================

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });


    // =========================================================
    // STATES
    // =========================================================

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    // =========================================================
    // REDIRECT IF ALREADY AUTHENTICATED
    // =========================================================

    useEffect(() => {

        if (isAuthenticated) {

            navigate("/admin", {
                replace: true
            });
        }

    }, [isAuthenticated, navigate]);


    // =========================================================
    // HANDLE INPUT CHANGE
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));


        // Clear previous error
        setError("");
    };


    // =========================================================
    // HANDLE LOGIN
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        // ---------------------------------------------------------
        // EMAIL VALIDATION
        // ---------------------------------------------------------

        if (!formData.email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        // ---------------------------------------------------------
        // BASIC EMAIL FORMAT VALIDATION
        // ---------------------------------------------------------

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(formData.email.trim())) {

            setError(
                "Please enter a valid email address."
            );

            return;
        }


        // ---------------------------------------------------------
        // PASSWORD VALIDATION
        // ---------------------------------------------------------

        if (!formData.password) {

            setError(
                "Please enter your password."
            );

            return;
        }


        // ---------------------------------------------------------
        // START LOADING
        // ---------------------------------------------------------

        setLoading(true);


        // ---------------------------------------------------------
        // LOGIN API
        // ---------------------------------------------------------

        const result = await login(
            formData.email.trim(),
            formData.password
        );


        // ---------------------------------------------------------
        // STOP LOADING
        // ---------------------------------------------------------

        setLoading(false);


        // ---------------------------------------------------------
        // LOGIN SUCCESS
        // ---------------------------------------------------------

        if (result.success) {

            navigate("/admin", {
                replace: true
            });

            return;
        }


        // ---------------------------------------------------------
        // LOGIN FAILED
        // ---------------------------------------------------------

        setError(
            result.message ||
            "Invalid email or password."
        );
    };


    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="login-page">

            {/* =================================================
                BACKGROUND DECORATION
            ================================================= */}

            <div className="background-shape shape-one"></div>

            <div className="background-shape shape-two"></div>

            <div className="background-grid"></div>


            <div className="login-container">


                {/* =================================================
                    LEFT BRANDING PANEL
                ================================================= */}

                <section className="login-brand-panel">

                    <div className="brand-content">


                        {/* LOGO */}

                        <div className="brand-logo">
                            AQ
                        </div>


                        {/* BRAND NAME */}

                        <div className="brand-name">
                            Anish Qureshi
                        </div>


                        {/* LINE */}

                        <div className="brand-line"></div>


                        {/* HERO TEXT */}

                        <h1>
                            Build.
                            <br />

                            Manage.
                            <br />

                            <span>
                                Showcase.
                            </span>
                        </h1>


                        {/* DESCRIPTION */}

                        <p className="brand-description">

                            Welcome to your personal portfolio
                            management system. Manage your
                            projects, skills, education,
                            experience and messages from one
                            powerful dashboard.

                        </p>


                        {/* FEATURES */}

                        <div className="brand-features">


                            <div className="feature-item">

                                <span className="feature-icon">
                                    ✓
                                </span>

                                <span>
                                    Manage your portfolio
                                </span>

                            </div>


                            <div className="feature-item">

                                <span className="feature-icon">
                                    ✓
                                </span>

                                <span>
                                    Update projects & skills
                                </span>

                            </div>


                            <div className="feature-item">

                                <span className="feature-icon">
                                    ✓
                                </span>

                                <span>
                                    Track contact messages
                                </span>

                            </div>


                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="brand-footer">

                        © {new Date().getFullYear()}
                        {" "}
                        Anish Qureshi

                    </div>

                </section>


                {/* =================================================
                    RIGHT LOGIN PANEL
                ================================================= */}

                <section className="login-form-panel">

                    <div className="login-form-wrapper">


                        {/* MOBILE LOGO */}

                        <div className="mobile-logo">
                            AQ
                        </div>


                        {/* WELCOME TEXT */}

                        <div className="welcome-text">

                            <span className="small-label">
                                ADMIN PORTAL
                            </span>


                            <h2>
                                Welcome back
                            </h2>


                            <p>
                                Sign in to manage your portfolio.
                            </p>

                        </div>


                        {/* =================================================
                            LOGIN FORM
                        ================================================= */}

                        <form
                            className="login-form"
                            onSubmit={handleSubmit}
                        >


                            {/* =================================================
                                EMAIL
                            ================================================= */}

                            <div className="input-group">

                                <label htmlFor="email">
                                    Email Address
                                </label>


                                <div className="input-wrapper">


                                    {/* EMAIL ICON */}

                                    <span className="input-icon">

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >

                                            <rect
                                                x="3"
                                                y="5"
                                                width="18"
                                                height="14"
                                                rx="2"
                                            />

                                            <path
                                                d="m3 7 9 6 9-6"
                                            />

                                        </svg>

                                    </span>


                                    {/* EMAIL INPUT */}

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PASSWORD
                            ================================================= */}

                            <div className="input-group">


                                <div className="password-label-row">

                                    <label htmlFor="password">
                                        Password
                                    </label>


                                    <span className="secure-text">
                                        Secure login
                                    </span>

                                </div>


                                <div className="input-wrapper">


                                    {/* PASSWORD ICON */}

                                    <span className="input-icon">

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >

                                            <rect
                                                x="4"
                                                y="10"
                                                width="16"
                                                height="11"
                                                rx="2"
                                            />

                                            <path
                                                d="M8 10V7a4 4 0 0 1 8 0v3"
                                            />

                                        </svg>

                                    </span>


                                    {/* PASSWORD INPUT */}

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />


                                    {/* SHOW / HIDE PASSWORD */}

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        {showPassword ? (

                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                            >

                                                <path d="M3 3l18 18" />

                                                <path
                                                    d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                                                />

                                                <path
                                                    d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8-0.5 1.5-1.4 2.8-2.5 3.9"
                                                />

                                                <path
                                                    d="M6.6 6.7C4.8 7.8 3.6 9.4 2 12c1.3 4 5 8 10 8 1 0 2-.2 2.9-.5"
                                                />

                                            </svg>

                                        ) : (

                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                            >

                                                <path
                                                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                                                />

                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="3"
                                                />

                                            </svg>

                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* =================================================
                                ERROR MESSAGE
                            ================================================= */}

                            {error && (

                                <div className="login-error">

                                    <span className="error-icon">
                                        !
                                    </span>

                                    <span>
                                        {error}
                                    </span>

                                </div>

                            )}


                            {/* =================================================
                                SIGN IN BUTTON
                            ================================================= */}

                            <button
                                type="submit"
                                className="sign-in-button"
                                disabled={loading}
                            >

                                {loading ? (

                                    <>

                                        <span className="spinner"></span>

                                        Signing in...

                                    </>

                                ) : (

                                    <>

                                        Sign in

                                        <span className="button-arrow">
                                            →
                                        </span>

                                    </>

                                )}

                            </button>

                        </form>


                        {/* =================================================
                            SECURITY BOX
                        ================================================= */}

                        <div className="security-box">


                            <div className="security-icon">

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >

                                    <path
                                        d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5-7-10V6l-7-3Z"
                                    />

                                    <path
                                        d="m9 12 2 2 4-4"
                                    />

                                </svg>

                            </div>


                            <div>

                                <strong>
                                    Secure Admin Access
                                </strong>

                                <span>
                                    Your session is protected with
                                    secure authentication.
                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            BOTTOM
                        ================================================= */}

                        <div className="login-bottom">

                            <span>
                                Portfolio Management System
                            </span>

                            <span className="dot">
                                •
                            </span>

                            <span>
                                v1.0
                            </span>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
};


export default AdminLogin;