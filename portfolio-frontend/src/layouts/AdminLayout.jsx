import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const AdminLayout = () => {

    const navigate = useNavigate();

    const {
        admin,
        logout
    } = useAuth();


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        logout();

        navigate("/admin/login", {
            replace: true
        });
    };


    // =========================================================
    // NAVIGATION
    // =========================================================

    const menuItems = [

        {
            path: "/admin",
            label: "Dashboard",
            icon: "⌂",
            end: true
        },

        {
            path: "/admin/profile",
            label: "Profile",
            icon: "◉"
        },

        {
            path: "/admin/projects",
            label: "Projects",
            icon: "◆"
        },

        {
            path: "/admin/skills",
            label: "Skills",
            icon: "✦"
        },

        {
            path: "/admin/education",
            label: "Education",
            icon: "▣"
        },

        {
            path: "/admin/certificates",
            label: "Certificates",
            icon: "◇"
        },

        {
            path: "/admin/experience",
            label: "Experience",
            icon: "◫"
        },

        {
            path: "/admin/messages",
            label: "Messages",
            icon: "✉"
        },

        {
            path: "/admin/settings",
            label: "Settings",
            icon: "⚙"
        }

    ];


    return (

        <div className="admin-layout">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-sidebar">


                {/* BRAND */}

                <div className="admin-brand">

                    <div className="admin-brand-logo">
                        AQ
                    </div>

                    <div className="admin-brand-text">

                        <strong>
                            Anish Qureshi
                        </strong>

                        <span>
                            Portfolio Admin
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="admin-navigation">

                    <div className="nav-section-title">
                        MAIN MENU
                    </div>


                    {menuItems.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                isActive
                                    ? "admin-nav-link active"
                                    : "admin-nav-link"
                            }
                        >

                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>

                        </NavLink>

                    ))}

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">


                    <div className="admin-user-card">

                        <div className="admin-avatar">
                            {admin?.username
                                ?.charAt(0)
                                ?.toUpperCase() || "A"}
                        </div>


                        <div className="admin-user-info">

                            <strong>
                                {admin?.username || "Admin"}
                            </strong>

                            <span>
                                {admin?.email || "Administrator"}
                            </span>

                        </div>

                    </div>


                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <span>
                            ⇥
                        </span>

                        Logout

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN AREA
            ================================================= */}

            <main className="admin-main">

                <Outlet />

            </main>


        </div>
    );
};


export default AdminLayout;