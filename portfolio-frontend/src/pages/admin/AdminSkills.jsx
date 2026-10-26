import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminSkills.css";

const API_URL = "http://localhost:6060/api/skills";

const emptyForm = {
    name: "",
    category: "",
    proficiency: 70,
    displayOrder: 1,
    iconUrl: "",
    description: "",
    featured: false,
};

function AdminSkills() {
    const { token } = useAuth();

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState(emptyForm);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* =========================================================
       FETCH SKILLS
    ========================================================= */

    const fetchSkills = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(`${API_URL}/ordered`);

            if (!response.ok) {
                throw new Error("Failed to fetch skills.");
            }

            const data = await response.json();

            setSkills(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to load skills.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    /* =========================================================
       FORM HANDLERS
    ========================================================= */

    const handleInputChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    /* =========================================================
       OPEN ADD FORM
    ========================================================= */

    const openAddForm = () => {
        setEditingId(null);

        setFormData({
            ...emptyForm,
            displayOrder: skills.length + 1,
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /* =========================================================
       OPEN EDIT FORM
    ========================================================= */

    const openEditForm = (skill) => {
        setEditingId(skill.id);

        setFormData({
            name: skill.name || "",
            category: skill.category || "",
            proficiency: skill.proficiency ?? 70,
            displayOrder: skill.displayOrder ?? 1,
            iconUrl: skill.iconUrl || "",
            description: skill.description || "",
            featured: Boolean(skill.featured),
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /* =========================================================
       CLOSE FORM
    ========================================================= */

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            ...emptyForm,
        });
    };

    /* =========================================================
       SAVE SKILL
    ========================================================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const category = formData.category.trim();

        if (!name) {
            setError("Skill name is required.");
            return;
        }

        if (!category) {
            setError("Category is required.");
            return;
        }

        const proficiency = Number(formData.proficiency);
        const displayOrder = Number(formData.displayOrder);

        if (
            Number.isNaN(proficiency) ||
            proficiency < 0 ||
            proficiency > 100
        ) {
            setError(
                "Proficiency must be between 0 and 100."
            );
            return;
        }

        if (
            Number.isNaN(displayOrder) ||
            displayOrder < 1
        ) {
            setError(
                "Display order must be at least 1."
            );
            return;
        }

        const payload = {
            name,
            category,
            proficiency,
            displayOrder,
            iconUrl: formData.iconUrl.trim(),
            description: formData.description.trim(),
            featured: Boolean(formData.featured),
        };

        try {
            setSaving(true);

            const url = editingId
                ? `${API_URL}/${editingId}`
                : API_URL;

            const method = editingId
                ? "PUT"
                : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const message = await response.text();

                throw new Error(
                    message || "Failed to save skill."
                );
            }

            await response.json();

            setSuccess(
                editingId
                    ? "Skill updated successfully."
                    : "Skill added successfully."
            );

            closeForm();

            await fetchSkills(true);

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            setError(
                err.message ||
                "Unable to save skill."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       DELETE SKILL
    ========================================================= */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this skill?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const message =
                    await response.text();

                throw new Error(
                    message ||
                    "Failed to delete skill."
                );
            }

            setSuccess(
                "Skill deleted successfully."
            );

            await fetchSkills(true);

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            setError(
                err.message ||
                "Unable to delete skill."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /* =========================================================
       SORT SKILLS
    ========================================================= */

    const sortedSkills = useMemo(() => {
        return [...skills].sort(
            (a, b) =>
                Number(a.displayOrder ?? 0) -
                Number(b.displayOrder ?? 0)
        );
    }, [skills]);

    /* =========================================================
       STATS
    ========================================================= */

    const stats = useMemo(() => {
        const categories = new Set(
            skills
                .map((skill) => skill.category)
                .filter(Boolean)
        );

        const featured = skills.filter(
            (skill) => skill.featured
        ).length;

        const average =
            skills.length > 0
                ? Math.round(
                      skills.reduce(
                          (sum, skill) =>
                              sum +
                              Number(
                                  skill.proficiency ?? 0
                              ),
                          0
                      ) / skills.length
                  )
                : 0;

        return {
            total: skills.length,
            categories: categories.size,
            featured,
            average,
        };
    }, [skills]);

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="admin-skills-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="skills-page-header">

                <div className="skills-header-left">

                    <div className="skills-title-icon">
                        ✦
                    </div>

                    <div>
                        <div className="skills-eyebrow">
                            ADMIN PANEL
                        </div>

                        <h1>Skills</h1>

                        <p>
                            Manage your technical skills
                            and expertise.
                        </p>
                    </div>

                </div>

                <div className="skills-header-actions">

                    <button
                        type="button"
                        className="skills-refresh-btn"
                        onClick={() =>
                            fetchSkills(true)
                        }
                        disabled={refreshing}
                    >
                        <span
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        >
                            ↻
                        </span>

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="skills-add-btn"
                        onClick={openAddForm}
                    >
                        <span>＋</span>
                        Add Skill
                    </button>

                </div>

            </section>

            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (
                <div className="skills-alert error">
                    <span>!</span>
                    {error}
                </div>
            )}

            {success && (
                <div className="skills-alert success">
                    <span>✓</span>
                    {success}
                </div>
            )}

            {/* =================================================
                STATS
            ================================================= */}

            <section className="skills-stats-grid">

                <div className="skill-stat-card">

                    <div className="skill-stat-icon blue">
                        ✦
                    </div>

                    <div className="skill-stat-content">
                        <span>Total Skills</span>
                        <strong>
                            {stats.total}
                        </strong>
                    </div>

                </div>

                <div className="skill-stat-card">

                    <div className="skill-stat-icon teal">
                        ◈
                    </div>

                    <div className="skill-stat-content">
                        <span>Categories</span>
                        <strong>
                            {stats.categories}
                        </strong>
                    </div>

                </div>

                <div className="skill-stat-card">

                    <div className="skill-stat-icon gold">
                        ★
                    </div>

                    <div className="skill-stat-content">
                        <span>Featured</span>
                        <strong>
                            {stats.featured}
                        </strong>
                    </div>

                </div>

                <div className="skill-stat-card">

                    <div className="skill-stat-icon purple">
                        %
                    </div>

                    <div className="skill-stat-content">
                        <span>
                            Average Proficiency
                        </span>

                        <strong>
                            {stats.average}%
                        </strong>
                    </div>

                </div>

            </section>

            {/* =================================================
                FORM
            ================================================= */}

            {showForm && (
                <section className="skills-form-card">

                    <div className="skills-form-header">

                        <div>

                            <div className="skills-eyebrow">
                                {editingId
                                    ? "EDIT RECORD"
                                    : "NEW RECORD"}
                            </div>

                            <h2>
                                {editingId
                                    ? "Edit Skill"
                                    : "Add Skill"}
                            </h2>

                            <p>
                                Enter the skill details
                                below.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="skills-form-close"
                            onClick={closeForm}
                        >
                            ×
                        </button>

                    </div>

                    <form
                        className="skills-form-body"
                        onSubmit={handleSubmit}
                    >

                        <div className="skills-form-grid">

                            {/* Skill Name */}

                            <div className="skill-form-group">

                                <label>
                                    Skill Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="e.g. Java"
                                />

                            </div>

                            {/* Category */}

                            <div className="skill-form-group">

                                <label>
                                    Category *
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="e.g. Programming"
                                />

                            </div>

                            {/* Proficiency */}

                            <div className="skill-form-group">

                                <label>
                                    Proficiency
                                </label>

                                <div className="skill-range-wrapper">

                                    <input
                                        type="range"
                                        name="proficiency"
                                        min="0"
                                        max="100"
                                        value={
                                            formData.proficiency
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                    <strong>
                                        {
                                            formData.proficiency
                                        }%
                                    </strong>

                                </div>

                            </div>

                            {/* Display Order */}

                            <div className="skill-form-group">

                                <label>
                                    Display Order
                                </label>

                                <input
                                    type="number"
                                    name="displayOrder"
                                    min="1"
                                    value={
                                        formData.displayOrder
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />

                            </div>

                            {/* Icon URL */}

                            <div className="skill-form-group">

                                <label>
                                    Icon URL
                                </label>

                                <input
                                    type="text"
                                    name="iconUrl"
                                    value={
                                        formData.iconUrl
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="https://..."
                                />

                            </div>

                            {/* Featured */}

                            <div className="skill-form-group skill-featured-group">

                                <label className="skill-toggle-label">

                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={
                                            formData.featured
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                    <span className="skill-custom-toggle">
                                        <span />
                                    </span>

                                    <span className="skill-toggle-text">

                                        <strong>
                                            Featured Skill
                                        </strong>

                                        <small>
                                            Highlight this
                                            skill on your
                                            portfolio.
                                        </small>

                                    </span>

                                </label>

                            </div>

                        </div>

                        {/* Description */}

                        <div className="skill-form-group skill-description-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Describe your experience with this skill..."
                            />

                        </div>

                        {/* Form Buttons */}

                        <div className="skills-form-actions">

                            <button
                                type="button"
                                className="skills-cancel-btn"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="skills-save-btn"
                                disabled={saving}
                            >

                                {saving ? (
                                    <>
                                        <span className="button-spinner" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span>✓</span>

                                        {editingId
                                            ? "Update Skill"
                                            : "Save Skill"}
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </section>
            )}

            {/* =================================================
                SKILL COLLECTION
            ================================================= */}

            <section className="skills-list-section">

                <div className="skills-list-header">

                    <div>

                        <div className="skills-eyebrow">
                            SKILL LIBRARY
                        </div>

                        <h2>
                            Skill Collection
                        </h2>

                        <p>
                            Your technical skills and
                            expertise.
                        </p>

                    </div>

                    <div className="skills-count-badge">
                        {skills.length} Records
                    </div>

                </div>

                {/* Loading */}

                {loading ? (

                    <div className="skills-loading">

                        <div className="skills-loader" />

                        <span>
                            Loading skills...
                        </span>

                    </div>

                ) : sortedSkills.length === 0 ? (

                    /* Empty */

                    <div className="skills-empty">

                        <div className="skills-empty-icon">
                            ✦
                        </div>

                        <h3>
                            No Skills Added
                        </h3>

                        <p>
                            Add your first technical skill
                            to build your portfolio skill
                            library.
                        </p>

                        <button
                            type="button"
                            className="skills-empty-add-btn"
                            onClick={openAddForm}
                        >
                            <span>＋</span>
                            Add Your First Skill
                        </button>

                    </div>

                ) : (

                    /* Skill Cards */

                    <div className="skills-grid">

                        {sortedSkills.map(
                            (skill) => {

                                const proficiency = Math.min(
                                    100,
                                    Math.max(
                                        0,
                                        Number(
                                            skill.proficiency ?? 0
                                        )
                                    )
                                );

                                return (
                                    <article
                                        className="skill-card"
                                        key={skill.id}
                                    >

                                        <div className="skill-card-top">

                                            <div className="skill-icon-wrapper">

                                                {skill.iconUrl ? (
                                                    <img
                                                        src={
                                                            skill.iconUrl
                                                        }
                                                        alt={
                                                            skill.name
                                                        }
                                                        className="skill-icon"
                                                    />
                                                ) : (
                                                    <span>
                                                        ✦
                                                    </span>
                                                )}

                                            </div>

                                            {skill.featured && (
                                                <span className="skill-featured-badge">
                                                    ★ Featured
                                                </span>
                                            )}

                                        </div>

                                        <div className="skill-card-content">

                                            <div className="skill-card-title-row">

                                                <div>

                                                    <h3>
                                                        {
                                                            skill.name
                                                        }
                                                    </h3>

                                                    <span className="skill-category">
                                                        {
                                                            skill.category
                                                        }
                                                    </span>

                                                </div>

                                                <span className="skill-order">
                                                    #
                                                    {
                                                        skill.displayOrder
                                                    }
                                                </span>

                                            </div>

                                            {skill.description && (
                                                <p className="skill-description">
                                                    {
                                                        skill.description
                                                    }
                                                </p>
                                            )}

                                            <div className="skill-progress-header">

                                                <span>
                                                    Proficiency
                                                </span>

                                                <strong>
                                                    {
                                                        proficiency
                                                    }%
                                                </strong>

                                            </div>

                                            <div className="skill-progress-track">

                                                <div
                                                    className="skill-progress-bar"
                                                    style={{
                                                        width: `${proficiency}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                        <div className="skill-card-footer">

                                            <button
                                                type="button"
                                                className="skill-edit-btn"
                                                onClick={() =>
                                                    openEditForm(
                                                        skill
                                                    )
                                                }
                                            >
                                                ✎ Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="skill-delete-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        skill.id
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    skill.id
                                                }
                                            >
                                                {deletingId ===
                                                skill.id
                                                    ? "Deleting..."
                                                    : "⌫ Delete"}
                                            </button>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>

                )}

            </section>

        </div>
    );
}

export default AdminSkills;