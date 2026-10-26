package com.portfolio.backend.service;

import com.portfolio.backend.entity.Education;
import com.portfolio.backend.repository.EducationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EducationService {

    private final EducationRepository educationRepository;

    public EducationService(EducationRepository educationRepository) {
        this.educationRepository = educationRepository;
    }

    // =========================================================
    // GET ALL EDUCATION
    // =========================================================

    public List<Education> getAllEducation() {
        return educationRepository.findAll();
    }

    // =========================================================
    // GET EDUCATION ORDERED
    // =========================================================

    public List<Education> getAllEducationOrdered() {
        return educationRepository.findAllByOrderByDisplayOrderAsc();
    }

    // =========================================================
    // GET EDUCATION BY ID
    // =========================================================

    public Optional<Education> getEducationById(Long id) {
        return educationRepository.findById(id);
    }

    // =========================================================
    // CREATE EDUCATION
    // =========================================================

    public Education createEducation(Education education) {
        return educationRepository.save(education);
    }

    // =========================================================
    // UPDATE EDUCATION
    // =========================================================

    public Optional<Education> updateEducation(
            Long id,
            Education updatedEducation
    ) {

        return educationRepository.findById(id)
                .map(existingEducation -> {

                    existingEducation.setDegree(
                            updatedEducation.getDegree()
                    );

                    existingEducation.setInstitution(
                            updatedEducation.getInstitution()
                    );

                    existingEducation.setField(
                            updatedEducation.getField()
                    );

                    existingEducation.setStartYear(
                            updatedEducation.getStartYear()
                    );

                    existingEducation.setEndYear(
                            updatedEducation.getEndYear()
                    );

                    existingEducation.setGrade(
                            updatedEducation.getGrade()
                    );

                    existingEducation.setDescription(
                            updatedEducation.getDescription()
                    );

                    existingEducation.setLocation(
                            updatedEducation.getLocation()
                    );

                    existingEducation.setDisplayOrder(
                            updatedEducation.getDisplayOrder()
                    );

                    existingEducation.setFeatured(
                            updatedEducation.isFeatured()
                    );

                    return educationRepository.save(
                            existingEducation
                    );
                });
    }

    // =========================================================
    // DELETE EDUCATION
    // =========================================================

    public boolean deleteEducation(Long id) {

        if (!educationRepository.existsById(id)) {
            return false;
        }

        educationRepository.deleteById(id);

        return true;
    }

    // =========================================================
    // GET FEATURED EDUCATION
    // =========================================================

    public List<Education> getFeaturedEducation() {
        return educationRepository.findByFeaturedTrue();
    }
}