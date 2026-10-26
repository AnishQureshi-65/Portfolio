package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Education;
import com.portfolio.backend.service.EducationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education")
public class EducationController {

    private final EducationService educationService;

    public EducationController(
            EducationService educationService
    ) {
        this.educationService = educationService;
    }

    // =========================================================
    // GET ALL EDUCATION
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Education>> getAllEducation() {

        return ResponseEntity.ok(
                educationService.getAllEducation()
        );
    }

    // =========================================================
    // GET EDUCATION ORDERED
    // =========================================================

    @GetMapping("/ordered")
    public ResponseEntity<List<Education>> getAllEducationOrdered() {

        return ResponseEntity.ok(
                educationService.getAllEducationOrdered()
        );
    }

    // =========================================================
    // GET FEATURED EDUCATION
    // =========================================================

    @GetMapping("/featured")
    public ResponseEntity<List<Education>> getFeaturedEducation() {

        return ResponseEntity.ok(
                educationService.getFeaturedEducation()
        );
    }

    // =========================================================
    // GET EDUCATION BY ID
    // =========================================================

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Education> getEducationById(
            @PathVariable Long id
    ) {

        return educationService
                .getEducationById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // CREATE EDUCATION
    // =========================================================

    @PostMapping
    public ResponseEntity<Education> createEducation(
            @RequestBody Education education
    ) {

        Education savedEducation =
                educationService.createEducation(education);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedEducation);
    }

    // =========================================================
    // UPDATE EDUCATION
    // =========================================================

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Education> updateEducation(
            @PathVariable Long id,
            @RequestBody Education education
    ) {

        return educationService
                .updateEducation(id, education)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // DELETE EDUCATION
    // =========================================================

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deleteEducation(
            @PathVariable Long id
    ) {

        boolean deleted =
                educationService.deleteEducation(id);

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