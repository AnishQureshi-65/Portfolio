package com.portfolio.backend.controller;

import com.portfolio.backend.repository.AdminRepository;
import com.portfolio.backend.repository.CertificateRepository;
import com.portfolio.backend.repository.ContactMessageRepository;
import com.portfolio.backend.repository.EducationRepository;
import com.portfolio.backend.repository.ExperienceRepository;
import com.portfolio.backend.repository.ProfileRepository;
import com.portfolio.backend.repository.ProjectRepository;
import com.portfolio.backend.repository.SkillRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminRepository adminRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final EducationRepository educationRepository;
    private final CertificateRepository certificateRepository;
    private final ExperienceRepository experienceRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final ProfileRepository profileRepository;

    public AdminDashboardController(
            AdminRepository adminRepository,
            ProjectRepository projectRepository,
            SkillRepository skillRepository,
            EducationRepository educationRepository,
            CertificateRepository certificateRepository,
            ExperienceRepository experienceRepository,
            ContactMessageRepository contactMessageRepository,
            ProfileRepository profileRepository
    ) {
        this.adminRepository = adminRepository;
        this.projectRepository = projectRepository;
        this.skillRepository = skillRepository;
        this.educationRepository = educationRepository;
        this.certificateRepository = certificateRepository;
        this.experienceRepository = experienceRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.profileRepository = profileRepository;
    }

    // =========================================================
    // ADMIN DASHBOARD STATISTICS
    // =========================================================

    /**
     * Get complete Admin Dashboard statistics.
     *
     * GET /api/admin/dashboard
     *
     * Requires:
     * Authorization: Bearer JWT_TOKEN
     */
    @GetMapping
    public ResponseEntity<?> getDashboardStats() {

        // =====================================================
        // ADMIN STATISTICS
        // =====================================================

        long totalAdmins =
                adminRepository.count();

        long activeAdmins =
                adminRepository.findAll()
                        .stream()
                        .filter(admin -> admin.isActive())
                        .count();

        long inactiveAdmins =
                totalAdmins - activeAdmins;


        // =====================================================
        // PROJECT STATISTICS
        // =====================================================

        long totalProjects =
                projectRepository.count();

        long featuredProjects =
                projectRepository.findByFeaturedTrue()
                        .size();


        // =====================================================
        // SKILL STATISTICS
        // =====================================================

        long totalSkills =
                skillRepository.count();

        long featuredSkills =
                skillRepository.findByFeaturedTrue()
                        .size();


        // =====================================================
        // EDUCATION STATISTICS
        // =====================================================

        long totalEducation =
                educationRepository.count();

        long featuredEducation =
                educationRepository.findByFeaturedTrue()
                        .size();


        // =====================================================
        // CERTIFICATE STATISTICS
        // =====================================================

        long totalCertificates =
                certificateRepository.count();

        long featuredCertificates =
                certificateRepository.findByFeaturedTrue()
                        .size();


        // =====================================================
        // EXPERIENCE STATISTICS
        // =====================================================

        long totalExperiences =
                experienceRepository.count();

        long currentExperiences =
                experienceRepository.findByCurrentlyWorkingTrue()
                        .size();

        long featuredExperiences =
                experienceRepository.findByFeaturedTrue()
                        .size();


        // =====================================================
        // CONTACT MESSAGE STATISTICS
        // =====================================================

        long totalMessages =
                contactMessageRepository.count();

        long unreadMessages =
                contactMessageRepository
                        .findByReadFalseOrderByIdDesc()
                        .size();

        long readMessages =
                totalMessages - unreadMessages;


        // =====================================================
        // PROFILE STATISTICS
        // =====================================================

        long totalProfiles =
                profileRepository.count();


        // =====================================================
        // RESPONSE
        // =====================================================

        Map<String, Object> dashboard =
                Map.of(

                        // Admins
                        "admins", Map.of(
                                "total", totalAdmins,
                                "active", activeAdmins,
                                "inactive", inactiveAdmins
                        ),

                        // Projects
                        "projects", Map.of(
                                "total", totalProjects,
                                "featured", featuredProjects
                        ),

                        // Skills
                        "skills", Map.of(
                                "total", totalSkills,
                                "featured", featuredSkills
                        ),

                        // Education
                        "education", Map.of(
                                "total", totalEducation,
                                "featured", featuredEducation
                        ),

                        // Certificates
                        "certificates", Map.of(
                                "total", totalCertificates,
                                "featured", featuredCertificates
                        ),

                        // Experiences
                        "experiences", Map.of(
                                "total", totalExperiences,
                                "current", currentExperiences,
                                "featured", featuredExperiences
                        ),

                        // Contact Messages
                        "messages", Map.of(
                                "total", totalMessages,
                                "read", readMessages,
                                "unread", unreadMessages
                        ),

                        // Profile
                        "profile", Map.of(
                                "total", totalProfiles
                        )
                );

        return ResponseEntity.ok(dashboard);
    }
}