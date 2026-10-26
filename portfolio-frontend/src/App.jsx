import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";


// =========================================================
// PUBLIC
// =========================================================

import Home from "./pages/Home";
import Projects from "./pages/Projects";


// =========================================================
// AUTH
// =========================================================

import AdminLogin from "./pages/admin/AdminLogin";


// =========================================================
// ADMIN
// =========================================================

import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";

import AdminProfile from "./pages/admin/AdminProfile";

import AdminProjects from "./pages/admin/AdminProjects";

import AdminSkills from "./pages/admin/AdminSkills";

import AdminEducation from "./pages/admin/AdminEducation";

import AdminCertificates from "./pages/admin/AdminCertificates";

import AdminExperience from "./pages/admin/AdminExperience";

import AdminMessages from "./pages/admin/AdminMessages";

import AdminSettings from "./pages/admin/AdminSettings";


// =========================================================
// APP
// =========================================================

function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =================================================
                    PUBLIC HOME
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <Home />
                    }
                />


                {/* =================================================
                    PUBLIC PROJECTS
                ================================================= */}

                <Route
                    path="/projects"
                    element={
                        <Projects />
                    }
                />


                {/* =================================================
                    PUBLIC ADMIN LOGIN
                ================================================= */}

                <Route
                    path="/admin/login"
                    element={
                        <AdminLogin />
                    }
                />


                {/* =================================================
                    PROTECTED ADMIN AREA
                ================================================= */}

                <Route
                    element={
                        <ProtectedRoute />
                    }
                >

                    <Route
                        path="/admin"
                        element={
                            <AdminLayout />
                        }
                    >


                        {/* =================================================
                            DASHBOARD
                        ================================================= */}

                        <Route
                            index
                            element={
                                <AdminDashboard />
                            }
                        />


                        {/* =================================================
                            PROFILE MANAGEMENT
                        ================================================= */}

                        <Route
                            path="profile"
                            element={
                                <AdminProfile />
                            }
                        />


                        {/* =================================================
                            PROJECTS MANAGEMENT
                        ================================================= */}

                        <Route
                            path="projects"
                            element={
                                <AdminProjects />
                            }
                        />


                        {/* =================================================
                            SKILLS MANAGEMENT
                        ================================================= */}

                        <Route
                            path="skills"
                            element={
                                <AdminSkills />
                            }
                        />


                        {/* =================================================
                            EDUCATION MANAGEMENT
                        ================================================= */}

                        <Route
                            path="education"
                            element={
                                <AdminEducation />
                            }
                        />


                        {/* =================================================
                            CERTIFICATES MANAGEMENT
                        ================================================= */}

                        <Route
                            path="certificates"
                            element={
                                <AdminCertificates />
                            }
                        />


                        {/* =================================================
                            EXPERIENCE MANAGEMENT
                        ================================================= */}

                        <Route
                            path="experience"
                            element={
                                <AdminExperience />
                            }
                        />


                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        <Route
                            path="messages"
                            element={
                                <AdminMessages />
                            }
                        />


                        {/* =================================================
                            SETTINGS
                        ================================================= */}

                        <Route
                            path="settings"
                            element={
                                <AdminSettings />
                            }
                        />


                    </Route>

                </Route>


                {/* =================================================
                    UNKNOWN ROUTES
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />


            </Routes>

        </BrowserRouter>
    );
}


export default App;