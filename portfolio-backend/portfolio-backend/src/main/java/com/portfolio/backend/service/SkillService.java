package com.portfolio.backend.service;

import com.portfolio.backend.entity.Skill;
import com.portfolio.backend.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    // =========================================================
    // GET ALL SKILLS
    // =========================================================

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    // =========================================================
    // GET SKILLS ORDERED BY DISPLAY ORDER
    // =========================================================

    public List<Skill> getAllSkillsOrdered() {
        return skillRepository.findAllByOrderByDisplayOrderAsc();
    }

    // =========================================================
    // GET SKILL BY ID
    // =========================================================

    public Optional<Skill> getSkillById(Long id) {
        return skillRepository.findById(id);
    }

    // =========================================================
    // CREATE SKILL
    // =========================================================

    public Skill createSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    // =========================================================
    // UPDATE SKILL
    // =========================================================

    public Optional<Skill> updateSkill(
            Long id,
            Skill updatedSkill
    ) {

        return skillRepository.findById(id)
                .map(existingSkill -> {

                    existingSkill.setName(
                            updatedSkill.getName()
                    );

                    existingSkill.setCategory(
                            updatedSkill.getCategory()
                    );

                    existingSkill.setProficiency(
                            updatedSkill.getProficiency()
                    );

                    existingSkill.setIconUrl(
                            updatedSkill.getIconUrl()
                    );

                    existingSkill.setDescription(
                            updatedSkill.getDescription()
                    );

                    existingSkill.setDisplayOrder(
                            updatedSkill.getDisplayOrder()
                    );

                    existingSkill.setFeatured(
                            updatedSkill.isFeatured()
                    );

                    return skillRepository.save(existingSkill);
                });
    }

    // =========================================================
    // DELETE SKILL
    // =========================================================

    public boolean deleteSkill(Long id) {

        if (!skillRepository.existsById(id)) {
            return false;
        }

        skillRepository.deleteById(id);

        return true;
    }

    // =========================================================
    // GET FEATURED SKILLS
    // =========================================================

    public List<Skill> getFeaturedSkills() {
        return skillRepository.findByFeaturedTrue();
    }

    // =========================================================
    // GET SKILLS BY CATEGORY
    // =========================================================

    public List<Skill> getSkillsByCategory(String category) {
        return skillRepository.findByCategory(category);
    }
}