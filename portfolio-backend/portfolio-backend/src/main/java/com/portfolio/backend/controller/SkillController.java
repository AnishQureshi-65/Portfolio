package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Skill;
import com.portfolio.backend.service.SkillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    // =========================================================
    // GET ALL SKILLS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Skill>> getAllSkills() {

        return ResponseEntity.ok(
                skillService.getAllSkills()
        );
    }

    // =========================================================
    // GET SKILLS ORDERED BY DISPLAY ORDER
    // =========================================================

    @GetMapping("/ordered")
    public ResponseEntity<List<Skill>> getAllSkillsOrdered() {

        return ResponseEntity.ok(
                skillService.getAllSkillsOrdered()
        );
    }

    // =========================================================
    // GET FEATURED SKILLS
    // =========================================================

    @GetMapping("/featured")
    public ResponseEntity<List<Skill>> getFeaturedSkills() {

        return ResponseEntity.ok(
                skillService.getFeaturedSkills()
        );
    }

    // =========================================================
    // GET SKILLS BY CATEGORY
    // =========================================================

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Skill>> getSkillsByCategory(
            @PathVariable String category
    ) {

        return ResponseEntity.ok(
                skillService.getSkillsByCategory(category)
        );
    }

    // =========================================================
    // GET SKILL BY ID
    // =========================================================
    // \d+ means ID must contain only numbers.
    // This prevents "featured", "ordered", etc.
    // from being treated as an ID.

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Skill> getSkillById(
            @PathVariable Long id
    ) {

        return skillService
                .getSkillById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // CREATE SKILL
    // =========================================================

    @PostMapping
    public ResponseEntity<Skill> createSkill(
            @RequestBody Skill skill
    ) {

        Skill savedSkill =
                skillService.createSkill(skill);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedSkill);
    }

    // =========================================================
    // UPDATE SKILL
    // =========================================================

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Skill> updateSkill(
            @PathVariable Long id,
            @RequestBody Skill skill
    ) {

        return skillService
                .updateSkill(id, skill)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // DELETE SKILL
    // =========================================================

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable Long id
    ) {

        boolean deleted =
                skillService.deleteSkill(id);

        if (!deleted) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity
                .noContent()
                .build();
    }
}