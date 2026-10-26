import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminEducation.css";

const API_URL = "http://localhost:6060/api/education";

const emptyForm = {
    degree: "",
    institution: "",
    field: "",
    location: "",
    startYear: "",
    endYear: "",
    grade: "",
    description: "",
    displayOrder: 1,
    featured: false,
};

function AdminEducation() {
    const { token } = useAuth();

    const [educationList, setEducationList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({ ...emptyForm });

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================
    // FETCH EDUCATION
    // ==========================================

    const fetchEducation = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to fetch education data.");
            }

            const data = await response.json();

            setEducationList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Education fetch error:", err);
            setError(err.message || "Failed to load education.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchEducation();
    }, [fetchEducation]);

    // ==========================================
    // FORM INPUT
    // ==========================================

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ==========================================
    // OPEN ADD FORM
    // ==========================================

    const handleAddEducation = () => {
        setEditingId(null);

        setFormData({
            ...emptyForm,
            displayOrder: educationList.length + 1,
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ==========================================
    // OPEN EDIT FORM
    // ==========================================

    const handleEdit = (education) => {
        setEditingId(education.id);

        setFormData({
            degree: education.degree || "",
            institution: education.institution || "",
            field: education.field || "",
            location: education.location || "",
            startYear: education.startYear ?? "",
            endYear: education.endYear ?? "",
            grade: education.grade || "",
            description: education.description || "",
            displayOrder: education.displayOrder ?? 1,
            featured: Boolean(education.featured),
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ==========================================
    // CLOSE FORM
    // ==========================================

    const handleCloseForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingId(null);
        setFormData({ ...emptyForm });
        setError("");
    };

    // ==========================================
    // VALIDATION
    // ==========================================

    const validateForm = () => {
        if (!formData.degree.trim()) {
            return "Degree is required.";
        }

        if (!formData.institution.trim()) {
            return "Institution is required.";
        }

        if (!formData.startYear) {
            return "Start year is required.";
        }

        const startYear = Number(formData.startYear);
        const endYear = formData.endYear
            ? Number(formData.endYear)
            : null;

        if (!Number.isInteger(startYear) || startYear < 1900 || startYear > 2100) {
            return "Please enter a valid start year.";
        }

        if (
            endYear !== null &&
            (!Number.isInteger(endYear) ||
                endYear < 1900 ||
                endYear > 2100)
        ) {
            return "Please enter a valid end year.";
        }

        if (endYear !== null && endYear < startYear) {
            return "End year cannot be earlier than start year.";
        }

        const displayOrder = Number(formData.displayOrder);

        if (
            formData.displayOrder !== "" &&
            (!Number.isInteger(displayOrder) || displayOrder < 1)
        ) {
            return "Display order must be a positive whole number.";
        }

        return "";
    };

    // ==========================================
    // SAVE EDUCATION
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            setSuccess("");
            return;
        }

        if (!token) {
            setError("Authentication token is missing. Please login again.");
            setSuccess("");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                degree: formData.degree.trim(),
                institution: formData.institution.trim(),
                field: formData.field.trim(),
                location: formData.location.trim(),
                startYear: Number(formData.startYear),
                endYear: formData.endYear
                    ? Number(formData.endYear)
                    : null,
                grade: formData.grade.trim(),
                description: formData.description.trim(),
                displayOrder: formData.displayOrder
                    ? Number(formData.displayOrder)
                    : 1,
                featured: Boolean(formData.featured),
            };

            const url = editingId
                ? `${API_URL}/${editingId}`
                : API_URL;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let message = "Failed to save education.";

                try {
                    const errorData = await response.json();

                    if (errorData?.message) {
                        message = errorData.message;
                    } else if (errorData?.error) {
                        message = errorData.error;
                    }
                } catch {
                    // Response body may not contain JSON.
                }

                throw new Error(message);
            }

            // Some APIs return an empty response for successful saves.
            const responseText = await response.text();
            let savedEducation = null;

            if (responseText.trim()) {
                try {
                    savedEducation = JSON.parse(responseText);
                } catch {
                    savedEducation = null;
                }
            }

            if (savedEducation && savedEducation.id != null) {
                if (editingId) {
                    setEducationList((previous) =>
                        previous.map((item) =>
                            item.id === editingId
                                ? savedEducation
                                : item
                        )
                    );
                } else {
                    setEducationList((previous) => [
                        ...previous,
                        savedEducation,
                    ]);
                }
            } else {
                // Reload records if the API does not return the saved entity.
                await fetchEducation(true);
            }

            setSuccess(
                editingId
                    ? "Education updated successfully."
                    : "Education added successfully."
            );

            setShowForm(false);
            setEditingId(null);
            setFormData({ ...emptyForm });
        } catch (err) {
            console.error("Education save error:", err);
            setError(err.message || "Failed to save education.");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // DELETE EDUCATION
    // ==========================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this education record?"
        );

        if (!confirmed) return;

        if (!token) {
            setError("Authentication token is missing. Please login again.");
            setSuccess("");
            return;
        }

        try {
            setDeletingId(id);
            setError("");
            setSuccess("");

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                let message = "Failed to delete education.";

                try {
                    const errorData = await response.json();

                    if (errorData?.message) {
                        message = errorData.message;
                    } else if (errorData?.error) {
                        message = errorData.error;
                    }
                } catch {
                    // Response body may not contain JSON.
                }

                throw new Error(message);
            }

            setEducationList((previous) =>
                previous.filter((item) => item.id !== id)
            );

            setSuccess("Education deleted successfully.");
        } catch (err) {
            console.error("Education delete error:", err);
            setError(err.message || "Failed to delete education.");
        } finally {
            setDeletingId(null);
        }
    };

    // ==========================================
    // STATISTICS
    // ==========================================

    const statistics = useMemo(() => {
        const total = educationList.length;

        const featured = educationList.filter(
            (item) => item.featured
        ).length;

        const current = educationList.filter(
            (item) => !item.endYear
        ).length;

        const institutions = new Set(
            educationList
                .map((item) => item.institution?.trim())
                .filter(Boolean)
                .map((institution) => institution.toLowerCase())
        ).size;

        return {
            total,
            featured,
            current,
            institutions,
        };
    }, [educationList]);

    // ==========================================
    // SORT EDUCATION
    // ==========================================

    const sortedEducation = useMemo(() => {
        return [...educationList].sort((a, b) => {
            const orderA = a.displayOrder ?? 999;
            const orderB = b.displayOrder ?? 999;

            return orderA - orderB;
        });
    }, [educationList]);

    // ==========================================
    // LOADING STATE
    // ==========================================

    if (loading) {
        return (
            <div className="admin-education-page">
                <div className="education-loading">
                    <div className="education-loader"></div>

                    <h3>Loading Education</h3>

                    <p>Fetching your education records...</p>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="admin-education-page">

            {/* PAGE HEADER */}

            <div className="education-page-header">
                <div className="education-header-left">
                    <div className="education-title-icon">▣</div>

                    <div>
                        <span className="education-eyebrow">
                            ADMIN PANEL
                        </span>

                        <h1>Education</h1>

                        <p>
                            Manage your academic background,
                            qualifications and achievements.
                        </p>
                    </div>
                </div>

                <div className="education-header-actions">
                    <button
                        type="button"
                        className="education-refresh-btn"
                        onClick={() => fetchEducation(true)}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <>
                                <span className="button-spinner dark"></span>
                                Refreshing...
                            </>
                        ) : (
                            "↻ Refresh"
                        )}
                    </button>

                    <button
                        type="button"
                        className="education-add-btn"
                        onClick={handleAddEducation}
                    >
                        + Add Education
                    </button>
                </div>
            </div>

            {/* ALERTS */}

            {error && (
                <div
                    className="education-alert education-alert-error"
                    role="alert"
                >
                    <span>!</span>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div
                    className="education-alert education-alert-success"
                    role="status"
                >
                    <span>✓</span>
                    <p>{success}</p>
                </div>
            )}

            {/* STATISTICS */}

            <div className="education-stats-grid">
                <div className="education-stat-card">
                    <div className="education-stat-icon stat-icon-blue">
                        ▣
                    </div>

                    <div className="education-stat-content">
                        <span>Total Education</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="education-stat-card">
                    <div className="education-stat-icon stat-icon-purple">
                        ★
                    </div>

                    <div className="education-stat-content">
                        <span>Featured</span>
                        <strong>{statistics.featured}</strong>
                    </div>
                </div>

                <div className="education-stat-card">
                    <div className="education-stat-icon stat-icon-green">
                        ◷
                    </div>

                    <div className="education-stat-content">
                        <span>Current</span>
                        <strong>{statistics.current}</strong>
                    </div>
                </div>

                <div className="education-stat-card">
                    <div className="education-stat-icon stat-icon-orange">
                        ◫
                    </div>

                    <div className="education-stat-content">
                        <span>Institutions</span>
                        <strong>{statistics.institutions}</strong>
                    </div>
                </div>
            </div>

            {/* ADD / EDIT FORM */}

            {showForm && (
                <div className="education-form-card">
                    <div className="education-form-header">
                        <div>
                            <span className="form-mini-label">
                                {editingId ? "UPDATE RECORD" : "NEW RECORD"}
                            </span>

                            <h2>
                                {editingId ? "Edit Education" : "Add Education"}
                            </h2>

                            <p>Enter your academic details below.</p>
                        </div>

                        <button
                            type="button"
                            className="education-close-btn"
                            onClick={handleCloseForm}
                            disabled={saving}
                            aria-label="Close education form"
                        >
                            ×
                        </button>
                    </div>

                    <form
                        className="education-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="degree">
                                Degree <span>*</span>
                            </label>

                            <input
                                id="degree"
                                name="degree"
                                type="text"
                                value={formData.degree}
                                onChange={handleChange}
                                placeholder="e.g. Bachelor of Technology"
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="institution">
                                Institution <span>*</span>
                            </label>

                            <input
                                id="institution"
                                name="institution"
                                type="text"
                                value={formData.institution}
                                onChange={handleChange}
                                placeholder="e.g. ABC Institute of Technology"
                                maxLength={200}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="field">Field of Study</label>

                            <input
                                id="field"
                                name="field"
                                type="text"
                                value={formData.field}
                                onChange={handleChange}
                                placeholder="e.g. Computer Science & AI/ML"
                                maxLength={150}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Location</label>

                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Bhopal, Madhya Pradesh"
                                maxLength={150}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="startYear">
                                Start Year <span>*</span>
                            </label>

                            <input
                                id="startYear"
                                name="startYear"
                                type="number"
                                min="1900"
                                max="2100"
                                step="1"
                                value={formData.startYear}
                                onChange={handleChange}
                                placeholder="e.g. 2023"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endYear">End Year</label>

                            <input
                                id="endYear"
                                name="endYear"
                                type="number"
                                min="1900"
                                max="2100"
                                step="1"
                                value={formData.endYear}
                                onChange={handleChange}
                                placeholder="e.g. 2027"
                            />

                            <small className="field-hint">
                                Leave empty if currently studying.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="grade">Grade / CGPA</label>

                            <input
                                id="grade"
                                name="grade"
                                type="text"
                                value={formData.grade}
                                onChange={handleChange}
                                placeholder="e.g. 6.9 CGPA"
                                maxLength={50}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="displayOrder">Display Order</label>

                            <input
                                id="displayOrder"
                                name="displayOrder"
                                type="number"
                                min="1"
                                step="1"
                                value={formData.displayOrder}
                                onChange={handleChange}
                                placeholder="e.g. 1"
                            />

                            <small className="field-hint">
                                Lower numbers appear first.
                            </small>
                        </div>

                        <div className="form-group form-group-full">
                            <label htmlFor="description">Description</label>

                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your course, achievements, specialization or academic experience..."
                                rows="5"
                                maxLength={3000}
                            ></textarea>
                        </div>

                        <div className="featured-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                />

                                <span className="custom-toggle"></span>

                                <span className="toggle-text">
                                    <strong>Featured Education</strong>

                                    <small>
                                        Highlight this education on your portfolio.
                                    </small>
                                </span>
                            </label>
                        </div>

                        <div className="education-form-actions">
                            <button
                                type="button"
                                className="education-cancel-btn"
                                onClick={handleCloseForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="education-save-btn"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Saving...
                                    </>
                                ) : editingId ? (
                                    "Update Education"
                                ) : (
                                    "Save Education"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* EDUCATION LIST */}

            <div className="education-list-section">
                <div className="education-list-header">
                    <div>
                        <span className="education-section-label">
                            ACADEMIC RECORDS
                        </span>

                        <h2>Your Education</h2>

                        <p>
                            All education records stored in your portfolio.
                        </p>
                    </div>

                    <span className="education-count-badge">
                        {educationList.length} Records
                    </span>
                </div>

                {sortedEducation.length === 0 ? (
                    <div className="education-empty">
                        <div className="education-empty-icon">▣</div>

                        <h3>No Education Added</h3>

                        <p>
                            Start building your academic profile by
                            adding your first education record.
                        </p>

                        <button
                            type="button"
                            className="education-empty-add-btn"
                            onClick={handleAddEducation}
                        >
                            + Add Education
                        </button>
                    </div>
                ) : (
                    <div className="education-grid">
                        {sortedEducation.map((education) => (
                            <article
                                className="education-card"
                                key={education.id}
                            >
                                <div className="education-card-top">
                                    <div className="education-card-icon">
                                        ▣
                                    </div>

                                    <div className="education-card-title">
                                        <div className="education-card-heading">
                                            <h3>{education.degree}</h3>

                                            {education.featured && (
                                                <span className="featured-badge">
                                                    ★ Featured
                                                </span>
                                            )}
                                        </div>

                                        <span className="education-institution">
                                            {education.institution}
                                        </span>
                                    </div>
                                </div>

                                <div className="education-card-details">
                                    {education.field && (
                                        <div className="education-detail">
                                            <span className="detail-label">
                                                Field
                                            </span>

                                            <strong title={education.field}>
                                                {education.field}
                                            </strong>
                                        </div>
                                    )}

                                    {education.location && (
                                        <div className="education-detail">
                                            <span className="detail-label">
                                                Location
                                            </span>

                                            <strong title={education.location}>
                                                {education.location}
                                            </strong>
                                        </div>
                                    )}

                                    <div className="education-detail">
                                        <span className="detail-label">
                                            Duration
                                        </span>

                                        <strong>
                                            {education.startYear || "—"}
                                            {" — "}
                                            {education.endYear || "Present"}
                                        </strong>
                                    </div>

                                    {education.grade && (
                                        <div className="education-detail">
                                            <span className="detail-label">
                                                Grade
                                            </span>

                                            <strong className="grade-value">
                                                {education.grade}
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                {education.description && (
                                    <p className="education-description">
                                        {education.description}
                                    </p>
                                )}

                                <div className="education-card-footer">
                                    <span className="display-order">
                                        Order #{education.displayOrder ?? "—"}
                                    </span>

                                    <div className="education-card-actions">
                                        <button
                                            type="button"
                                            className="education-edit-btn"
                                            onClick={() => handleEdit(education)}
                                            disabled={saving || deletingId === education.id}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="education-delete-btn"
                                            onClick={() => handleDelete(education.id)}
                                            disabled={
                                                saving ||
                                                deletingId === education.id
                                            }
                                        >
                                            {deletingId === education.id ? (
                                                <>
                                                    <span className="button-spinner"></span>
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Delete"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminEducation;