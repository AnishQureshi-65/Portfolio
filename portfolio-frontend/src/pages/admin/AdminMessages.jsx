import { useCallback, useEffect, useState } from "react";
import "./AdminMessages.css";

const API_URL = "http://localhost:6060/api/contact";

// ==========================================
// JWT AUTHORIZATION HEADERS
// AuthContext.jsx uses "adminToken"
// ==========================================
const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
};

function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // FETCH ALL CONTACT MESSAGES
    // ==========================================
    const fetchMessages = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            if (response.status === 401) {
                throw new Error(
                    "401 Unauthorized: Session expire ho gaya hai. Dobara admin login karein."
                );
            }

            if (response.status === 403) {
                throw new Error(
                    "403 Forbidden: Admin permission verify nahi hui. Token aur ROLE_ADMIN authority check karein."
                );
            }

            if (!response.ok) {
                throw new Error(
                    `Messages load nahi hue. HTTP ${response.status}`
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error(
                    "API response messages ki list nahi hai."
                );
            }

            setMessages(data);
        } catch (err) {
            setError(
                err.message ||
                "Backend se connect nahi ho pa raha. Backend running hai ya nahi check karein."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // ==========================================
    // INITIAL FETCH
    // ==========================================
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // ==========================================
    // READ / UNREAD STATUS
    // ==========================================
    const getIsRead = (message) =>
        message.read === true || message.read === "true";

    const unreadCount = messages.filter(
        (message) => !getIsRead(message)
    ).length;

    const readCount = messages.length - unreadCount;

    // ==========================================
    // RECENT MESSAGES: LAST 7 DAYS
    // ==========================================
    const recentCount = messages.filter((message) => {
        const createdAt =
            message.createdAt ?? message.created_at;

        if (!createdAt) {
            return false;
        }

        const date = new Date(createdAt);
        const now = new Date();
        const sevenDaysAgo = new Date(now);

        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return (
            !Number.isNaN(date.getTime()) &&
            date >= sevenDaysAgo &&
            date <= now
        );
    }).length;

    // ==========================================
    // FILTER MESSAGES
    // ==========================================
    const filteredMessages = messages.filter((message) => {
        if (activeFilter === "Unread") {
            return !getIsRead(message);
        }

        if (activeFilter === "Read") {
            return getIsRead(message);
        }

        return true;
    });

    // ==========================================
    // MARK MESSAGE AS READ / UNREAD
    // ==========================================
    const updateReadStatus = async (message) => {
        const action = getIsRead(message)
            ? "unread"
            : "read";

        try {
            const response = await fetch(
                `${API_URL}/${message.id}/${action}`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                }
            );

            if (response.status === 401) {
                throw new Error(
                    "401 Unauthorized: Dobara admin login karein."
                );
            }

            if (response.status === 403) {
                throw new Error(
                    "403 Forbidden: Aapke admin account ko permission nahi mili."
                );
            }

            if (!response.ok) {
                throw new Error(
                    `Message status update nahi hua. HTTP ${response.status}`
                );
            }

            await fetchMessages();
        } catch (err) {
            window.alert(err.message);
        }
    };

    // ==========================================
    // DELETE MESSAGE
    // ==========================================
    const deleteMessage = async (id) => {
        const confirmed = window.confirm(
            "Kya aap is message ko permanently delete karna chahte hain?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                }
            );

            if (response.status === 401) {
                throw new Error(
                    "401 Unauthorized: Dobara admin login karein."
                );
            }

            if (response.status === 403) {
                throw new Error(
                    "403 Forbidden: Aapke admin account ko permission nahi mili."
                );
            }

            if (!response.ok) {
                throw new Error(
                    `Message delete nahi hua. HTTP ${response.status}`
                );
            }

            await fetchMessages();
        } catch (err) {
            window.alert(err.message);
        }
    };

    // ==========================================
    // UI
    // ==========================================
    return (
        <div className="admin-messages-page">

            {/* HEADER */}
            <section className="messages-page-header">
                <div className="messages-header-left">
                    <div className="messages-title-icon">
                        ✉
                    </div>

                    <div>
                        <div className="messages-eyebrow">
                            ADMIN PANEL
                        </div>

                        <h1>Messages</h1>

                        <p>
                            Manage contact messages and portfolio inquiries.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="messages-refresh-btn"
                    onClick={fetchMessages}
                    disabled={loading}
                >
                    <span>↻</span>
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </section>

            {/* STATISTICS */}
            <section className="messages-stats-grid">
                <div className="message-stat-card">
                    <div className="message-stat-icon blue">
                        ✉
                    </div>

                    <div>
                        <span>Total Messages</span>
                        <strong>{messages.length}</strong>
                    </div>
                </div>

                <div className="message-stat-card">
                    <div className="message-stat-icon gold">
                        ●
                    </div>

                    <div>
                        <span>Unread</span>
                        <strong>{unreadCount}</strong>
                    </div>
                </div>

                <div className="message-stat-card">
                    <div className="message-stat-icon teal">
                        ✓
                    </div>

                    <div>
                        <span>Read</span>
                        <strong>{readCount}</strong>
                    </div>
                </div>

                <div className="message-stat-card">
                    <div className="message-stat-icon purple">
                        ↗
                    </div>

                    <div>
                        <span>Recent (7 days)</span>
                        <strong>{recentCount}</strong>
                    </div>
                </div>
            </section>

            {/* MESSAGE LIST */}
            <section className="messages-list-section">
                <div className="messages-list-header">
                    <div>
                        <div className="messages-eyebrow">
                            INBOX
                        </div>

                        <h2>Contact Messages</h2>

                        <p>
                            Messages received through your portfolio contact form.
                        </p>
                    </div>

                    <div className="messages-filters">
                        {["All", "Unread", "Read"].map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                className={
                                    activeFilter === filter
                                        ? "message-filter active"
                                        : "message-filter"
                                }
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div
                        className="messages-error"
                        role="alert"
                    >
                        <strong>
                            Messages load nahi hue
                        </strong>

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={fetchMessages}
                            disabled={loading}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* LOADING */}
                {loading && (
                    <div className="messages-empty">
                        <h3>Loading messages...</h3>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading &&
                    !error &&
                    filteredMessages.length === 0 && (
                        <div className="messages-empty">
                            <div className="messages-empty-icon">
                                ✉
                            </div>

                            <h3>
                                {messages.length === 0
                                    ? "No Messages Yet"
                                    : `No ${activeFilter} Messages`}
                            </h3>

                            <p>
                                {messages.length === 0
                                    ? "Your portfolio contact messages will appear here."
                                    : "Try selecting another filter."}
                            </p>
                        </div>
                    )}

                {/* MESSAGE CARDS */}
                {!loading &&
                    !error &&
                    filteredMessages.length > 0 && (
                        <div className="messages-cards">
                            {filteredMessages.map((message) => {
                                const isRead = getIsRead(message);

                                const createdAt =
                                    message.createdAt ??
                                    message.created_at;

                                const parsedDate = createdAt
                                    ? new Date(createdAt)
                                    : null;

                                return (
                                    <article
                                        className="contact-message-card"
                                        key={message.id}
                                    >
                                        <div className="contact-message-top">
                                            <div>
                                                <h3>
                                                    {message.subject ||
                                                        "(No subject)"}
                                                </h3>

                                                <p>
                                                    From:{" "}
                                                    <strong>
                                                        {message.name ||
                                                            "Unknown"}
                                                    </strong>
                                                </p>

                                                <p>
                                                    Email:{" "}
                                                    {message.email ? (
                                                        <a
                                                            href={`mailto:${message.email}`}
                                                        >
                                                            {message.email}
                                                        </a>
                                                    ) : (
                                                        "Not provided"
                                                    )}
                                                </p>
                                            </div>

                                            <span
                                                className={
                                                    isRead
                                                        ? "message-status read"
                                                        : "message-status unread"
                                                }
                                            >
                                                {isRead
                                                    ? "Read"
                                                    : "Unread"}
                                            </span>
                                        </div>

                                        <p className="contact-message-body">
                                            {message.message ||
                                                "No message content."}
                                        </p>

                                        <div className="contact-message-footer">
                                            <small>
                                                {parsedDate &&
                                                !Number.isNaN(
                                                    parsedDate.getTime()
                                                )
                                                    ? parsedDate.toLocaleString()
                                                    : "Date unavailable"}
                                            </small>

                                            <div className="contact-message-actions">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateReadStatus(message)
                                                    }
                                                >
                                                    Mark as{" "}
                                                    {isRead
                                                        ? "Unread"
                                                        : "Read"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteMessage(message.id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
            </section>
        </div>
    );
}

export default AdminMessages;