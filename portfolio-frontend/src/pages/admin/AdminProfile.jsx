import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminProfile.css";

const API_BASE_URL = "http://localhost:6060";

const DEFAULT_PROFILE = {
    name: "",
    headline: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    githubUrl: "https://github.com/AnishQureshi-65",
    linkedinUrl:
        "https://www.linkedin.com/in/anish-qureshi-17755b304/",
    profileImage: "",
    resumeUrl: "",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10 MB

function getMediaUrl(path) {
    if (typeof path !== "string" || !path.trim()) {
        return "";
    }

    const value = path.trim();

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function normalizeProfile(data) {
    const candidate = data?.profile ?? data?.data ?? data;

    if (
        !candidate ||
        typeof candidate !== "object" ||
        Array.isArray(candidate)
    ) {
        return { ...DEFAULT_PROFILE };
    }

    return {
        ...DEFAULT_PROFILE,
        ...Object.fromEntries(
            Object.keys(DEFAULT_PROFILE)
                .filter((key) => candidate[key] != null)
                .map((key) => [key, candidate[key]])
        ),
        githubUrl:
            candidate.githubUrl || DEFAULT_PROFILE.githubUrl,
        linkedinUrl:
            candidate.linkedinUrl || DEFAULT_PROFILE.linkedinUrl,
    };
}

async function readResponse(response) {
    const text = await response.text();
    let data = {};

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error(
                "Session expire ho sakta hai ya aapko permission nahi hai. Please login check karein."
            );
        }

        throw new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
}

function getErrorMessage(error, fallback) {
    return error instanceof Error && error.message
        ? error.message
        : fallback;
}

export default function AdminProfile() {
    const { admin, token } = useAuth();

    const [profile, setProfile] = useState(DEFAULT_PROFILE);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const loadProfile = useCallback(
        async (signal) => {
            if (!token) {
                setError(
                    "Authentication token nahi mila. Please login karein."
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                setSuccess("");

                const response = await fetch(
                    `${API_BASE_URL}/api/admin/profile`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal,
                    }
                );

                const data = await readResponse(response);

                if (signal?.aborted) return;

                setProfile(normalizeProfile(data));
            } catch (err) {
                if (err.name === "AbortError") return;

                setError(
                    getErrorMessage(
                        err,
                        "Profile load nahi ho paayi."
                    )
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [token]
    );

    useEffect(() => {
        const controller = new AbortController();

        loadProfile(controller.signal);

        return () => controller.abort();
    }, [loadProfile]);

    function handleChange(event) {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSuccess("");
        setError("");
    }

    async function uploadFile(file, type) {
        if (!file) return;

        const isImage = type === "image";
        const maxSize = isImage
            ? MAX_IMAGE_SIZE
            : MAX_RESUME_SIZE;

        if (isImage && !file.type.startsWith("image/")) {
            setError("Please valid image file select karein.");
            setSuccess("");
            return;
        }

        if (
            !isImage &&
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            setError("Resume ke liye sirf PDF file allowed hai.");
            setSuccess("");
            return;
        }

        if (file.size > maxSize) {
            setError(
                isImage
                    ? "Image ka size maximum 5 MB hona chahiye."
                    : "Resume PDF ka size maximum 10 MB hona chahiye."
            );
            setSuccess("");
            return;
        }

        if (!token) {
            setError(
                "Authentication token nahi mila. Please login karein."
            );
            setSuccess("");
            return;
        }

        if (
            saving ||
            uploadingImage ||
            uploadingResume
        ) {
            return;
        }

        const setUploading = isImage
            ? setUploadingImage
            : setUploadingResume;

        const endpoint = isImage
            ? "/api/upload/profile-image"
            : "/api/upload/resume";

        const fieldName = isImage
            ? "profileImage"
            : "resumeUrl";

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await readResponse(response);
            const fileUrl = data?.fileUrl || data?.url;

            if (
                typeof fileUrl !== "string" ||
                !fileUrl.trim()
            ) {
                throw new Error(
                    "Upload response mein file URL nahi mila."
                );
            }

            setProfile((previous) => ({
                ...previous,
                [fieldName]: fileUrl,
            }));

            setSuccess(
                isImage
                    ? "Profile image upload ho gayi. Changes save karna na bhoolein."
                    : "Resume upload ho gaya. Changes save karna na bhoolein."
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    isImage
                        ? "Profile image upload nahi ho paayi."
                        : "Resume upload nahi ho saka."
                )
            );
        } finally {
            setUploading(false);
        }
    }

    function handleImageUpload(event) {
        const file = event.target.files?.[0];

        // Same file dobara select ki ja sakti hai.
        event.target.value = "";

        uploadFile(file, "image");
    }

    function handleResumeUpload(event) {
        const file = event.target.files?.[0];

        event.target.value = "";

        uploadFile(file, "resume");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!token) {
            setError(
                "Authentication token nahi mila. Please login karein."
            );
            setSuccess("");
            return;
        }

        if (uploadingImage || uploadingResume || saving) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_BASE_URL}/api/admin/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(profile),
                }
            );

            const data = await readResponse(response);

            const returnedProfile =
                data?.profile ?? data?.data;

            if (
                returnedProfile &&
                typeof returnedProfile === "object" &&
                !Array.isArray(returnedProfile)
            ) {
                setProfile((previous) => ({
                    ...previous,
                    ...Object.fromEntries(
                        Object.keys(DEFAULT_PROFILE)
                            .filter(
                                (key) => returnedProfile[key] != null
                            )
                            .map((key) => [
                                key,
                                returnedProfile[key],
                            ])
                    ),
                }));
            }

            setSuccess(
                data?.message ||
                "Profile successfully save ho gayi!"
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Profile save nahi ho paayi."
                )
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="profile-management">
                <div
                    className="profile-loading"
                    role="status"
                    aria-live="polite"
                >
                    <span
                        className="profile-spinner"
                        aria-hidden="true"
                    />
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    const isBusy =
        saving || uploadingImage || uploadingResume;

    const profileInitial = (
        profile.name || admin?.name || "A"
    )
        .trim()
        .charAt(0)
        .toUpperCase();

    return (
        <div className="profile-management">
            {/* PAGE HEADER */}
            <header className="profile-page-header">
                <div>
                    <span className="profile-page-label">
                        ADMINISTRATION / PROFILE
                    </span>

                    <h1>Profile Management</h1>

                    <p>
                        Manage your public identity, social links and
                        portfolio media from one place.
                    </p>
                </div>

                <div className="profile-header-badge">
                    <span
                        className="profile-status-dot"
                        aria-hidden="true"
                    />
                    Profile Settings
                </div>
            </header>

            {/* ALERTS */}
            {success && (
                <div
                    className="profile-alert success"
                    role="status"
                    aria-live="polite"
                >
                    <span aria-hidden="true">✓</span>
                    <p>{success}</p>
                </div>
            )}

            {error && (
                <div
                    className="profile-alert error"
                    role="alert"
                    aria-live="assertive"
                >
                    <span aria-hidden="true">!</span>
                    <p>{error}</p>
                </div>
            )}

            <form
                className="profile-form"
                onSubmit={handleSubmit}
            >
                {/* BASIC INFORMATION */}
                <section
                    className="profile-card"
                    aria-labelledby="profile-basic-heading"
                >
                    <div className="profile-card-header">
                        <div>
                            <span>01</span>
                            <div>
                                <h2 id="profile-basic-heading">
                                    Basic Information
                                </h2>
                                <p>
                                    Your name and the information
                                    visitors see on your portfolio.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-grid">
                        <div className="profile-field">
                            <label htmlFor="profile-name">
                                Full Name *
                            </label>

                            <input
                                id="profile-name"
                                name="name"
                                type="text"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-headline">
                                Professional Headline
                            </label>

                            <input
                                id="profile-headline"
                                name="headline"
                                type="text"
                                value={profile.headline}
                                onChange={handleChange}
                                placeholder="e.g. Java Developer | React"
                                maxLength={200}
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-email">
                                Email Address
                            </label>

                            <input
                                id="profile-email"
                                name="email"
                                type="email"
                                value={profile.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                maxLength={254}
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-phone">
                                Phone Number
                            </label>

                            <input
                                id="profile-phone"
                                name="phone"
                                type="tel"
                                value={profile.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                autoComplete="tel"
                                maxLength={25}
                            />
                        </div>

                        <div className="profile-field full-width">
                            <label htmlFor="profile-location">
                                Location
                            </label>

                            <input
                                id="profile-location"
                                name="location"
                                type="text"
                                value={profile.location}
                                onChange={handleChange}
                                placeholder="e.g. Bhopal, Madhya Pradesh"
                                maxLength={150}
                            />
                        </div>

                        <div className="profile-field full-width">
                            <label htmlFor="profile-bio">
                                About / Bio
                            </label>

                            <textarea
                                id="profile-bio"
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                placeholder="Write a short introduction about yourself..."
                                rows={5}
                                maxLength={3000}
                            />

                            <span className="field-hint">
                                Keep your introduction clear and
                                professional.
                            </span>

                            <span
                                className="field-hint"
                                aria-live="polite"
                            >
                                {profile.bio.length}/3000 characters
                            </span>
                        </div>
                    </div>
                </section>

                {/* SOCIAL LINKS */}
                <section
                    className="profile-card"
                    aria-labelledby="profile-social-heading"
                >
                    <div className="profile-card-header">
                        <div>
                            <span>02</span>
                            <div>
                                <h2 id="profile-social-heading">
                                    Social Links
                                </h2>
                                <p>
                                    Connect visitors to your
                                    professional profiles.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-grid">
                        <div className="profile-field">
                            <label htmlFor="profile-github">
                                GitHub URL
                            </label>

                            <div className="input-with-icon">
                                <span aria-hidden="true">GH</span>

                                <input
                                    id="profile-github"
                                    name="githubUrl"
                                    type="url"
                                    value={profile.githubUrl}
                                    onChange={handleChange}
                                    placeholder="https://github.com/username"
                                    maxLength={500}
                                />
                            </div>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-linkedin">
                                LinkedIn URL
                            </label>

                            <div className="input-with-icon">
                                <span aria-hidden="true">in</span>

                                <input
                                    id="profile-linkedin"
                                    name="linkedinUrl"
                                    type="url"
                                    value={profile.linkedinUrl}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/username"
                                    maxLength={500}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* PORTFOLIO MEDIA */}
                <section
                    className="profile-card"
                    aria-labelledby="profile-media-heading"
                >
                    <div className="profile-card-header">
                        <div>
                            <span>03</span>
                            <div>
                                <h2 id="profile-media-heading">
                                    Portfolio Media
                                </h2>
                                <p>
                                    Upload your profile picture and
                                    PDF resume.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-media-grid">
                        {/* PROFILE IMAGE */}
                        <div className="profile-media-panel">
                            <div className="profile-media-title">
                                <div>
                                    <span className="profile-media-icon">
                                        <span>IMG</span>
                                    </span>

                                    <div>
                                        <h3>Profile Image</h3>
                                        <p>Image files only · Max 5 MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-image-preview">
                                {profile.profileImage ? (
                                    <img
                                        src={getMediaUrl(
                                            profile.profileImage
                                        )}
                                        alt={`${profile.name || "Profile"} preview`}
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        {profileInitial}
                                    </div>
                                )}
                            </div>

                            <div className="profile-field">
                                <label htmlFor="profile-image-file">
                                    Choose Profile Image
                                </label>

                                <input
                                    id="profile-image-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isBusy}
                                />

                                <span className="field-hint">
                                    Select an image. Upload completes
                                    before you save the profile.
                                </span>
                            </div>

                            {uploadingImage && (
                                <div
                                    className="profile-upload-status"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <span
                                        className="button-spinner"
                                        aria-hidden="true"
                                    />
                                    Uploading image...
                                </div>
                            )}
                        </div>

                        {/* RESUME */}
                        <div className="profile-media-panel">
                            <div className="profile-media-title">
                                <div>
                                    <span className="profile-media-icon">
                                        <span>PDF</span>
                                    </span>

                                    <div>
                                        <h3>Resume / CV</h3>
                                        <p>PDF document · Max 10 MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-resume-preview">
                                <div className="profile-resume-icon">
                                    PDF
                                </div>

                                <div>
                                    <strong>
                                        {profile.resumeUrl
                                            ? "Resume uploaded"
                                            : "No resume uploaded"}
                                    </strong>

                                    <p>
                                        {profile.resumeUrl
                                            ? "Your resume is ready to view."
                                            : "Upload a PDF version of your resume."}
                                    </p>
                                </div>
                            </div>

                            <div className="profile-field">
                                <label htmlFor="profile-resume-file">
                                    Choose Resume PDF
                                </label>

                                <input
                                    id="profile-resume-file"
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={handleResumeUpload}
                                    disabled={isBusy}
                                />

                                <span className="field-hint">
                                    Only PDF files are accepted.
                                </span>
                            </div>

                            {uploadingResume && (
                                <div
                                    className="profile-upload-status"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <span
                                        className="button-spinner"
                                        aria-hidden="true"
                                    />
                                    Uploading resume...
                                </div>
                            )}

                            {profile.resumeUrl && (
                                <div className="profile-resume-actions">
                                    <a
                                        href={getMediaUrl(
                                            profile.resumeUrl
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Resume ↗
                                    </a>

                                    <a
                                        href={getMediaUrl(
                                            profile.resumeUrl
                                        )}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Download ↓
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* SAVE AREA */}
                <div className="profile-save-area">
                    <div>
                        <span className="save-status-dot" />
                        <span>
                            Your changes are saved only after you
                            click Save Changes.
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="profile-save-button"
                        disabled={isBusy}
                    >
                        {saving ? (
                            <>
                                <span
                                    className="button-spinner"
                                    aria-hidden="true"
                                />
                                Saving Profile...
                            </>
                        ) : (
                            <>
                                <span aria-hidden="true">✓</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}