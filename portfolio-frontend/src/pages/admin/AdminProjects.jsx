
import { useCallback, useEffect, useState } from "react";
import "./AdminProjects.css";

const API_URL = "http://localhost:6060/api/projects";

const EMPTY_PROJECT = {
    title: "",
    description: "",
    imageUrl: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    featured: false,
};

function getErrorMessage(error, fallback) {
    return error?.message || fallback;
}

export default function AdminProjects() {
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState(EMPTY_PROJECT);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);

    const getHeaders = () => ({
        "Content-Type": "application/json",
        ...(localStorage.getItem("token")
            ? {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
            : {}),
    });

    const loadProjects = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error(
                    `Projects load nahi hue (${response.status}).`
                );
            }

            const data = await response.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            setMessage({
                type: "error",
                text: getErrorMessage(
                    error,
                    "Projects load karne mein error aaya."
                ),
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const updateField = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm({ ...EMPTY_PROJECT });
        setMessage(null);
        setShowForm(true);
    };

    const openEditForm = (project) => {
        setEditingId(project.id);

        setForm({
            title: project.title || "",
            description: project.description || "",
            imageUrl: project.imageUrl || "",
            technologies: Array.isArray(project.technologies)
                ? project.technologies.join(", ")
                : project.technologies || "",
            githubUrl: project.githubUrl || "",
            liveUrl: project.liveUrl || "",
            featured: Boolean(project.featured),
        });

        setMessage(null);
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingId(null);
        setForm({ ...EMPTY_PROJECT });
    };

    const saveProject = async (event) => {
        event.preventDefault();

        if (saving) return;

        setSaving(true);
        setMessage(null);

        // Backend Project entity mein technologies String hai.
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            imageUrl: form.imageUrl.trim(),
            technologies: form.technologies
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .join(", "),
            githubUrl: form.githubUrl.trim(),
            liveUrl: form.liveUrl.trim(),
            featured: form.featured,
        };

        try {
            const isEditing = editingId !== null;

            const response = await fetch(
                isEditing ? `${API_URL}/${editingId}` : API_URL,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: getHeaders(),
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const responseText = await response.text();

                throw new Error(
                    responseText ||
                    `Project save nahi hua (${response.status}).`
                );
            }

            setShowForm(false);
            setEditingId(null);
            setForm({ ...EMPTY_PROJECT });

            await loadProjects();

            setMessage({
                type: "success",
                text: isEditing
                    ? "Project successfully update ho gaya!"
                    : "New project successfully add ho gaya!",
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: getErrorMessage(
                    error,
                    "Project save karte waqt error aaya."
                ),
            });
        } finally {
            setSaving(false);
        }
    };

    const deleteProject = async (project) => {
        const confirmed = window.confirm(
            `"${project.title}" project delete karna chahte ho?`
        );

        if (!confirmed) return;

        setDeletingId(project.id);
        setMessage(null);

        try {
            const response = await fetch(`${API_URL}/${project.id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });

            if (!response.ok) {
                const responseText = await response.text();

                throw new Error(
                    responseText ||
                    `Project delete nahi hua (${response.status}).`
                );
            }

            setProjects((previous) =>
                previous.filter((item) => item.id !== project.id)
            );

            setMessage({
                type: "success",
                text: "Project successfully delete ho gaya!",
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: getErrorMessage(
                    error,
                    "Project delete karte waqt error aaya."
                ),
            });
        } finally {
            setDeletingId(null);
        }
    };

    const filteredProjects = projects.filter((project) => {
        const technologies = Array.isArray(project.technologies)
            ? project.technologies.join(" ")
            : project.technologies || "";

        const searchableText = [
            project.title,
            project.description,
            technologies,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(search.toLowerCase());
    });

    return (
        <main className="admin-projects">
            <header className="projects-page-header">
                <div>
                    <span className="projects-eyebrow">
                        PORTFOLIO MANAGEMENT
                    </span>

                    <h1>Projects <span>Studio</span></h1>

                    <p>
                        Apne portfolio ke projects ko manage aur update karo.
                    </p>
                </div>

                <button
                    type="button"
                    className="projects-add-button"
                    onClick={openAddForm}
                >
                    <span aria-hidden="true">＋</span> Add Project
                </button>
            </header>

            {message && (
                <div
                    className={`projects-alert ${message.type}`}
                    role="status"
                >
                    <span aria-hidden="true">
                        {message.type === "success" ? "✓" : "!"}
                    </span>
                    {message.text}

                    <button
                        type="button"
                        onClick={() => setMessage(null)}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="projects-stats">
                <article className="projects-stat-card">
                    <span className="projects-stat-icon">▦</span>
                    <div>
                        <span>Total Projects</span>
                        <strong>{projects.length}</strong>
                    </div>
                </article>

                <article className="projects-stat-card">
                    <span className="projects-stat-icon">✦</span>
                    <div>
                        <span>Featured Projects</span>
                        <strong>
                            {projects.filter((p) => p.featured).length}
                        </strong>
                    </div>
                </article>

                <article className="projects-stat-card">
                    <span className="projects-stat-icon">⌕</span>
                    <div>
                        <span>Search Results</span>
                        <strong>{filteredProjects.length}</strong>
                    </div>
                </article>
            </section>

            <section className="projects-content">
                <div className="projects-toolbar">
                    <div>
                        <h2>Your Projects</h2>
                        <p>Manage your work and showcase your skills.</p>
                    </div>

                    <label className="projects-search">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search projects"
                        />
                    </label>
                </div>

                {loading ? (
                    <div className="projects-state">
                        <span className="projects-spinner" />
                        <p>Projects load ho rahe hain...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="projects-state">
                        <span className="projects-empty-icon">▧</span>
                        <h3>
                            {search
                                ? "No matching projects"
                                : "No projects added yet"}
                        </h3>
                        <p>
                            {search
                                ? "Search term change karke try karo."
                                : "Apna first portfolio project add karo."}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                className="projects-add-button"
                                onClick={openAddForm}
                            >
                                ＋ Add First Project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="projects-grid">
                        {filteredProjects.map((project) => {
                            const technologies = Array.isArray(
                                project.technologies
                            )
                                ? project.technologies
                                : String(project.technologies || "")
                                    .split(",");

                            return (
                                <article
                                    className="project-admin-card"
                                    key={project.id}
                                >
                                    <div className="project-card-image">
                                        {project.imageUrl ? (
                                            <img
                                                src={project.imageUrl}
                                                alt={`${project.title} preview`}
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : null}

                                        <span className="project-image-label">
                                            PROJECT PREVIEW
                                        </span>

                                        {project.featured && (
                                            <span className="project-featured-badge">
                                                ✦ Featured
                                            </span>
                                        )}
                                    </div>

                                    <div className="project-card-body">
                                        <h3>{project.title}</h3>

                                        <p className="project-card-description">
                                            {project.description ||
                                                "No description provided."}
                                        </p>

                                        <div className="project-tech-list">
                                            {technologies
                                                .map((technology) => technology.trim())
                                                .filter(Boolean)
                                                .slice(0, 5)
                                                .map((technology, index) => (
                                                    <span key={`${technology}-${index}`}>
                                                        {technology}
                                                    </span>
                                                ))}
                                        </div>

                                        <div className="project-card-links">
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    GitHub ↗
                                                </a>
                                            )}

                                            {project.liveUrl && (
                                                <a
                                                    href={project.liveUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Live Demo ↗
                                                </a>
                                            )}
                                        </div>

                                        <div className="project-card-actions">
                                            <button
                                                type="button"
                                                className="project-edit-button"
                                                onClick={() =>
                                                    openEditForm(project)
                                                }
                                            >
                                                ✎ Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="project-delete-button"
                                                onClick={() =>
                                                    deleteProject(project)
                                                }
                                                disabled={
                                                    deletingId === project.id
                                                }
                                            >
                                                {deletingId === project.id
                                                    ? "Deleting..."
                                                    : "⌫ Delete"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {showForm && (
                <div
                    className="projects-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeForm();
                        }
                    }}
                >
                    <section
                        className="projects-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="project-form-title"
                    >
                        <header className="projects-modal-header">
                            <div>
                                <span className="projects-eyebrow">
                                    PROJECT DETAILS
                                </span>

                                <h2 id="project-form-title">
                                    {editingId !== null
                                        ? "Edit Project"
                                        : "Add New Project"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="projects-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </header>

                        <form
                            className="projects-form"
                            onSubmit={saveProject}
                        >
                            <div className="projects-form-grid">
                                <label className="projects-field full">
                                    <span>Project Title *</span>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={updateField}
                                        placeholder="e.g. Smart Placement Portal"
                                        maxLength={150}
                                        required
                                    />
                                </label>

                                <label className="projects-field full">
                                    <span>Description *</span>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={updateField}
                                        placeholder="Project ke baare mein batao..."
                                        rows={4}
                                        maxLength={2000}
                                        required
                                    />
                                </label>

                                <label className="projects-field full">
                                    <span>Project Image URL</span>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={form.imageUrl}
                                        onChange={updateField}
                                        placeholder="https://example.com/image.png"
                                    />
                                    <small>
                                        Abhi image URL save hota hai; file
                                        upload ke liye backend upload endpoint
                                        alag se chahiye.
                                    </small>
                                </label>

                                <label className="projects-field full">
                                    <span>Technologies</span>
                                    <input
                                        name="technologies"
                                        value={form.technologies}
                                        onChange={updateField}
                                        placeholder="Java, Spring Boot, React"
                                    />
                                    <small>
                                        Technologies ko comma se separate karo.
                                    </small>
                                </label>

                                <label className="projects-field">
                                    <span>GitHub URL</span>
                                    <input
                                        type="url"
                                        name="githubUrl"
                                        value={form.githubUrl}
                                        onChange={updateField}
                                        placeholder="https://github.com/..."
                                    />
                                </label>

                                <label className="projects-field">
                                    <span>Live Demo URL</span>
                                    <input
                                        type="url"
                                        name="liveUrl"
                                        value={form.liveUrl}
                                        onChange={updateField}
                                        placeholder="https://your-project.com"
                                    />
                                </label>

                                <label className="projects-featured-toggle full">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={form.featured}
                                        onChange={updateField}
                                    />

                                    <span>
                                        <strong>Featured Project</strong>
                                        <small>
                                            Is project ko featured mark karo.
                                        </small>
                                    </span>
                                </label>
                            </div>

                            <footer className="projects-form-actions">
                                <button
                                    type="button"
                                    className="projects-cancel-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="projects-save-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="projects-button-spinner" />
                                            Saving...
                                        </>
                                    ) : editingId !== null ? (
                                        "Save Changes"
                                    ) : (
                                        "Add Project"
                                    )}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
