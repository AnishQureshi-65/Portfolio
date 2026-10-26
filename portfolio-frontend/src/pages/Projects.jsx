import React, { useEffect, useState } from "react";
import "./Projects.css";

const API_BASE_URL = "http://localhost:6060";

function Projects() {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD PROJECTS
    // =========================================================

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/projects`
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to load projects. Status: ${response.status}`
                );
            }

            const data = await response.json();

            setProjects(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Fetch projects error:",
                err
            );

            setError(
                err.message ||
                "Unable to load projects."
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // IMAGE URL
    // =========================================================

    const getImageUrl = (imageUrl) => {

        if (!imageUrl) {
            return "";
        }

        if (
            imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
        ) {
            return imageUrl;
        }

        return `${API_BASE_URL}${
            imageUrl.startsWith("/")
                ? ""
                : "/"
        }${imageUrl}`;
    };

    // =========================================================
    // TECHNOLOGIES
    // =========================================================

    const getTechnologies = (technologies) => {

        if (!technologies) {
            return [];
        }

        return technologies
            .split(",")
            .map((technology) =>
                technology.trim()
            )
            .filter(Boolean);
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <main className="projects-page">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="projects-hero">

                <div className="projects-hero-content">

                    <span className="projects-eyebrow">
                        MY WORK
                    </span>

                    <h1>
                        Projects
                    </h1>

                    <p>
                        A collection of projects I have
                        built using Java, Spring Boot,
                        React, AI/ML and modern web
                        technologies.
                    </p>

                </div>

            </section>

            {/* =================================================
                PROJECTS SECTION
            ================================================= */}

            <section className="projects-section">

                <div className="projects-section-header">

                    <div>

                        <span className="section-eyebrow">
                            FEATURED WORK
                        </span>

                        <h2>
                            Things I've Built
                        </h2>

                    </div>

                    {!loading &&
                        !error &&
                        projects.length > 0 && (

                        <span className="projects-count">
                            {projects.length} Project
                            {projects.length !== 1
                                ? "s"
                                : ""}
                        </span>
                    )}

                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className="projects-state">

                        <div className="projects-loader">
                        </div>

                        <h3>
                            Loading Projects
                        </h3>

                        <p>
                            Please wait while we load
                            the projects.
                        </p>

                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (

                    <div className="projects-state error-state">

                        <div className="state-icon">
                            !
                        </div>

                        <h3>
                            Unable to Load Projects
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchProjects}
                            className="retry-button"
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    projects.length === 0 && (

                    <div className="projects-state empty-state">

                        <div className="state-icon">
                            ◇
                        </div>

                        <h3>
                            No Projects Yet
                        </h3>

                        <p>
                            Projects will appear here
                            once they are added from
                            the admin panel.
                        </p>

                    </div>
                )}

                {/* =================================================
                    PROJECT GRID
                ================================================= */}

                {!loading &&
                    !error &&
                    projects.length > 0 && (

                    <div className="public-projects-grid">

                        {projects.map((project) => {

                            const imageUrl =
                                getImageUrl(
                                    project.imageUrl
                                );

                            const technologies =
                                getTechnologies(
                                    project.technologies
                                );

                            return (

                                <article
                                    className="public-project-card"
                                    key={project.id}
                                >

                                    {/* =========================
                                        IMAGE
                                    ========================= */}

                                    <div className="public-project-image">

                                        {imageUrl ? (

                                            <img
                                                src={imageUrl}
                                                alt={
                                                    project.title ||
                                                    "Project"
                                                }
                                                loading="lazy"
                                                onError={(event) => {

                                                    event.currentTarget.style.display =
                                                        "none";

                                                    const parent =
                                                        event.currentTarget
                                                            .parentElement;

                                                    if (parent) {

                                                        parent.classList.add(
                                                            "image-error"
                                                        );

                                                    }

                                                }}
                                            />

                                        ) : (

                                            <div className="project-image-placeholder">

                                                <span>
                                                    ◇
                                                </span>

                                                <p>
                                                    Project
                                                </p>

                                            </div>
                                        )}

                                        {/* FEATURED */}

                                        {project.featured && (

                                            <span className="public-featured-badge">
                                                ★ Featured
                                            </span>
                                        )}

                                        {/* PROJECT TYPE */}

                                        {project.projectType && (

                                            <span className="public-project-type">
                                                {
                                                    project.projectType
                                                }
                                            </span>
                                        )}

                                    </div>

                                    {/* =========================
                                        CONTENT
                                    ========================= */}

                                    <div className="public-project-content">

                                        <h3>
                                            {project.title}
                                        </h3>

                                        {project.description && (

                                            <p className="public-project-description">
                                                {
                                                    project.description
                                                }
                                            </p>
                                        )}

                                        {/* TECHNOLOGIES */}

                                        {technologies.length >
                                            0 && (

                                            <div className="public-technologies">

                                                {technologies.map(
                                                    (
                                                        technology,
                                                        index
                                                    ) => (

                                                        <span
                                                            key={`${technology}-${index}`}
                                                        >
                                                            {
                                                                technology
                                                            }
                                                        </span>
                                                    )
                                                )}

                                            </div>
                                        )}

                                        {/* LINKS */}

                                        <div className="public-project-links">

                                            {project.githubUrl && (

                                                <a
                                                    href={
                                                        project.githubUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="public-project-link github-project-link"
                                                >
                                                    <span>
                                                        GitHub
                                                    </span>

                                                    <span>
                                                        ↗
                                                    </span>
                                                </a>
                                            )}

                                            {project.liveUrl && (

                                                <a
                                                    href={
                                                        project.liveUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="public-project-link live-project-link"
                                                >
                                                    <span>
                                                        Live Demo
                                                    </span>

                                                    <span>
                                                        ↗
                                                    </span>
                                                </a>
                                            )}

                                        </div>

                                    </div>

                                </article>
                            );
                        })}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Projects;