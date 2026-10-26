
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useAuth } from "../../context/AuthContext";
import "./AdminCertificates.css";

const API_BASE_URL = "http://localhost:6060";
const API_URL = `${API_BASE_URL}/api/certificates`;
const UPLOAD_URL = `${API_BASE_URL}/api/upload/certificate`;

const emptyForm = {
    title: "",
    issuer: "",
    issueDate: "",
    credentialId: "",
    credentialUrl: "",
    certificateImage: "",
    certificatePdf: "",
    description: "",
    displayOrder: 1,
    featured: false,
};

function getFileUrl(url) {
    if (!url) return "";

    try {
        return new URL(url, `${API_BASE_URL}/`).href;
    } catch {
        return url;
    }
}

function isValidHttpUrl(value) {
    if (!value) return true;

    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function AdminCertificates() {
    const { token } = useAuth();

    const pdfInputRef = useRef(null);

    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });

    const [saving, setSaving] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [brokenImages, setBrokenImages] = useState([]);

    /* =========================================================
       FETCH CERTIFICATES
    ========================================================= */

    const fetchCertificates = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(`${API_URL}/ordered`);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch certificates (${response.status}).`
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid certificates API response.");
            }

            setCertificates(data);
            setBrokenImages([]);
        } catch (err) {
            setError(err.message || "Unable to load certificates.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    /* =========================================================
       INPUT HANDLING
    ========================================================= */

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /* =========================================================
       OPEN ADD FORM
    ========================================================= */

    const openAddForm = () => {
        setEditingId(null);

        setFormData({
            ...emptyForm,
            displayOrder: certificates.length + 1,
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* =========================================================
       OPEN EDIT FORM
    ========================================================= */

    const openEditForm = (certificate) => {
        setEditingId(certificate.id);

        setFormData({
            title: certificate.title || "",
            issuer: certificate.issuer || "",
            issueDate: certificate.issueDate || "",
            credentialId: certificate.credentialId || "",
            credentialUrl: certificate.credentialUrl || "",
            certificateImage: certificate.certificateImage || "",
            certificatePdf: certificate.certificatePdf || "",
            description: certificate.description || "",
            displayOrder: certificate.displayOrder ?? 1,
            featured: Boolean(certificate.featured),
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* =========================================================
       CLOSE FORM
    ========================================================= */

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ ...emptyForm });
        setError("");

        if (pdfInputRef.current) {
            pdfInputRef.current.value = "";
        }
    };

    /* =========================================================
       UPLOAD CERTIFICATE PDF
       Assumes upload endpoint accepts multipart field "file"
       and returns JSON containing "fileUrl".
    ========================================================= */

    const handlePdfUpload = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setError("");
        setSuccess("");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            event.target.value = "";
            return;
        }

        if (file.type !== "application/pdf") {
            setError("Please select a PDF file.");
            event.target.value = "";
            return;
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            setError("PDF size must not exceed 10 MB.");
            event.target.value = "";
            return;
        }

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            setUploadingPdf(true);

            const response = await fetch(UPLOAD_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: uploadData,
            });

            if (!response.ok) {
                const message = await response.text();

                throw new Error(
                    message ||
                    `PDF upload failed (${response.status}).`
                );
            }

            const result = await response.json();

            if (!result.fileUrl) {
                throw new Error(
                    "Upload succeeded, but the server did not return fileUrl."
                );
            }

            setFormData((previous) => ({
                ...previous,
                certificatePdf: result.fileUrl,
            }));

            setSuccess("Certificate PDF uploaded. Save the certificate to keep the URL.");
        } catch (err) {
            setError(err.message || "Unable to upload PDF.");
        } finally {
            setUploadingPdf(false);
            event.target.value = "";
        }
    };

    /* =========================================================
       REMOVE PDF URL FROM FORM
       Does not delete the uploaded file from the server.
    ========================================================= */

    const removePdfFromForm = () => {
        setFormData((previous) => ({
            ...previous,
            certificatePdf: "",
        }));
        setSuccess("");
    };

    /* =========================================================
       SAVE CERTIFICATE
    ========================================================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        if (!formData.title.trim()) {
            setError("Certificate title is required.");
            return;
        }

        if (!formData.issuer.trim()) {
            setError("Issuing organization is required.");
            return;
        }

        const credentialUrl = formData.credentialUrl.trim();
        const certificateImage = formData.certificateImage.trim();
        const certificatePdf = formData.certificatePdf.trim();

        if (!isValidHttpUrl(credentialUrl)) {
            setError("Credential URL must be a valid HTTP or HTTPS URL.");
            return;
        }

        if (!isValidHttpUrl(certificateImage)) {
            setError("Certificate image must be a valid HTTP or HTTPS URL.");
            return;
        }

        // The PDF may be a relative URL returned by the backend,
        // such as /uploads/certificates/example.pdf.
        if (
            certificatePdf &&
            !certificatePdf.startsWith("/") &&
            !isValidHttpUrl(certificatePdf)
        ) {
            setError("Certificate PDF URL is invalid.");
            return;
        }

        const displayOrder = Number(formData.displayOrder);

        if (!Number.isInteger(displayOrder) || displayOrder < 1) {
            setError("Display order must be a positive whole number.");
            return;
        }

        const payload = {
            title: formData.title.trim(),
            issuer: formData.issuer.trim(),
            issueDate: formData.issueDate.trim(),
            credentialId: formData.credentialId.trim(),
            credentialUrl,
            certificateImage,
            certificatePdf,
            description: formData.description.trim(),
            displayOrder,
            featured: Boolean(formData.featured),
        };

        try {
            setSaving(true);

            const isEditing = editingId !== null;

            const response = await fetch(
                isEditing ? `${API_URL}/${editingId}` : API_URL,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const message = await response.text();

                throw new Error(
                    message ||
                    `Unable to save certificate (${response.status}).`
                );
            }

            setSuccess(
                isEditing
                    ? "Certificate updated successfully."
                    : "Certificate added successfully."
            );

            closeForm();
            await fetchCertificates(true);
        } catch (err) {
            setError(err.message || "Unable to save certificate.");
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       DELETE CERTIFICATE
    ========================================================= */

    const handleDelete = async (id) => {
        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        if (
            !window.confirm(
                "Are you sure you want to delete this certificate?"
            )
        ) {
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
                const message = await response.text();

                throw new Error(
                    message ||
                    `Unable to delete certificate (${response.status}).`
                );
            }

            setSuccess("Certificate deleted successfully.");
            await fetchCertificates(true);
        } catch (err) {
            setError(err.message || "Unable to delete certificate.");
        } finally {
            setDeletingId(null);
        }
    };

    /* =========================================================
       IMAGE ERROR HANDLING
    ========================================================= */

    const handleImageError = (id) => {
        setBrokenImages((previous) =>
            previous.includes(id) ? previous : [...previous, id]
        );
    };

    /* =========================================================
       SORT CERTIFICATES
    ========================================================= */

    const sortedCertificates = useMemo(
        () =>
            [...certificates].sort(
                (a, b) =>
                    Number(a.displayOrder ?? 0) -
                    Number(b.displayOrder ?? 0)
            ),
        [certificates]
    );

    /* =========================================================
       STATISTICS
    ========================================================= */

    const stats = useMemo(() => {
        const featured = certificates.filter(
            (certificate) => certificate.featured
        ).length;

        const withCredential = certificates.filter(
            (certificate) =>
                certificate.credentialId || certificate.credentialUrl
        ).length;

        const issuers = new Set(
            certificates
                .map((certificate) => certificate.issuer?.trim())
                .filter(Boolean)
                .map((issuer) => issuer.toLowerCase())
        ).size;

        const withPdf = certificates.filter(
            (certificate) => certificate.certificatePdf
        ).length;

        return {
            total: certificates.length,
            featured,
            withCredential,
            issuers,
            withPdf,
        };
    }, [certificates]);

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="admin-certificates-page">
            {/* HEADER */}

            <section className="certificates-page-header">
                <div className="certificates-header-left">
                    <div className="certificates-title-icon">◇</div>

                    <div>
                        <div className="certificates-eyebrow">
                            ADMIN PANEL
                        </div>

                        <h1>Certificates</h1>

                        <p>
                            Manage your professional certifications and
                            credentials.
                        </p>
                    </div>
                </div>

                <div className="certificates-header-actions">
                    <button
                        type="button"
                        className="certificates-refresh-btn"
                        onClick={() => fetchCertificates(true)}
                        disabled={refreshing || loading}
                    >
                        <span className={refreshing ? "button-spin" : ""}>
                            ↻
                        </span>
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="certificates-add-btn"
                        onClick={openAddForm}
                    >
                        <span>＋</span>
                        Add Certificate
                    </button>
                </div>
            </section>

            {/* ALERTS */}

            {error && (
                <div className="certificates-alert error" role="alert">
                    <span>!</span>
                    <div>{error}</div>
                </div>
            )}

            {success && (
                <div className="certificates-alert success" role="status">
                    <span>✓</span>
                    <div>{success}</div>
                </div>
            )}

            {/* STATISTICS */}

            <section className="certificates-stats-grid">
                <div className="certificate-stat-card">
                    <div className="certificate-stat-icon blue">◇</div>
                    <div className="certificate-stat-content">
                        <span>Total Certificates</span>
                        <strong>{stats.total}</strong>
                    </div>
                </div>

                <div className="certificate-stat-card">
                    <div className="certificate-stat-icon gold">★</div>
                    <div className="certificate-stat-content">
                        <span>Featured</span>
                        <strong>{stats.featured}</strong>
                    </div>
                </div>

                <div className="certificate-stat-card">
                    <div className="certificate-stat-icon teal">✓</div>
                    <div className="certificate-stat-content">
                        <span>With Credential</span>
                        <strong>{stats.withCredential}</strong>
                    </div>
                </div>

                <div className="certificate-stat-card">
                    <div className="certificate-stat-icon purple">◈</div>
                    <div className="certificate-stat-content">
                        <span>With PDF</span>
                        <strong>{stats.withPdf}</strong>
                    </div>
                </div>
            </section>

            {/* ADD / EDIT FORM */}

            {showForm && (
                <section className="certificates-form-card">
                    <div className="certificates-form-header">
                        <div>
                            <div className="certificates-eyebrow">
                                {editingId !== null ? "EDIT RECORD" : "NEW RECORD"}
                            </div>

                            <h2>
                                {editingId !== null
                                    ? "Edit Certificate"
                                    : "Add Certificate"}
                            </h2>

                            <p>Enter the certificate details below.</p>
                        </div>

                        <button
                            type="button"
                            className="certificates-form-close"
                            onClick={closeForm}
                            disabled={saving || uploadingPdf}
                            aria-label="Close certificate form"
                        >
                            ×
                        </button>
                    </div>

                    <form
                        className="certificates-form-body"
                        onSubmit={handleSubmit}
                    >
                        <div className="certificates-form-grid">
                            <div className="certificate-form-group">
                                <label htmlFor="certificate-title">
                                    Certificate Title *
                                </label>
                                <input
                                    id="certificate-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Java Full Stack Developer"
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className="certificate-form-group">
                                <label htmlFor="certificate-issuer">
                                    Issuing Organization *
                                </label>
                                <input
                                    id="certificate-issuer"
                                    type="text"
                                    name="issuer"
                                    value={formData.issuer}
                                    onChange={handleInputChange}
                                    placeholder="e.g. EduSkills"
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className="certificate-form-group">
                                <label htmlFor="certificate-issue-date">
                                    Issue Date
                                </label>
                                <input
                                    id="certificate-issue-date"
                                    type="text"
                                    name="issueDate"
                                    value={formData.issueDate}
                                    onChange={handleInputChange}
                                    placeholder="e.g. August 2025"
                                />
                            </div>

                            <div className="certificate-form-group">
                                <label htmlFor="certificate-credential-id">
                                    Credential ID
                                </label>
                                <input
                                    id="certificate-credential-id"
                                    type="text"
                                    name="credentialId"
                                    value={formData.credentialId}
                                    onChange={handleInputChange}
                                    placeholder="e.g. ABC123456"
                                />
                            </div>

                            <div className="certificate-form-group">
                                <label htmlFor="certificate-credential-url">
                                    Credential URL
                                </label>
                                <input
                                    id="certificate-credential-url"
                                    type="url"
                                    name="credentialUrl"
                                    value={formData.credentialUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="certificate-form-group">
                                <label htmlFor="certificate-image-url">
                                    Certificate Image URL
                                </label>
                                <input
                                    id="certificate-image-url"
                                    type="url"
                                    name="certificateImage"
                                    value={formData.certificateImage}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                />
                                <small className="certificate-input-help">
                                    Optional: publicly accessible image URL.
                                </small>
                            </div>

                            <div className="certificate-form-group">
                                <label htmlFor="certificate-display-order">
                                    Display Order
                                </label>
                                <input
                                    id="certificate-display-order"
                                    type="number"
                                    name="displayOrder"
                                    min="1"
                                    step="1"
                                    value={formData.displayOrder}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="certificate-form-group certificate-featured-group">
                                <label className="certificate-toggle-label">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                    />

                                    <span className="certificate-custom-toggle">
                                        <span />
                                    </span>

                                    <span className="certificate-toggle-text">
                                        <strong>Featured Certificate</strong>
                                        <small>
                                            Highlight this certificate on your
                                            portfolio.
                                        </small>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* PDF UPLOAD */}

                        <div className="certificate-pdf-upload-section">
                            <div className="certificate-form-group">
                                <label htmlFor="certificate-pdf-file">
                                    Certificate PDF
                                </label>

                                <input
                                    ref={pdfInputRef}
                                    id="certificate-pdf-file"
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={handlePdfUpload}
                                    disabled={uploadingPdf || saving}
                                />

                                <small className="certificate-input-help">
                                    PDF only, maximum 10 MB.
                                </small>
                            </div>

                            {uploadingPdf && (
                                <div
                                    className="certificate-pdf-upload-status"
                                    role="status"
                                >
                                    <span className="certificate-button-spinner" />
                                    Uploading PDF...
                                </div>
                            )}

                            {formData.certificatePdf && (
                                <div className="certificate-pdf-selected">
                                    <div className="certificate-pdf-file-info">
                                        <span className="certificate-pdf-icon">
                                            PDF
                                        </span>

                                        <div>
                                            <strong>Certificate PDF attached</strong>
                                            <small>
                                                {formData.certificatePdf}
                                            </small>
                                        </div>
                                    </div>

                                    <div className="certificate-pdf-actions">
                                        <a
                                            href={getFileUrl(formData.certificatePdf)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="certificate-pdf-view-btn"
                                        >
                                            View PDF ↗
                                        </a>

                                        <button
                                            type="button"
                                            className="certificate-pdf-remove-btn"
                                            onClick={removePdfFromForm}
                                            disabled={uploadingPdf || saving}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="certificate-form-group certificate-description-group">
                            <label htmlFor="certificate-description">
                                Description
                            </label>
                            <textarea
                                id="certificate-description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe what you learned or achieved..."
                                rows="4"
                            />
                        </div>

                        <div className="certificates-form-actions">
                            <button
                                type="button"
                                className="certificates-cancel-btn"
                                onClick={closeForm}
                                disabled={saving || uploadingPdf}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="certificates-save-btn"
                                disabled={saving || uploadingPdf}
                            >
                                {saving ? (
                                    <>
                                        <span className="certificate-button-spinner" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span>✓</span>
                                        {editingId !== null
                                            ? "Update Certificate"
                                            : "Save Certificate"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* CERTIFICATE COLLECTION */}

            <section className="certificates-list-section">
                <div className="certificates-list-header">
                    <div>
                        <div className="certificates-eyebrow">
                            CREDENTIAL LIBRARY
                        </div>

                        <h2>Certificate Collection</h2>

                        <p>
                            Your professional certifications and credentials.
                        </p>
                    </div>

                    <div className="certificates-count-badge">
                        {certificates.length} Records
                    </div>
                </div>

                {loading ? (
                    <div className="certificates-loading">
                        <div className="certificates-loader" />
                        <span>Loading certificates...</span>
                    </div>
                ) : sortedCertificates.length === 0 ? (
                    <div className="certificates-empty">
                        <div className="certificates-empty-icon">◇</div>

                        <h3>No Certificates Added</h3>

                        <p>
                            Add your professional certifications to showcase
                            your achievements.
                        </p>

                        <button
                            type="button"
                            className="certificates-empty-add-btn"
                            onClick={openAddForm}
                        >
                            <span>＋</span>
                            Add Your First Certificate
                        </button>
                    </div>
                ) : (
                    <div className="certificates-grid">
                        {sortedCertificates.map((certificate) => {
                            const imageFailed = brokenImages.includes(
                                certificate.id
                            );

                            const pdfUrl = getFileUrl(
                                certificate.certificatePdf
                            );

                            return (
                                <article
                                    className="certificate-card"
                                    key={certificate.id}
                                >
                                    <div className="certificate-image-wrapper">
                                        {certificate.certificateImage &&
                                        !imageFailed ? (
                                            <img
                                                src={getFileUrl(
                                                    certificate.certificateImage
                                                )}
                                                alt={
                                                    certificate.title ||
                                                    "Certificate"
                                                }
                                                className="certificate-image"
                                                loading="lazy"
                                                onError={() =>
                                                    handleImageError(
                                                        certificate.id
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="certificate-image-fallback">
                                                <span className="certificate-image-fallback-icon">
                                                    ◇
                                                </span>
                                            </div>
                                        )}

                                        {certificate.featured && (
                                            <span className="certificate-featured-badge">
                                                ★ Featured
                                            </span>
                                        )}
                                    </div>

                                    <div className="certificate-card-content">
                                        <div className="certificate-card-top">
                                            <div>
                                                <h3 className="certificate-card-title">
                                                    {certificate.title}
                                                </h3>

                                                <div className="certificate-issuer">
                                                    <span className="certificate-issuer-icon">
                                                        ◈
                                                    </span>
                                                    {certificate.issuer}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="certificate-meta">
                                            {certificate.issueDate && (
                                                <span className="certificate-meta-item">
                                                    <span>◷</span>
                                                    {certificate.issueDate}
                                                </span>
                                            )}

                                            {certificate.credentialId && (
                                                <span className="certificate-meta-item">
                                                    <span>◇</span>
                                                    {certificate.credentialId}
                                                </span>
                                            )}
                                        </div>

                                        {certificate.description && (
                                            <p className="certificate-description">
                                                {certificate.description}
                                            </p>
                                        )}

                                        {certificate.credentialUrl && (
                                            <a
                                                href={certificate.credentialUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="certificate-credential-link"
                                            >
                                                View Credential <span>↗</span>
                                            </a>
                                        )}

                                        {pdfUrl && (
                                            <div className="certificate-card-pdf-actions">
                                                <a
                                                    href={pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="certificate-pdf-view-btn"
                                                >
                                                    View PDF ↗
                                                </a>

                                                <a
                                                    href={pdfUrl}
                                                    download
                                                    className="certificate-pdf-download-btn"
                                                >
                                                    ↓ Download PDF
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="certificate-card-footer">
                                        <span className="certificate-display-order">
                                            Order #{certificate.displayOrder ?? 1}
                                        </span>

                                        <div className="certificate-card-actions">
                                            <button
                                                type="button"
                                                className="certificate-edit-btn"
                                                onClick={() =>
                                                    openEditForm(certificate)
                                                }
                                            >
                                                ✎ Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="certificate-delete-btn"
                                                onClick={() =>
                                                    handleDelete(certificate.id)
                                                }
                                                disabled={
                                                    deletingId === certificate.id
                                                }
                                            >
                                                {deletingId === certificate.id
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
        </div>
    );
}

export default AdminCertificates;
