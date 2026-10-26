import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const API_URL = "http://localhost:6060/api/admin/dashboard";

const AdminDashboard = () => {
    const { admin, token } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    // ==========================================
    // FETCH DASHBOARD STATISTICS
    // ==========================================

    const fetchDashboardStats = useCallback(
        async (signal) => {
            if (!token) {
                setStats(null);
                setError("Admin authentication token not found.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(API_URL, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    signal,
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error(
                            "Your session has expired. Please log in again."
                        );
                    }

                    if (response.status === 403) {
                        throw new Error(
                            "You do not have permission to access this dashboard."
                        );
                    }

                    throw new Error(
                        `Dashboard request failed (${response.status}).`
                    );
                }

                // Handle empty or invalid JSON responses safely.
                const responseText = await response.text();

                if (!responseText.trim()) {
                    throw new Error(
                        "The dashboard API returned an empty response."
                    );
                }

                let data;

                try {
                    data = JSON.parse(responseText);
                } catch {
                    throw new Error(
                        "The dashboard API returned invalid JSON."
                    );
                }

                if (
                    !data ||
                    typeof data !== "object" ||
                    Array.isArray(data)
                ) {
                    throw new Error(
                        "The dashboard API returned an unexpected data format."
                    );
                }

                if (signal.aborted) {
                    return;
                }

                setStats(data);
                setError("");
            } catch (err) {
                if (err.name === "AbortError") {
                    return;
                }

                console.error("Dashboard API Error:", err);

                setError(
                    err.message ||
                    "Unable to load dashboard statistics. Please try again."
                );
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        },
        [token]
    );

    // ==========================================
    // LOAD DATA AND CLEAN UP REQUEST
    // ==========================================

    useEffect(() => {
        const controller = new AbortController();

        fetchDashboardStats(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchDashboardStats, refreshKey]);

    // ==========================================
    // REFRESH DASHBOARD
    // ==========================================

    const handleRefresh = () => {
        if (loading) return;

        setRefreshKey((previous) => previous + 1);
    };

    // ==========================================
    // SAFE COUNT HELPER
    // ==========================================

    const getCount = (section, field = "total") => {
        const sectionData = stats?.[section];

        if (
            !sectionData ||
            typeof sectionData !== "object" ||
            Array.isArray(sectionData)
        ) {
            return 0;
        }

        const value = sectionData[field];

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0;
        }

        const numericValue = Number(value);

        return Number.isFinite(numericValue) && numericValue >= 0
            ? numericValue
            : 0;
    };

    // ==========================================
    // MAIN STATISTICS CARDS
    // ==========================================

    const statCards = [
        {
            title: "Projects",
            value: getCount("projects"),
            icon: "◆",
            description: "Portfolio projects",
            path: "/admin/projects",
        },
        {
            title: "Skills",
            value: getCount("skills"),
            icon: "✦",
            description: "Technical skills",
            path: "/admin/skills",
        },
        {
            title: "Experience",
            value: getCount("experiences"),
            icon: "◫",
            description: "Experience records",
            path: "/admin/experience",
        },
        {
            title: "Messages",
            value: getCount("messages"),
            icon: "✉",
            description: "Contact submissions",
            path: "/admin/messages",
        },
    ];

    // ==========================================
    // QUICK ACCESS CARDS
    // ==========================================

    const quickCards = [
        {
            title: "Projects",
            icon: "◆",
            description: `${getCount("projects")} projects in your portfolio.`,
            path: "/admin/projects",
        },
        {
            title: "Skills",
            icon: "✦",
            description: `${getCount("skills")} skills added to your profile.`,
            path: "/admin/skills",
        },
        {
            title: "Profile",
            icon: "◉",
            description: `${getCount("profile")} profile record(s) available.`,
            path: "/admin/profile",
        },
        {
            title: "Education",
            icon: "▣",
            description: `${getCount("education")} education records.`,
            path: "/admin/education",
        },
        {
            title: "Certificates",
            icon: "◇",
            description: `${getCount("certificates")} certificates.`,
            path: "/admin/certificates",
        },
        {
            title: "Experience",
            icon: "◫",
            description: `${getCount("experiences")} experience records.`,
            path: "/admin/experience",
        },
        {
            title: "Contact Messages",
            icon: "✉",
            description: `${getCount("messages", "unread")} unread messages.`,
            path: "/admin/messages",
        },
    ];

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="admin-dashboard">

            {/* HEADER */}

            <header className="dashboard-header">
                <div className="dashboard-heading-content">
                    <span className="dashboard-label">
                        ADMIN DASHBOARD
                    </span>

                    <h1>
                        Welcome back, {admin?.username || "Admin"}
                    </h1>

                    <p>
                        Manage your portfolio from one place.
                    </p>
                </div>

                <div className="dashboard-header-actions">
                    <div
                        className={`dashboard-status ${
                            error ? "status-error" : ""
                        }`}
                        role="status"
                        aria-live="polite"
                    >
                        <span className="status-dot" />

                        {loading
                            ? "Checking system..."
                            : error
                              ? "Connection issue"
                              : "System Online"}
                    </div>

                    <button
                        type="button"
                        className="dashboard-refresh-btn"
                        onClick={handleRefresh}
                        disabled={loading}
                        aria-label="Refresh dashboard statistics"
                    >
                        <span
                            className={
                                loading ? "refresh-spinning" : ""
                            }
                            aria-hidden="true"
                        >
                            ↻
                        </span>

                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </header>

            {/* ERROR MESSAGE */}

            {error && (
                <div
                    className="dashboard-error"
                    role="alert"
                >
                    <span
                        className="dashboard-error-icon"
                        aria-hidden="true"
                    >
                        !
                    </span>

                    <div>
                        <strong>Dashboard unavailable</strong>
                        <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* MAIN STATISTICS */}

            <section
                className="dashboard-stats"
                aria-label="Portfolio statistics"
                aria-busy={loading}
            >
                {statCards.map((card) => (
                    <Link
                        to={card.path}
                        className="stat-card"
                        key={card.title}
                        aria-label={`${card.title}: ${
                            loading ? "Loading" : card.value
                        }`}
                    >
                        <div className="stat-card-top">
                            <span
                                className="stat-icon"
                                aria-hidden="true"
                            >
                                {card.icon}
                            </span>

                            <span
                                className="stat-card-arrow"
                                aria-hidden="true"
                            >
                                ↗
                            </span>
                        </div>

                        <div className="stat-card-info">
                            <span className="stat-card-title">
                                {card.title}
                            </span>

                            <strong className="stat-card-value">
                                {loading ? "..." : card.value}
                            </strong>

                            <span className="stat-card-description">
                                {card.description}
                            </span>
                        </div>
                    </Link>
                ))}
            </section>

            {/* WELCOME BANNER */}

            <section className="dashboard-welcome">
                <div className="dashboard-welcome-content">
                    <span className="welcome-eyebrow">
                        PORTFOLIO MANAGEMENT
                    </span>

                    <h2>Your portfolio command center.</h2>

                    <p>
                        Manage your profile, projects, skills, education,
                        certificates, experience and contact messages from
                        one central dashboard.
                    </p>

                    <Link
                        to="/admin/profile"
                        className="welcome-action"
                    >
                        Manage your profile <span>↗</span>
                    </Link>
                </div>

                <div
                    className="welcome-logo"
                    role="img"
                    aria-label="AQ monogram"
                >
                    AQ
                </div>
            </section>

            {/* QUICK ACCESS */}

            <section className="quick-section">
                <div className="section-heading">
                    <div>
                        <span>QUICK ACCESS</span>
                        <h2>Manage Portfolio</h2>
                    </div>

                    <span className="section-heading-note">
                        {quickCards.length} management sections
                    </span>
                </div>

                <div className="quick-grid">
                    {quickCards.map((card) => (
                        <Link
                            to={card.path}
                            className="quick-card"
                            key={card.title}
                        >
                            <div className="quick-card-top">
                                <span
                                    className="quick-icon"
                                    aria-hidden="true"
                                >
                                    {card.icon}
                                </span>

                                <span
                                    className="quick-card-arrow"
                                    aria-hidden="true"
                                >
                                    ↗
                                </span>
                            </div>

                            <div className="quick-card-content">
                                <h3>{card.title}</h3>

                                <p>
                                    {loading
                                        ? "Loading information..."
                                        : error
                                          ? "Statistics unavailable."
                                          : card.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ADDITIONAL STATISTICS */}

            <section className="additional-stats-section">
                <div className="section-heading">
                    <div>
                        <span>AT A GLANCE</span>
                        <h2>Portfolio Overview</h2>
                    </div>
                </div>

                <div
                    className="additional-stats-grid"
                    aria-busy={loading}
                >
                    <div className="overview-card">
                        <span
                            className="overview-icon"
                            aria-hidden="true"
                        >
                            ▣
                        </span>

                        <div>
                            <span>Education</span>

                            <strong>
                                {loading ? "..." : getCount("education")}
                            </strong>

                            <p>Education records</p>
                        </div>
                    </div>

                    <div className="overview-card">
                        <span
                            className="overview-icon"
                            aria-hidden="true"
                        >
                            ◇
                        </span>

                        <div>
                            <span>Certificates</span>

                            <strong>
                                {loading ? "..." : getCount("certificates")}
                            </strong>

                            <p>Certificates added</p>
                        </div>
                    </div>

                    <div className="overview-card">
                        <span
                            className="overview-icon"
                            aria-hidden="true"
                        >
                            ✉
                        </span>

                        <div>
                            <span>Unread Messages</span>

                            <strong>
                                {loading
                                    ? "..."
                                    : getCount("messages", "unread")}
                            </strong>

                            <p>Messages awaiting review</p>
                        </div>
                    </div>

                    <div className="overview-card">
                        <span
                            className="overview-icon"
                            aria-hidden="true"
                        >
                            ◫
                        </span>

                        <div>
                            <span>Current Experience</span>

                            <strong>
                                {loading
                                    ? "..."
                                    : getCount("experiences", "current")}
                            </strong>

                            <p>Current experience records</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AdminDashboard;