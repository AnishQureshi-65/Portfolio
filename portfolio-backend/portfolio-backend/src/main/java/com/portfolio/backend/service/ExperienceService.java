package com.portfolio.backend.service;

import com.portfolio.backend.entity.Experience;
import com.portfolio.backend.repository.ExperienceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;

    public ExperienceService(
            ExperienceRepository experienceRepository
    ) {
        this.experienceRepository = experienceRepository;
    }

    // =========================================================
    // GET ALL EXPERIENCES
    // =========================================================

    public List<Experience> getAllExperiences() {

        return experienceRepository.findAll();
    }

    // =========================================================
    // GET ORDERED EXPERIENCES
    // =========================================================

    public List<Experience> getAllExperiencesOrdered() {

        return experienceRepository
                .findAllByOrderByDisplayOrderAsc();
    }

    // =========================================================
    // GET EXPERIENCE BY ID
    // =========================================================

    public Optional<Experience> getExperienceById(Long id) {

        return experienceRepository.findById(id);
    }

    // =========================================================
    // CREATE EXPERIENCE
    // =========================================================

    public Experience createExperience(
            Experience experience
    ) {

        // ID database khud generate karega
        experience.setId(null);

        return experienceRepository.save(experience);
    }

    // =========================================================
    // UPDATE EXPERIENCE
    // =========================================================

    public Optional<Experience> updateExperience(
            Long id,
            Experience updatedExperience
    ) {

        return experienceRepository
                .findById(id)
                .map(existingExperience -> {

                    existingExperience.setPosition(
                            updatedExperience.getPosition()
                    );

                    existingExperience.setCompany(
                            updatedExperience.getCompany()
                    );

                    existingExperience.setEmploymentType(
                            updatedExperience.getEmploymentType()
                    );

                    existingExperience.setStartDate(
                            updatedExperience.getStartDate()
                    );

                    existingExperience.setEndDate(
                            updatedExperience.getEndDate()
                    );

                    existingExperience.setCurrentlyWorking(
                            updatedExperience.isCurrentlyWorking()
                    );

                    existingExperience.setLocation(
                            updatedExperience.getLocation()
                    );

                    existingExperience.setDescription(
                            updatedExperience.getDescription()
                    );

                    existingExperience.setTechnologies(
                            updatedExperience.getTechnologies()
                    );

                    existingExperience.setCompanyUrl(
                            updatedExperience.getCompanyUrl()
                    );

                    existingExperience.setDisplayOrder(
                            updatedExperience.getDisplayOrder()
                    );

                    existingExperience.setFeatured(
                            updatedExperience.isFeatured()
                    );

                    return experienceRepository.save(
                            existingExperience
                    );
                });
    }

    // =========================================================
    // DELETE EXPERIENCE
    // =========================================================

    public boolean deleteExperience(Long id) {

        if (!experienceRepository.existsById(id)) {
            return false;
        }

        experienceRepository.deleteById(id);

        return true;
    }

    // =========================================================
    // GET FEATURED EXPERIENCES
    // =========================================================

    public List<Experience> getFeaturedExperiences() {

        return experienceRepository
                .findByFeaturedTrue();
    }

    // =========================================================
    // GET CURRENT EXPERIENCES
    // =========================================================

    public List<Experience> getCurrentExperiences() {

        return experienceRepository
                .findByCurrentlyWorkingTrue();
    }
}