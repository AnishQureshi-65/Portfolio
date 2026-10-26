import { useState } from "react";
import "./AdminSettings.css";

function AdminSettings() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [publicProfile, setPublicProfile] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2500);
    };

    return (
        <div className="admin-settings-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <section className="settings-page-header">

                <div className="settings-header-left">

                    <div className="settings-title-icon">
                        ⚙
                    </div>

                    <div>
                        <div className="settings-eyebrow">
                            ADMIN PANEL
                        </div>

                        <h1>Settings</h1>

                        <p>
                            Manage portfolio and administrator preferences.
                        </p>
                    </div>

                </div>

            </section>

            {/* ==========================================
                SUCCESS
            ========================================== */}

            {saved && (
                <div className="settings-success">
                    <span>✓</span>
                    Settings saved successfully.
                </div>
            )}

            {/* ==========================================
                GENERAL SETTINGS
            ========================================== */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div className="settings-section-icon">
                        ◉
                    </div>

                    <div>
                        <h2>General Settings</h2>

                        <p>
                            Configure the basic behavior of your portfolio.
                        </p>
                    </div>

                </div>

                <div className="settings-options">

                    {/* PUBLIC PROFILE */}

                    <div className="setting-row">

                        <div className="setting-row-info">

                            <div className="setting-row-icon blue">
                                ◉
                            </div>

                            <div>
                                <h3>Public Profile</h3>

                                <p>
                                    Allow visitors to view your portfolio
                                    profile.
                                </p>
                            </div>

                        </div>

                        <label className="settings-toggle">

                            <input
                                type="checkbox"
                                checked={publicProfile}
                                onChange={(event) =>
                                    setPublicProfile(
                                        event.target.checked
                                    )
                                }
                            />

                            <span className="settings-toggle-track">
                                <span />
                            </span>

                        </label>

                    </div>

                    {/* MAINTENANCE */}

                    <div className="setting-row">

                        <div className="setting-row-info">

                            <div className="setting-row-icon gold">
                                ⚠
                            </div>

                            <div>
                                <h3>Maintenance Mode</h3>

                                <p>
                                    Temporarily hide the public portfolio
                                    while making changes.
                                </p>
                            </div>

                        </div>

                        <label className="settings-toggle">

                            <input
                                type="checkbox"
                                checked={maintenanceMode}
                                onChange={(event) =>
                                    setMaintenanceMode(
                                        event.target.checked
                                    )
                                }
                            />

                            <span className="settings-toggle-track">
                                <span />
                            </span>

                        </label>

                    </div>

                    {/* EMAIL */}

                    <div className="setting-row">

                        <div className="setting-row-info">

                            <div className="setting-row-icon teal">
                                ✉
                            </div>

                            <div>
                                <h3>Email Notifications</h3>

                                <p>
                                    Receive notifications when someone
                                    submits the contact form.
                                </p>
                            </div>

                        </div>

                        <label className="settings-toggle">

                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(event) =>
                                    setEmailNotifications(
                                        event.target.checked
                                    )
                                }
                            />

                            <span className="settings-toggle-track">
                                <span />
                            </span>

                        </label>

                    </div>

                </div>

            </section>

            {/* ==========================================
                PORTFOLIO INFORMATION
            ========================================== */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div className="settings-section-icon">
                        ◇
                    </div>

                    <div>
                        <h2>Portfolio Information</h2>

                        <p>
                            Basic information used throughout the admin
                            dashboard.
                        </p>
                    </div>

                </div>

                <div className="settings-info-grid">

                    <div className="settings-info-box">

                        <span>Frontend</span>

                        <strong>React + Vite</strong>

                    </div>

                    <div className="settings-info-box">

                        <span>Backend</span>

                        <strong>Spring Boot</strong>

                    </div>

                    <div className="settings-info-box">

                        <span>Database</span>

                        <strong>PostgreSQL</strong>

                    </div>

                    <div className="settings-info-box">

                        <span>API Port</span>

                        <strong>6060</strong>

                    </div>

                </div>

            </section>

            {/* ==========================================
                SECURITY
            ========================================== */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div className="settings-section-icon">
                        ◈
                    </div>

                    <div>
                        <h2>Security</h2>

                        <p>
                            Administrator account and authentication settings.
                        </p>
                    </div>

                </div>

                <div className="security-row">

                    <div>
                        <h3>Administrator Authentication</h3>

                        <p>
                            Your admin dashboard is protected by
                            authenticated access.
                        </p>
                    </div>

                    <span className="security-status">
                        <span>●</span>
                        Protected
                    </span>

                </div>

            </section>

            {/* ==========================================
                SAVE
            ========================================== */}

            <div className="settings-actions">

                <button
                    type="button"
                    className="settings-save-btn"
                    onClick={handleSave}
                >
                    <span>✓</span>
                    Save Settings
                </button>

            </div>

        </div>
    );
}

export default AdminSettings;