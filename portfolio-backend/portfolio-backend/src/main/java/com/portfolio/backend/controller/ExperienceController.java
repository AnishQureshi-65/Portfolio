package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Experience;
import com.portfolio.backend.service.ExperienceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiences")
public class ExperienceController {

    private final ExperienceService experienceService;

    public ExperienceController(
            ExperienceService experienceService
    ) {
        this.experienceService = experienceService;
    }

    // =========================================================
    // GET ALL EXPERIENCES - PUBLIC
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Experience>> getAllExperiences() {

        return ResponseEntity.ok(
                experienceService.getAllExperiences()
        );
    }

    // =========================================================
    // GET ORDERED EXPERIENCES - PUBLIC
    // =========================================================

    @GetMapping("/ordered")
    public ResponseEntity<List<Experience>> getAllExperiencesOrdered() {

        return ResponseEntity.ok(
                experienceService.getAllExperiencesOrdered()
        );
    }

    // =========================================================
    // GET FEATURED EXPERIENCES - PUBLIC
    // =========================================================

    @GetMapping("/featured")
    public ResponseEntity<List<Experience>> getFeaturedExperiences() {

        return ResponseEntity.ok(
                experienceService.getFeaturedExperiences()
        );
    }

    // =========================================================
    // GET CURRENT EXPERIENCES - PUBLIC
    // =========================================================

    @GetMapping("/current")
    public ResponseEntity<List<Experience>> getCurrentExperiences() {

        return ResponseEntity.ok(
                experienceService.getCurrentExperiences()
        );
    }

    // =========================================================
    // GET EXPERIENCE BY ID - PUBLIC
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Experience> getExperienceById(
            @PathVariable Long id
    ) {

        return experienceService
                .getExperienceById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // CREATE EXPERIENCE - ADMIN ONLY
    // =========================================================

    @PostMapping
    public ResponseEntity<Experience> createExperience(
            @RequestBody Experience experience
    ) {

        Experience savedExperience =
                experienceService.createExperience(experience);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedExperience);
    }

    // =========================================================
    // UPDATE EXPERIENCE - ADMIN ONLY
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Experience> updateExperience(
            @PathVariable Long id,
            @RequestBody Experience experience
    ) {

        return experienceService
                .updateExperience(id, experience)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // DELETE EXPERIENCE - ADMIN ONLY
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExperience(
            @PathVariable Long id
    ) {

        boolean deleted =
                experienceService.deleteExperience(id);

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