import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import "./AdminExperience.css";



const API_URL = "http://localhost:6060/api/experiences";

const isValidHttpUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};



const emptyForm = {

    position: "",

    company: "",

    employmentType: "",

    startDate: "",

    endDate: "",

    currentlyWorking: false,

    location: "",

    description: "",

    technologies: "",

    companyUrl: "",

    displayOrder: 1,

    featured: false,

};



function AdminExperience() {



    const { token } = useAuth();



    const [experiences, setExperiences] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);



    const [form, setForm] = useState(emptyForm);



    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);



    const [successMessage, setSuccessMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");





    // =========================================================

    // LOAD EXPERIENCES

    // =========================================================



    const loadExperiences = useCallback(async () => {



        try {



            setLoading(true);

            setErrorMessage("");



            const response = await fetch(

                `${API_URL}/ordered`

            );



            if (!response.ok) {

                throw new Error(

                    `Failed to load experiences (${response.status})`

                );

            }



            const data = await response.json();



            setExperiences(

                Array.isArray(data) ? data : []

            );



        } catch (error) {



            console.error(

                "Load experiences error:",

                error

            );



            setErrorMessage(

                "Unable to load experiences."

            );



        } finally {



            setLoading(false);

        }

    }, []);





    // =========================================================

    // INITIAL LOAD

    // =========================================================



    useEffect(() => {
        loadExperiences();
    }, [loadExperiences]);





    // =========================================================

    // FORM INPUT CHANGE

    // =========================================================



    const handleChange = (event) => {



        const {

            name,

            value,

            type,

            checked

        } = event.target;



        setForm((previous) => ({

            ...previous,

            [name]:

                type === "checkbox"

                    ? checked

                    : value

        }));

    };





    // =========================================================

    // OPEN ADD FORM

    // =========================================================



    const openAddForm = () => {



        setEditingId(null);



        setForm({

            ...emptyForm

        });



        setSuccessMessage("");

        setErrorMessage("");



        setShowForm(true);

    };





    // =========================================================

    // OPEN EDIT FORM

    // =========================================================



    const openEditForm = (experience) => {



        setEditingId(experience.id);



        setForm({

            position: experience.position || "",

            company: experience.company || "",

            employmentType:

                experience.employmentType || "",

            startDate:

                experience.startDate || "",

            endDate:

                experience.endDate || "",

            currentlyWorking:

                Boolean(experience.currentlyWorking),

            location:

                experience.location || "",

            description:

                experience.description || "",

            technologies:

                experience.technologies || "",

            companyUrl:

                experience.companyUrl || "",

            displayOrder:

                experience.displayOrder ?? 1,

            featured:

                Boolean(experience.featured),

        });



        setSuccessMessage("");

        setErrorMessage("");



        setShowForm(true);

    };





    // =========================================================

    // CLOSE FORM

    // =========================================================



    const closeForm = () => {



        if (saving) {

            return;

        }



        setShowForm(false);

        setEditingId(null);



        setForm({

            ...emptyForm

        });

    };





    // =========================================================

    // FORM SUBMIT

    // =========================================================



    const handleSubmit = async (event) => {



        event.preventDefault();



        setSuccessMessage("");

        setErrorMessage("");

        if (!token) {
            setErrorMessage("Your session has expired. Please log in again.");
            return;
        }





        // -----------------------------------------------------

        // BASIC VALIDATION

        // -----------------------------------------------------



        if (!form.position.trim()) {



            setErrorMessage(

                "Job Title is required."

            );



            return;

        }





        if (!form.company.trim()) {



            setErrorMessage(

                "Company is required."

            );



            return;

        }





        if (

            form.companyUrl.trim() &&

            !isValidHttpUrl(

                form.companyUrl.trim()

            )

        ) {



            setErrorMessage(

                "Company URL must start with http:// or https://"

            );



            return;

        }





        if (
            form.displayOrder === "" ||
            !Number.isInteger(Number(form.displayOrder)) ||
            Number(form.displayOrder) < 1
        ) {



            setErrorMessage(

                "Display Order must be at least 1."

            );



            return;

        }





        // -----------------------------------------------------

        // REQUEST DATA

        // -----------------------------------------------------



        const payload = {

            position: form.position.trim(),



            company: form.company.trim(),



            employmentType:

                form.employmentType || null,



            startDate:

                form.startDate.trim() || null,



            endDate:

                form.currentlyWorking

                    ? null

                    : (

                        form.endDate.trim() ||

                        null

                    ),



            currentlyWorking:

                Boolean(form.currentlyWorking),



            location:

                form.location.trim() || null,



            description:

                form.description.trim() || null,



            technologies:

                form.technologies.trim() || null,



            companyUrl:

                form.companyUrl.trim() || null,



            displayOrder:

                Number(form.displayOrder),



            featured:

                Boolean(form.featured),

        };





        // -----------------------------------------------------

        // API URL + METHOD

        // -----------------------------------------------------



        const isEditing =

            editingId !== null;



        const url = isEditing

            ? `${API_URL}/${editingId}`

            : API_URL;



        const method = isEditing

            ? "PUT"

            : "POST";





        try {



            setSaving(true);





            const response = await fetch(

                url,

                {

                    method,



                    headers: {

                        "Content-Type":

                            "application/json",



                        Authorization:

                            `Bearer ${token}`,

                    },



                    body:

                        JSON.stringify(payload),

                }

            );





            // -------------------------------------------------

            // ERROR RESPONSE

            // -------------------------------------------------



            if (!response.ok) {



                let message =

                    `Request failed (${response.status})`;



                try {



                    const errorData =

                        await response.json();



                    if (

                        errorData?.message

                    ) {

                        message =

                            errorData.message;

                    }



                } catch {

                    // Ignore non-JSON error

                }



                throw new Error(message);

            }





            // -------------------------------------------------

            // SUCCESS

            // -------------------------------------------------




            setSuccessMessage(

                isEditing

                    ? "Experience updated successfully."

                    : "Experience added successfully."

            );





            setShowForm(false);

            setEditingId(null);



            setForm({

                ...emptyForm

            });





            await loadExperiences();





        } catch (error) {



            console.error(

                "Save experience error:",

                error

            );



            setErrorMessage(

                error.message ||

                "Unable to save experience."

            );



        } finally {



            setSaving(false);

        }

    };





    // =========================================================

    // DELETE EXPERIENCE

    // =========================================================



    const handleDelete = async (id) => {

        if (!token) {
            setErrorMessage("Your session has expired. Please log in again.");
            return;
        }

        const confirmed =

            window.confirm(

                "Are you sure you want to delete this experience?"

            );



        if (!confirmed) {

            return;

        }





        try {



            setDeletingId(id);

            setErrorMessage("");

            setSuccessMessage("");





            const response = await fetch(

                `${API_URL}/${id}`,

                {

                    method: "DELETE",



                    headers: {

                        Authorization:

                            `Bearer ${token}`,

                    },

                }

            );





            if (!response.ok) {



                let message =

                    `Delete failed (${response.status})`;



                try {



                    const errorData =

                        await response.json();



                    if (

                        errorData?.message

                    ) {

                        message =

                            errorData.message;

                    }



                } catch {

                    // Ignore non-JSON error

                }



                throw new Error(message);

            }





            setSuccessMessage(

                "Experience deleted successfully."

            );





            await loadExperiences();





        } catch (error) {



            console.error(

                "Delete experience error:",

                error

            );



            setErrorMessage(

                error.message ||

                "Unable to delete experience."

            );



        } finally {



            setDeletingId(null);

        }

    };





    // =========================================================

    // STATISTICS

    // =========================================================



    const totalExperience =

        experiences.length;



    const currentPositions =

        experiences.filter(

            (experience) =>

                experience.currentlyWorking

        ).length;



    const featuredExperiences =

        experiences.filter(

            (experience) =>

                experience.featured

        ).length;



    const companies =

        new Set(

            experiences

                .map(

                    (experience) =>

                        experience.company

                )

                .filter(Boolean)

        ).size;





    // =========================================================

    // RENDER

    // =========================================================



    return (

        <div className="admin-experience-page">



            {
            /* ==========================================

                PAGE HEADER

            ========================================== */}



            <section className="experience-page-header">



                <div className="experience-header-left">



                    <div className="experience-title-icon">

                        ◫

                    </div>



                    <div>



                        <div className="experience-eyebrow">

                            ADMIN PANEL

                        </div>



                        <h1>

                            Experience

                        </h1>



                        <p>

                            Manage your professional work

                            experience and career journey.

                        </p>



                    </div>



                </div>





                <div className="experience-header-actions">



                    <button

                        type="button"

                        className="experience-add-btn"

                        onClick={openAddForm}

                    >

                        <span>＋</span>

                        Add Experience

                    </button>



                </div>



            </section>





            {/* ==========================================

                SUCCESS / ERROR

            ========================================== */}



            {successMessage && (

                <div className="experience-success-message">

                    {successMessage}

                </div>

            )}



            {errorMessage && (

                <div className="experience-error-message">

                    {errorMessage}

                </div>

            )}





            {/* ==========================================

                STATS

            ========================================== */}



            <section className="experience-stats-grid">



                <div className="experience-stat-card">



                    <div className="experience-stat-icon blue">

                        ◫

                    </div>



                    <div>



                        <span>

                            Total Experience

                        </span>



                        <strong>

                            {totalExperience}

                        </strong>



                    </div>



                </div>





                <div className="experience-stat-card">



                    <div className="experience-stat-icon teal">

                        ●

                    </div>



                    <div>



                        <span>

                            Current Position

                        </span>



                        <strong>

                            {currentPositions}

                        </strong>



                    </div>



                </div>





                <div className="experience-stat-card">



                    <div className="experience-stat-icon gold">

                        ★

                    </div>



                    <div>



                        <span>

                            Featured

                        </span>



                        <strong>

                            {featuredExperiences}

                        </strong>



                    </div>



                </div>





                <div className="experience-stat-card">



                    <div className="experience-stat-icon purple">

                        ◷

                    </div>



                    <div>



                        <span>

                            Companies

                        </span>



                        <strong>

                            {companies}

                        </strong>



                    </div>



                </div>



            </section>





            {/* ==========================================

                FORM

            ========================================== */}



            {showForm && (

                <section className="experience-form-card">



                    <div className="experience-form-header">



                        <div>



                            <div className="experience-form-eyebrow">

                                {editingId !== null

                                    ? "EDIT RECORD"

                                    : "NEW RECORD"}

                            </div>



                            <h2>

                                {editingId !== null

                                    ? "Edit Experience"

                                    : "Add Experience"}

                            </h2>



                            <p>

                                Enter your professional

                                experience details.

                            </p>



                        </div>





                        <button

                            type="button"

                            className="experience-close-btn"

                            onClick={closeForm}

                            disabled={saving}

                        >

                            ×

                        </button>



                    </div>





                    <form

                        className="experience-form-body"

                        onSubmit={handleSubmit}

                    >



                        <div className="experience-form-grid">





                            {/* JOB TITLE */}



                            <div className="experience-form-group">



                                <label>

                                    Job Title \*

                                </label>



                                <input

                                    type="text"

                                    name="position"

                                    value={form.position}

                                    onChange={handleChange}

                                    placeholder="e.g. Full Stack Developer"

                                    disabled={saving}

                                />



                            </div>





                            {/* COMPANY */}



                            <div className="experience-form-group">



                                <label>

                                    Company \*

                                </label>



                                <input

                                    type="text"

                                    name="company"

                                    value={form.company}

                                    onChange={handleChange}

                                    placeholder="e.g. Personal & Academic Projects"

                                    disabled={saving}

                                />



                            </div>





                            {/* EMPLOYMENT TYPE */}



                            <div className="experience-form-group">



                                <label>

                                    Employment Type

                                </label>



                                <select

                                    name="employmentType"

                                    value={form.employmentType}

                                    onChange={handleChange}

                                    disabled={saving}

                                >



                                    <option value="">

                                        Select type

                                    </option>



                                    <option value="Full Time">

                                        Full Time

                                    </option>



                                    <option value="Part Time">

                                        Part Time

                                    </option>



                                    <option value="Internship">

                                        Internship

                                    </option>



                                    <option value="Freelance">

                                        Freelance

                                    </option>



                                    <option value="Project">

                                        Project

                                    </option>



                                </select>



                            </div>





                            {/* LOCATION */}



                            <div className="experience-form-group">



                                <label>

                                    Location

                                </label>



                                <input

                                    type="text"

                                    name="location"

                                    value={form.location}

                                    onChange={handleChange}

                                    placeholder="e.g. India"

                                    disabled={saving}

                                />



                            </div>





                            {/* START DATE */}



                            <div className="experience-form-group">



                                <label>

                                    Start Date

                                </label>



                                <input

                                    type="text"

                                    name="startDate"

                                    value={form.startDate}

                                    onChange={handleChange}

                                    placeholder="e.g. 2024"

                                    disabled={saving}

                                />



                            </div>





                            {/* END DATE */}



                            <div className="experience-form-group">



                                <label>

                                    End Date

                                </label>



                                <input

                                    type="text"

                                    name="endDate"

                                    value={form.endDate}

                                    onChange={handleChange}

                                    placeholder="e.g. 2025"

                                    disabled={

                                        saving ||

                                        form.currentlyWorking

                                    }

                                />



                            </div>





                            {/* TECHNOLOGIES */}



                            <div className="experience-form-group">



                                <label>

                                    Technologies

                                </label>



                                <input

                                    type="text"

                                    name="technologies"

                                    value={form.technologies}

                                    onChange={handleChange}

                                    placeholder="Java, Spring Boot, React, PostgreSQL"

                                    disabled={saving}

                                />



                            </div>





                            {/* COMPANY URL */}



                            <div className="experience-form-group">



                                <label>

                                    Company URL

                                </label>



                                <input

                                    type="url"

                                    name="companyUrl"

                                    value={form.companyUrl}

                                    onChange={handleChange}

                                    placeholder="https://example.com"

                                    disabled={saving}

                                />



                            </div>





                            {/* DISPLAY ORDER */}



                            <div className="experience-form-group">



                                <label>

                                    Display Order

                                </label>



                                <input

                                    type="number"

                                    name="displayOrder"

                                    min="1"

                                    value={form.displayOrder}

                                    onChange={handleChange}

                                    disabled={saving}

                                />



                            </div>



                        </div>





                        {/* DESCRIPTION */}



                        <div className="experience-form-group experience-description-group">



                            <label>

                                Description

                            </label>



                            <textarea

                                name="description"

                                value={form.description}

                                onChange={handleChange}

                                placeholder="Describe your responsibilities, achievements and work..."

                                disabled={saving}

                            />



                        </div>





                        {/* CHECKBOXES */}



                        <div className="experience-form-options">





                            {/* CURRENT POSITION */}



                            <label className="experience-checkbox-label">



                                <input

                                    type="checkbox"

                                    name="currentlyWorking"

                                    checked={

                                        form.currentlyWorking

                                    }

                                    onChange={handleChange}

                                    disabled={saving}

                                />



                                <span className="experience-custom-checkbox">

                                    ✓

                                </span>



                                <span>

                                    Current Position

                                </span>



                            </label>





                            {/* FEATURED */}



                            <label className="experience-checkbox-label">



                                <input

                                    type="checkbox"

                                    name="featured"

                                    checked={

                                        form.featured

                                    }

                                    onChange={handleChange}

                                    disabled={saving}

                                />



                                <span className="experience-custom-checkbox">

                                    ✓

                                </span>



                                <span>

                                    Featured Experience

                                </span>



                            </label>



                        </div>





                        {/* FORM ACTIONS */}



                        <div className="experience-form-actions">



                            <button

                                type="button"

                                className="experience-cancel-btn"

                                onClick={closeForm}

                                disabled={saving}

                            >

                                Cancel

                            </button>



                            <button

                                type="submit"

                                className="experience-save-btn"

                                disabled={saving}

                            >



                                <span>

                                    {saving ? "..." : "＋"}

                                </span>



                                {saving

                                    ? "Saving..."

                                    : editingId !== null

                                        ? "Update Experience"

                                        : "Save Experience"}



                            </button>



                        </div>



                    </form>



                </section>

            )}





            {/* ==========================================

                EXPERIENCE COLLECTION

            ========================================== */}



            <section className="experience-list-section">



                <div className="experience-list-header">



                    <div>



                        <div className="experience-form-eyebrow">

                            CAREER JOURNEY

                        </div>



                        <h2>

                            Experience Collection

                        </h2>



                        <p>

                            Your professional work history

                            and experience.

                        </p>



                    </div>



                    <div className="experience-count-badge">

                        {experiences.length} Records

                    </div>



                </div>





                {/* LOADING */}



                {loading && (

                    <div className="experience-empty">



                        <div className="experience-empty-icon">

                            ◷

                        </div>



                        <h3>

                            Loading Experiences

                        </h3>



                        <p>

                            Please wait while experiences

                            are being loaded.

                        </p>



                    </div>

                )}





                {/* EMPTY */}



                {!loading &&

                    experiences.length === 0 && (



                        <div className="experience-empty">



                            <div className="experience-empty-icon">

                                ◫

                            </div>



                            <h3>

                                No Experience Added

                            </h3>



                            <p>

                                Add your professional

                                experience to showcase

                                your career journey.

                            </p>



                            <button

                                type="button"

                                className="experience-empty-btn"

                                onClick={openAddForm}

                            >

                                <span>＋</span>

                                Add Your First Experience

                            </button>



                        </div>

                    )}





                {/* COLLECTION */}



                {!loading &&

                    experiences.length > 0 && (



                        <div className="experience-collection-grid">



                            {experiences.map(

                                (experience) => (



                                    <article

                                        key={experience.id}

                                        className="experience-card"

                                    >



                                        <div className="experience-card-top">



                                            <div>



                                                <div className="experience-card-position">

                                                    {experience.position}

                                                </div>



                                                <div className="experience-card-company">

                                                    {experience.company}

                                                </div>



                                            </div>





                                            {experience.featured && (

                                                <span className="experience-featured-badge">

                                                    ★ Featured

                                                </span>

                                            )}



                                        </div>





                                        <div className="experience-card-meta">



                                            {experience.employmentType && (

                                                <span>

                                                    {experience.employmentType}

                                                </span>

                                            )}



                                            {experience.location && (

                                                <span>

                                                    {experience.location}

                                                </span>

                                            )}



                                        </div>





                                        {(experience.startDate ||

                                            experience.endDate ||

                                            experience.currentlyWorking) && (



                                            <div className="experience-card-dates">



                                                <span>

                                                    {experience.startDate || "Start"}

                                                </span>



                                                <span>

                                                    →

                                                </span>



                                                <span>

                                                    {experience.currentlyWorking

                                                        ? "Present"

                                                        : experience.endDate || "Present"}

                                                </span>



                                            </div>

                                        )}





                                        {experience.description && (

                                            <p className="experience-card-description">

                                                {experience.description}

                                            </p>

                                        )}





                                        {experience.technologies && (



                                            <div className="experience-card-technologies">



                                                {experience.technologies

                                                    .split(",")

                                                    .map(

                                                        (technology, index) => (



                                                            <span

                                                                key={`${experience.id}-${index}`}

                                                            >

                                                                {technology.trim()}

                                                            </span>



                                                        )

                                                    )}



                                            </div>

                                        )}





                                        {experience.companyUrl && (



                                            <a

                                                href={experience.companyUrl}

                                                target="_blank"

                                                rel="noopener noreferrer"

                                                className="experience-company-link"

                                            >

                                                Visit Company ↗

                                            </a>

                                        )}





                                        <div className="experience-card-actions">



                                            <button

                                                type="button"

                                                className="experience-edit-btn"

                                                onClick={() =>

                                                    openEditForm(

                                                        experience

                                                    )

                                                }

                                                disabled={

                                                    deletingId !== null

                                                }

                                            >

                                                ✎ Edit

                                            </button>





                                            <button

                                                type="button"

                                                className="experience-delete-btn"

                                                onClick={() =>

                                                    handleDelete(

                                                        experience.id

                                                    )

                                                }

                                                disabled={

                                                    deletingId ===

                                                    experience.id

                                                }

                                            >

                                                {deletingId ===

                                                experience.id

                                                    ? "Deleting..."

                                                    : "✕ Delete"}

                                            </button>



                                        </div>



                                    </article>

                                )

                            )}



                        </div>

                    )}



            </section>



        </div>

    );

}



export default AdminExperience;