package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Project;
import com.portfolio.backend.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // =========================================================
    // GET ALL PROJECTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {

        return ResponseEntity.ok(
                projectService.getAllProjects()
        );
    }

    // =========================================================
    // GET PROJECT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(
            @PathVariable Long id
    ) {

        return projectService
                .getProjectById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // CREATE PROJECT
    // =========================================================

    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestBody Project project
    ) {

        Project savedProject =
                projectService.createProject(project);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedProject);
    }

    // =========================================================
    // UPDATE PROJECT
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Long id,
            @RequestBody Project project
    ) {

        return projectService
                .updateProject(id, project)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // DELETE PROJECT
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id
    ) {

        boolean deleted =
                projectService.deleteProject(id);

        if (!deleted) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================================================
    // GET FEATURED PROJECTS
    // =========================================================

    @GetMapping("/featured")
    public ResponseEntity<List<Project>> getFeaturedProjects() {

        return ResponseEntity.ok(
                projectService.getFeaturedProjects()
        );
    }

    // =========================================================
    // GET PROJECTS BY TYPE
    // =========================================================

    @GetMapping("/type/{projectType}")
    public ResponseEntity<List<Project>> getProjectsByType(
            @PathVariable String projectType
    ) {

        return ResponseEntity.ok(
                projectService.getProjectsByType(projectType)
        );
    }
}