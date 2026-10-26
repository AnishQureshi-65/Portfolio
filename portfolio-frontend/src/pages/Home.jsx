import { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import "./Home.css";



const API_BASE_URL = "http://localhost:6060";



const PROFILE_API_URL = `${API_BASE_URL}/api/profile`;

const EXPERIENCE_API_URL = `${API_BASE_URL}/api/experiences/featured`;

const PROJECTS_API_URL = `${API_BASE_URL}/api/projects/featured`;

const SKILLS_API_URL = `${API_BASE_URL}/api/skills/featured`;

const CERTIFICATES_API_URL = `${API_BASE_URL}/api/certificates/featured`;

const EDUCATION_API_URL = `${API_BASE_URL}/api/education/featured`;



function Home() {

    const [profile, setProfile] = useState(null);
    const [typedName, setTypedName] = useState("");
    const [typedHeadline, setTypedHeadline] = useState("");
    const [activeTypingLine, setActiveTypingLine] = useState("name");
    const portfolioHeadline = "B.Tech CSE (AI/ML) | Java | Spring Boot | HTML | CSS";

    const [experiences, setExperiences] = useState([]);

    const [projects, setProjects] = useState([]);

    const [skills, setSkills] = useState([]);

    const [certificates, setCertificates] = useState([]);

    const [education, setEducation] = useState([]);



    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");



    // =========================================================

    // GET IMAGE URL

    // =========================================================



    const getImageUrl = (imagePath) => {

        if (!imagePath || typeof imagePath !== "string") {

            return "";

        }



        if (

            imagePath.startsWith("http://") ||

            imagePath.startsWith("https://")

        ) {

            return imagePath;

        }



        return `${API_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;

    };



    // =========================================================

    // FETCH HOME DATA

    // =========================================================



    const fetchHomeData = useCallback(async () => {

        setLoading(true);

        setError("");



        // PROFILE

        try {

            const response = await fetch(PROFILE_API_URL);



            if (!response.ok) {

                throw new Error(`Profile API error: ${response.status}`);

            }



            const data = await response.json();



            setProfile(

                Array.isArray(data) ? data[0] || null : data

            );

        } catch (err) {

            console.error("Profile fetch error:", err);

            setProfile(null);

            setError("Unable to load profile data. Please try again.");

        }



        // EXPERIENCE

        try {

            const response = await fetch(EXPERIENCE_API_URL);



            if (!response.ok) {

                throw new Error(`Experience API error: ${response.status}`);

            }



            const data = await response.json();

            setExperiences(Array.isArray(data) ? data : []);

        } catch (err) {

            console.error("Experience fetch error:", err);

            setExperiences([]);

        }



        // PROJECTS

        try {

            const response = await fetch(PROJECTS_API_URL);



            if (!response.ok) {

                throw new Error(`Projects API error: ${response.status}`);

            }



            const data = await response.json();

            setProjects(Array.isArray(data) ? data : []);

        } catch (err) {

            console.error("Projects fetch error:", err);

            setProjects([]);

        }



        // SKILLS

        try {

            const response = await fetch(SKILLS_API_URL);



            if (!response.ok) {

                throw new Error(`Skills API error: ${response.status}`);

            }



            const data = await response.json();

            setSkills(Array.isArray(data) ? data : []);

        } catch (err) {

            console.error("Skills fetch error:", err);

            setSkills([]);

        }



        // CERTIFICATES

        try {

            const response = await fetch(CERTIFICATES_API_URL);



            if (!response.ok) {

                throw new Error(

                    `Certificates API error: ${response.status}`

                );

            }



            const data = await response.json();

            setCertificates(Array.isArray(data) ? data : []);

        } catch (err) {

            console.error("Certificates fetch error:", err);

            setCertificates([]);

        }



        // EDUCATION

        try {

            const response = await fetch(EDUCATION_API_URL);



            if (!response.ok) {

                throw new Error(

                    `Education API error: ${response.status}`

                );

            }



            const data = await response.json();



            console.log("Education API Data:", data);



            setEducation(Array.isArray(data) ? data : []);

        } catch (err) {

            console.error("Education fetch error:", err);

            setEducation([]);

        } finally {

            setLoading(false);

        }

    }, []);



    useEffect(() => {

        fetchHomeData();

    }, [fetchHomeData]);

    // Reveal portfolio cards from alternating sides while scrolling.
    // Cards hide again after leaving the viewport, including on upward scroll.
    useEffect(() => {
        const groups = [
            ".home-skills-grid > .home-skill-card",
            ".home-education-list > .home-education-card",
            ".home-experience-list > .home-experience-card",
            ".home-projects-grid > .home-project-card",
            ".home-certificates-grid > .home-certificate-card",
            ".services-grid > .service-card",
        ];

        const cards = groups.flatMap((selector) => {
            const matches = Array.from(document.querySelectorAll(selector));
            matches.forEach((card, index) => {
                card.classList.add("scroll-reveal-card");
                card.classList.remove("scroll-reveal-left", "scroll-reveal-right");
                card.classList.add(index % 2 === 0 ? "scroll-reveal-left" : "scroll-reveal-right");
                card.style.setProperty("--scroll-reveal-delay", `${Math.min(index * 100, 500)}ms`);
            });
            return matches;
        });

        if (!("IntersectionObserver" in window)) {
            cards.forEach((card) => card.classList.add("scroll-reveal-visible"));
            return undefined;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("scroll-reveal-visible");
                } else {
                    entry.target.classList.remove("scroll-reveal-visible");
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

        cards.forEach((card) => observer.observe(card));
        return () => observer.disconnect();
    }, [skills.length, projects.length, experiences.length, certificates.length, education.length]);

    // One shared typing cursor: type the name, then the headline, pause 10 seconds, repeat.
    useEffect(() => {
        const fullName = String(profile?.name || "").trim();
        setTypedName("");
        setTypedHeadline("");
        setActiveTypingLine("name");
        if (!fullName) return undefined;

        let timeoutId;
        let cancelled = false;
        let nameIndex = 0;
        let headlineIndex = 0;

        const typeHeadline = () => {
            if (cancelled) return;
            setActiveTypingLine("headline");
            headlineIndex += 1;
            setTypedHeadline(portfolioHeadline.slice(0, headlineIndex));
            if (headlineIndex < portfolioHeadline.length) {
                timeoutId = window.setTimeout(typeHeadline, 55);
            } else {
                timeoutId = window.setTimeout(() => {
                    if (cancelled) return;
                    nameIndex = 0;
                    headlineIndex = 0;
                    setTypedName("");
                    setTypedHeadline("");
                    setActiveTypingLine("name");
                    timeoutId = window.setTimeout(typeName, 350);
                }, 10000);
            }
        };

        const typeName = () => {
            if (cancelled) return;
            setActiveTypingLine("name");
            nameIndex += 1;
            setTypedName(fullName.slice(0, nameIndex));
            if (nameIndex < fullName.length) {
                timeoutId = window.setTimeout(typeName, 115);
            } else {
                setActiveTypingLine("headline");
                timeoutId = window.setTimeout(typeHeadline, 300);
            }
        };

        timeoutId = window.setTimeout(typeName, 250);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [profile?.name]);



    // =========================================================

    // LOADING

    // =========================================================



    if (loading) {

        return (

            <div className="home-loading">

                <div className="home-loader"></div>

                <p>Loading portfolio...</p>

            </div>

        );

    }



    // =========================================================

    // ERROR

    // =========================================================



    if (error) {

        return (

            <div className="home-error">

                <div className="home-error-card">

                    <span>⚠</span>

                    <h2>Something went wrong</h2>

                    <p>{error}</p>

                    <button onClick={fetchHomeData}>

                        Try Again

                    </button>

                </div>

            </div>

        );

    }



    // =========================================================

    // NO PROFILE

    // =========================================================



    if (!profile) {

        return (

            <div className="home-empty">

                <div>

                    <h2>No Profile Data Found</h2>

                    <p>

                        Please add your profile information

                        from the Admin Panel.

                    </p>

                </div>

            </div>

        );

    }



    const profileImageUrl = getImageUrl(profile.profileImage);



    // =========================================================

    // MAIN HOME PAGE

    // =========================================================



    return (

        <main className="home-page">



            {/* HERO SECTION */}



            <section className="hero-section">

                <div className="hero-container">



                    <div className="hero-content">

                        <span className="hero-badge">

                            <span className="hero-badge-dot"></span>

                            Available for Opportunities

                        </span>



                        <p className="hero-intro">Hello, I'm</p>



                        <h1 className="hero-title">

                            <span>{typedName}</span>{activeTypingLine === "name" && <span className="hero-typing-cursor" aria-hidden="true">|</span>}

                        </h1>



                        <h2 className="hero-role" aria-label={portfolioHeadline}>
                            <span>{typedHeadline}</span>{activeTypingLine === "headline" && <span className="hero-typing-cursor" aria-hidden="true">|</span>}
                        </h2>



                        {profile.bio && (

                            <p className="hero-description">

                                {profile.bio}

                            </p>

                        )}



                        <div className="hero-actions">

                            <Link

                                to="/projects"

                                className="hero-primary-btn"

                            >

                                View My Projects <span>→</span>

                            </Link>



                            {profile.resumeUrl && (

                                <a

                                    href={getImageUrl(profile.resumeUrl)}

                                    target="_blank"

                                    rel="noopener noreferrer"

                                    className="hero-secondary-btn"

                                >

                                    Download Resume <span>↓</span>

                                </a>

                            )}

                        </div>



                        <div className="hero-socials">

                            {profile.githubUrl && (

                                <a

                                    href={profile.githubUrl}

                                    target="_blank"

                                    rel="noopener noreferrer"

                                    className="social-link"

                                >

                                    GitHub

                                </a>

                            )}



                            {profile.linkedinUrl && (

                                <a

                                    href={profile.linkedinUrl}

                                    target="_blank"

                                    rel="noopener noreferrer"

                                    className="social-link"

                                >

                                    LinkedIn

                                </a>

                            )}



                            {profile.email && (

                                <a

                                    href={`mailto:${profile.email}`}

                                    className="social-link"

                                >

                                    Email

                                </a>

                            )}



                            {profile.phone && (

                                <a

                                    href={`tel:${profile.phone}`}

                                    className="social-link"

                                >

                                    Phone

                                </a>

                            )}

                        </div>

                    </div>



                    <div className="hero-visual">

                        <div className="hero-image-glow"></div>



                        <div className="hero-image-card">

                            {profileImageUrl && (

                                <img

                                    src={profileImageUrl}

                                    alt={profile.name || "Profile"}

                                    className="hero-profile-image"

                                    onError={(event) => {

                                        event.currentTarget.style.display = "none";



                                        const placeholder =

                                            event.currentTarget.nextElementSibling;



                                        if (placeholder) {

                                            placeholder.style.display = "flex";

                                        }

                                    }}

                                />

                            )}



                            <div

                                className="hero-image-placeholder"

                                style={{

                                    display: profileImageUrl ? "none" : "flex",

                                }}

                            >

                                <span>◉</span>

                            </div>

                        </div>



                        <div className="hero-floating-card hero-card-one">

                            <span>⌘</span>

                            <div>

                                <strong>Developer</strong>

                                <small>Java • HTML • CSS</small>

                            </div>

                        </div>



                        <div className="hero-floating-card hero-card-two">

                            <span>AI</span>

                            <div>

                                <strong>AI/ML</strong>

                                <small>Learning & Building</small>

                            </div>

                        </div>

                    </div>

                </div>

            </section>



            {/* PROFILE INFORMATION */}



            <section className="home-info-section">

                <div className="home-info-container">



                    {profile.email && (

                        <div className="home-info-card">

                            <span className="home-info-icon">✉</span>

                            <div>

                                <small>Email</small>

                                <a

                                    href={`mailto:${profile.email}`}

                                    className="home-info-link"

                                >

                                    {profile.email}

                                </a>

                            </div>

                        </div>

                    )}



                    {profile.phone && (

                        <div className="home-info-card">

                            <span className="home-info-icon">☎</span>

                            <div>

                                <small>Phone</small>

                                <a

                                    href={`tel:${profile.phone}`}

                                    className="home-info-link"

                                >

                                    {profile.phone}

                                </a>

                            </div>

                        </div>

                    )}



                    {profile.location && (

                        <div className="home-info-card">

                            <span className="home-info-icon">◉</span>

                            <div>

                                <small>Location</small>

                                <strong>{profile.location}</strong>

                            </div>

                        </div>

                    )}

                </div>

            </section>



            {/* SKILLS SECTION */}



            {skills.length > 0 && (

                <section className="home-skills-section">

                    <div className="home-skills-container">



                        <div className="home-skills-header">

                            <span className="home-skills-label">SKILLS</span>

                            <h2>Technical Expertise</h2>

                            <p>

                                Technologies and tools I use to build modern

                                applications.

                            </p>

                        </div>



                        <div className="home-skills-grid">

                            {skills.map((skill) => {

                                const proficiency = Math.min(

                                    100,

                                    Math.max(0, Number(skill.proficiency ?? 0))

                                );



                                return (

                                    <article

                                        key={skill.id}

                                        className="home-skill-card"

                                    >

                                        <div className="home-skill-top">

                                            <div className="home-skill-icon">

                                                {skill.iconUrl && (

                                                    <img

                                                        src={getImageUrl(skill.iconUrl)}

                                                        alt={skill.name}

                                                        loading="lazy"

                                                        onError={(event) => {

                                                            event.currentTarget.style.display = "none";



                                                            const fallback =

                                                                event.currentTarget.nextElementSibling;



                                                            if (fallback) {

                                                                fallback.style.display = "flex";

                                                            }

                                                        }}

                                                    />

                                                )}



                                                <span

                                                    style={{

                                                        display: skill.iconUrl

                                                            ? "none"

                                                            : "flex",

                                                    }}

                                                >

                                                    ✦

                                                </span>

                                            </div>



                                            {skill.featured && (

                                                <span className="home-skill-featured">

                                                    ★ Featured

                                                </span>

                                            )}

                                        </div>



                                        <div className="home-skill-content">

                                            <div className="home-skill-title-row">

                                                <div>

                                                    <h3>{skill.name}</h3>



                                                    {skill.category && (

                                                        <span className="home-skill-category">

                                                            {skill.category}

                                                        </span>

                                                    )}

                                                </div>



                                                <strong>{proficiency}%</strong>

                                            </div>



                                            {skill.description && (

                                                <p className="home-skill-description">

                                                    {skill.description}

                                                </p>

                                            )}



                                            <div className="home-skill-progress">

                                                <div

                                                    className="home-skill-progress-bar"

                                                    style={{

                                                        width: `${proficiency}%`,

                                                    }}

                                                ></div>

                                            </div>

                                        </div>

                                    </article>

                                );

                            })}

                        </div>

                    </div>

                </section>

            )}



            {/* EDUCATION SECTION - ALWAYS RENDER */}



            <section className="home-education-section">

                <div className="home-education-container">



                    <div className="home-education-header">

                        <span className="home-education-label">

                            EDUCATION

                        </span>



                        <h2>Academic Journey</h2>



                        <p>

                            My educational background and academic achievements.

                        </p>

                    </div>



                    {education.length > 0 ? (

                        <div className="home-education-list">

                            {education.map((item) => (

                                <article

                                    key={item.id}

                                    className="home-education-card"

                                >

                                    <div className="home-education-icon">

                                        <span>🎓</span>

                                    </div>



                                    <div className="home-education-content">

                                        <div className="home-education-top">

                                            <div>

                                                <h3>{item.degree}</h3>



                                                {item.field && (

                                                    <p className="home-education-field">

                                                        {item.field}

                                                    </p>

                                                )}

                                            </div>



                                            {item.featured && (

                                                <span className="home-education-featured">

                                                    ★ Featured

                                                </span>

                                            )}

                                        </div>



                                        <h4 className="home-education-institution">

                                            {item.institution}

                                        </h4>



                                        {(item.startYear || item.endYear) && (

                                            <div className="home-education-dates">

                                                <span>{item.startYear || "—"}</span>

                                                <span> → </span>

                                                <span>{item.endYear || "Present"}</span>

                                            </div>

                                        )}



                                        {item.grade && (

                                            <p className="home-education-grade">

                                                <strong>Grade / Score:</strong>{" "}

                                                {item.grade}

                                            </p>

                                        )}



                                        {item.location && (

                                            <p className="home-education-location">

                                                <span>⌖ </span>

                                                {item.location}

                                            </p>

                                        )}



                                        {item.description && (

                                            <p className="home-education-description">

                                                {item.description}

                                            </p>

                                        )}

                                    </div>

                                </article>

                            ))}

                        </div>

                    ) : (

                        <p className="home-education-empty">

                            Education details are currently unavailable.

                        </p>

                    )}

                </div>

            </section>



            {/* EXPERIENCE SECTION */}



            {experiences.length > 0 && (

                <section className="home-experience-section">

                    <div className="home-experience-container">



                        <div className="home-experience-header">

                            <span className="home-experience-label">

                                EXPERIENCE

                            </span>

                            <h2>Career Journey</h2>

                            <p>My professional and project experience.</p>

                        </div>



                        <div className="home-experience-list">

                            {experiences.map((experience) => (

                                <article

                                    key={experience.id}

                                    className="home-experience-card"

                                >

                                    <div className="home-experience-top">

                                        <div>

                                            <h3>{experience.position}</h3>

                                            <h4>{experience.company}</h4>

                                        </div>



                                        {experience.featured && (

                                            <span className="home-experience-featured">

                                                ★ Featured

                                            </span>

                                        )}

                                    </div>



                                    <div className="home-experience-meta">

                                        {experience.employmentType && (

                                            <span>{experience.employmentType}</span>

                                        )}



                                        {experience.location && (

                                            <span>{experience.location}</span>

                                        )}

                                    </div>



                                    {(experience.startDate ||

                                        experience.endDate ||

                                        experience.currentlyWorking) && (

                                        <div className="home-experience-dates">

                                            {experience.startDate && (

                                                <span>{experience.startDate}</span>

                                            )}



                                            {(experience.endDate ||

                                                experience.currentlyWorking) && (

                                                <span>→</span>

                                            )}



                                            {experience.currentlyWorking ? (

                                                <span>Present</span>

                                            ) : (

                                                experience.endDate && (

                                                    <span>{experience.endDate}</span>

                                                )

                                            )}

                                        </div>

                                    )}



                                    {experience.description && (

                                        <p className="home-experience-description">

                                            {experience.description}

                                        </p>

                                    )}



                                    {experience.technologies && (

                                        <div className="home-experience-technologies">

                                            {experience.technologies

                                                .split(",")

                                                .map((technology, index) => {

                                                    const tech = technology.trim();



                                                    if (!tech) return null;



                                                    return (

                                                        <span

                                                            key={`${tech}-${index}`}

                                                            className="home-experience-tech"

                                                        >

                                                            {tech}

                                                        </span>

                                                    );

                                                })}

                                        </div>

                                    )}



                                    {experience.companyUrl && (

                                        <a

                                            href={experience.companyUrl}

                                            target="_blank"

                                            rel="noopener noreferrer"

                                            className="home-experience-company-link"

                                        >

                                            Visit Company <span>↗</span>

                                        </a>

                                    )}

                                </article>

                            ))}

                        </div>

                    </div>

                </section>

            )}



            {/* PROJECTS SECTION */}



            {projects.length > 0 && (

                <section className="home-projects-section">

                    <div className="home-projects-container">



                        <div className="home-projects-header">

                            <span className="home-projects-label">PROJECTS</span>

                            <h2>Featured Work</h2>

                            <p>

                                Some of the projects I have built using modern

                                technologies.

                            </p>

                        </div>



                        <div className="home-projects-grid">

                            {projects.map((project) => {

                                const imageUrl = getImageUrl(project.imageUrl);



                                return (

                                    <article

                                        key={project.id}

                                        className="home-project-card"

                                    >

                                        <div className="home-project-image">

                                            {imageUrl ? (

                                                <img

                                                    src={imageUrl}

                                                    alt={project.title || "Project"}

                                                    loading="lazy"

                                                    onError={(event) => {

                                                        event.currentTarget.style.display = "none";



                                                        const parent =

                                                            event.currentTarget.parentElement;



                                                        if (parent) {

                                                            parent.classList.add(

                                                                "project-image-error"

                                                            );

                                                        }

                                                    }}

                                                />

                                            ) : (

                                                <div className="home-project-placeholder">

                                                    <span>◇</span>

                                                    <p>Project</p>

                                                </div>

                                            )}



                                            {project.projectType && (

                                                <span className="home-project-type">

                                                    {project.projectType}

                                                </span>

                                            )}

                                        </div>



                                        <div className="home-project-content">

                                            <div className="home-project-top">
                                                <h3>{project.title}</h3>
                                                {project.featured && (
                                                    <span className="home-project-featured">
                                                        ★ Featured
                                                    </span>
                                                )}
                                            </div>



                                            {project.description && (

                                                <p className="home-project-description">

                                                    {project.description}

                                                </p>

                                            )}



                                            {project.technologies && (

                                                <div className="home-project-technologies">

                                                    {project.technologies

                                                        .split(",")

                                                        .map((technology, index) => {

                                                            const tech = technology.trim();



                                                            if (!tech) return null;



                                                            return (

                                                                <span key={`${tech}-${index}`}>

                                                                    {tech}

                                                                </span>

                                                            );

                                                        })}

                                                </div>

                                            )}



                                            <div className="home-project-links">

                                                {project.githubUrl && (

                                                    <a

                                                        href={project.githubUrl}

                                                        target="_blank"

                                                        rel="noopener noreferrer"

                                                        className="home-project-github"

                                                    >

                                                        GitHub <span>↗</span>

                                                    </a>

                                                )}



                                                {project.liveUrl && (

                                                    <a

                                                        href={project.liveUrl}

                                                        target="_blank"

                                                        rel="noopener noreferrer"

                                                        className="home-project-live"

                                                    >

                                                        Live Demo <span>↗</span>

                                                    </a>

                                                )}

                                            </div>

                                        </div>

                                    </article>

                                );

                            })}

                        </div>



                        <div className="home-projects-footer">

                            <Link

                                to="/projects"

                                className="home-projects-view-all"

                            >

                                View All Projects <span>→</span>

                            </Link>

                        </div>

                    </div>

                </section>

            )}



           
{/* CERTIFICATES SECTION */}
{certificates.length > 0 && (
    <section className="home-certificates-section">
        <div className="home-certificates-container">
            <div className="home-certificates-header">
                <span className="home-certificates-label">
                    CERTIFICATIONS
                </span>

                <h2>Certificates & Achievements</h2>

                <p>
                    Professional certifications and achievements
                    that showcase my skills and continuous learning.
                </p>
            </div>

            <div className="home-certificates-grid">
                {certificates.map((certificate) => {
                    const certificateImageUrl = getImageUrl(
                        certificate.certificateImage
                    );

                    const certificatePdfUrl = certificate.certificatePdf
                        ? getImageUrl(certificate.certificatePdf)
                        : "";

                    return (
                        <article
                            key={certificate.id}
                            className="home-certificate-card"
                        >
                            {/* Certificate Image */}
                            <div className="home-certificate-image">
                                {certificateImageUrl && (
                                    <img
                                        src={certificateImageUrl}
                                        alt={
                                            certificate.title ||
                                            "Certificate"
                                        }
                                        loading="lazy"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";

                                            const fallback =
                                                event.currentTarget
                                                    .nextElementSibling;

                                            if (fallback) {
                                                fallback.style.display =
                                                    "flex";
                                            }
                                        }}
                                    />
                                )}

                                <div
                                    className="home-certificate-placeholder"
                                    style={{
                                        display: certificateImageUrl
                                            ? "none"
                                            : "flex",
                                    }}
                                >
                                    <span>🏆</span>
                                    <p>Certificate</p>
                                </div>
                            </div>

                            {/* Certificate Details */}
                            <div className="home-certificate-content">
                                <div className="home-certificate-top">
                                    <h3>{certificate.title}</h3>

                                    {certificate.featured && (
                                        <span className="home-certificate-featured">
                                            ★ Featured
                                        </span>
                                    )}
                                </div>

                                {certificate.issuer && (
                                    <p className="home-certificate-issuer">
                                        <span>Issued by:</span>{" "}
                                        {certificate.issuer}
                                    </p>
                                )}

                                {certificate.issueDate && (
                                    <p className="home-certificate-date">
                                        <span>📅</span>{" "}
                                        {certificate.issueDate}
                                    </p>
                                )}

                                {certificate.credentialId && (
                                    <p className="home-certificate-id">
                                        <span>Credential ID:</span>{" "}
                                        {certificate.credentialId}
                                    </p>
                                )}

                                {certificate.description && (
                                    <p className="home-certificate-description">
                                        {certificate.description}
                                    </p>
                                )}

                                {/* Online Credential Verification */}
                                {certificate.credentialUrl && (
                                    <a
                                        href={certificate.credentialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="home-certificate-link"
                                    >
                                        Verify Credential <span>↗</span>
                                    </a>
                                )}

                                {/* Uploaded Certificate PDF */}
                                {certificatePdfUrl && (
                                    <div className="home-certificate-pdf-actions">
                                        <a
                                            href={certificatePdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="home-certificate-pdf-view"
                                        >
                                            📄 View PDF
                                        </a>

                                        <a
                                            href={certificatePdfUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="home-certificate-pdf-download"
                                        >
                                            ⬇ Download PDF
                                        </a>
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    </section>
)}




{/* ================= SERVICES SECTION ================= */}



<section id="services" className="home-section services-section">

    <div className="services-container">



        {/* Section Heading */}

        <div className="services-heading">

            <span className="services-eyebrow">

                WHAT I DO

            </span>



            <h2>

                Services <span>I Offer</span>

            </h2>



            <p>

                Building modern applications with clean code,

                thoughtful design, and reliable technology.

            </p>

        </div>



        {/* Services Cards */}

        <div className="services-grid">



            {/* Java Development */}

            <article className="service-card">

                <div className="service-icon">☕</div>



                <span className="service-number">01</span>



                <h3>Java Development</h3>



                <p>

                    Developing reliable applications using Java,

                    object-oriented programming, collections,

                    and clean coding practices.

                </p>



                <div className="service-tags">

                    <span>Core Java</span>

                    <span>OOP</span>

                </div>



                <div className="service-card-footer">

                    <span>Backend Development</span>

                    <span className="service-arrow">↗</span>

                </div>

            </article>



            {/* Spring Boot */}

            <article className="service-card">

                <div className="service-icon">⚙</div>



                <span className="service-number">02</span>



                <h3>Spring Boot Backend</h3>



                <p>

                    Building backend applications, REST APIs,

                    authentication flows, and business logic

                    for web-based systems.

                </p>



                <div className="service-tags">

                    <span>Spring Boot</span>

                    <span>REST API</span>

                </div>



                <div className="service-card-footer">

                    <span>API Development</span>

                    <span className="service-arrow">↗</span>

                </div>

            </article>



            {/* Frontend Development: HTML, CSS, React */}

            <article className="service-card">

                <div className="service-icon">⚛</div>



                <span className="service-number">03</span>



                <h3>Frontend Development</h3>



                <p>

                    Creating responsive and user-friendly interfaces

                    with reusable components and modern web

                    development technologies.

                </p>



                <div className="service-tags">

                    <span>React</span>

                    <span>CSS</span>

                </div>



                <div className="service-card-footer">

                    <span>UI Development</span>

                    <span className="service-arrow">↗</span>

                </div>

            </article>



            {/* Database Development */}

            <article className="service-card">

                <div className="service-icon">▤</div>



                <span className="service-number">04</span>



                <h3>Database Development</h3>



                <p>

                    Designing database structures, integrating

                    applications with databases, and implementing

                    reliable CRUD operations.

                </p>



                <div className="service-tags">

                    <span>PostgreSQL</span>

                    <span>SQL</span>

                </div>



                <div className="service-card-footer">

                    <span>Data Management</span>

                    <span className="service-arrow">↗</span>

                </div>

            </article>



        </div>



        {/* Bottom Call to Action */}

        <div className="services-cta">

            <div>

                <span className="services-cta-label">

                    HAVE A PROJECT IN MIND?

                </span>



                <h3>Let's build something meaningful.</h3>



                <p>

                    Have an idea or an opportunity? I'd love to hear

                    about it.

                </p>

            </div>



            <a

                href="mailto:danishkureshi478@gmail.com"

                className="services-cta-button"

            >

                Get In Touch <span>↗</span>

            </a>

        </div>



    </div>

</section>



{/* ================= END SERVICES SECTION ================= */}



{/* Contact Form - Connected to Spring Boot API */}



<form

    className="contact-form"

    onSubmit={async (event) => {

        event.preventDefault();



        const form = event.currentTarget;

        const formData = new FormData(form);



        const contactData = {

            name: String(formData.get("name") || "").trim(),

            email: String(formData.get("email") || "").trim(),

            subject: String(formData.get("subject") || "").trim(),

            message: String(formData.get("message") || "").trim()

        };



        if (

            !contactData.name ||

            !contactData.email ||

            !contactData.subject ||

            !contactData.message

        ) {

            alert("Please fill in all fields.");

            return;

        }



        if (

            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)

        ) {

            alert("Please enter a valid email address.");

            return;

        }



        const submitButton = form.querySelector(

            'button[type="submit"]'

        );



        const originalButtonText = submitButton.textContent;



        try {

            submitButton.disabled = true;

            submitButton.textContent = "Sending Message...";



            const response = await fetch(

                "http://localhost:6060/api/contact",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(contactData)

                }

            );



            if (!response.ok) {

                const errorText = await response.text();



                throw new Error(

                    errorText || `Request failed (${response.status})`

                );

            }



            form.reset();



            alert(

                "Thank you! Your message has been sent successfully."

            );



        } catch (error) {

            console.error("Contact form error:", error);



            alert(

                "Unable to send your message. Please check your connection and try again."

            );



        } finally {

            submitButton.disabled = false;

            submitButton.textContent = originalButtonText;

        }

    }}

>

    <div className="contact-form-heading">

        <h3>Send Me a Message</h3>

        <p>

            Fill out the details below to get in touch.

        </p>

    </div>



    <div className="contact-form-row">

        <div className="contact-field">

            <label htmlFor="contact-name">Your Name</label>

            <input

                id="contact-name"

                name="name"

                type="text"

                placeholder="Enter your name"

                autoComplete="name"

                maxLength={100}

                required

            />

        </div>



        <div className="contact-field">

            <label htmlFor="contact-email">Email Address</label>

            <input

                id="contact-email"

                name="email"

                type="email"

                placeholder="you@example.com"

                autoComplete="email"

                maxLength={254}

                required

            />

        </div>

    </div>



    <div className="contact-field">

        <label htmlFor="contact-subject">Subject</label>

        <input

            id="contact-subject"

            name="subject"

            type="text"

            placeholder="What would you like to discuss?"

            maxLength={150}

            required

        />

    </div>



    <div className="contact-field">

        <label htmlFor="contact-message">Your Message</label>

        <textarea

            id="contact-message"

            name="message"

            rows={5}

            placeholder="Write your message here..."

            maxLength={5000}

            required

        />

    </div>



    <button

        type="submit"

        className="contact-submit-button"

    >

        Send Message <span>↗</span>

    </button>



    <p className="contact-form-note">

        Your message will be submitted securely to the portfolio

        backend for processing.

    </p>

</form>





        </main>

    );

}



export default Home;
