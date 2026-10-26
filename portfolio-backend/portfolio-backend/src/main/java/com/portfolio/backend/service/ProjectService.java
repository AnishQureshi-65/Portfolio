package com.portfolio.backend.service;

import com.portfolio.backend.entity.Project;
import com.portfolio.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Get project by ID
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    // Create project
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    // Update project
    public Optional<Project> updateProject(
            Long id,
            Project updatedProject
    ) {

        return projectRepository.findById(id)
                .map(existingProject -> {

                    existingProject.setTitle(
                            updatedProject.getTitle()
                    );

                    existingProject.setDescription(
                            updatedProject.getDescription()
                    );

                    existingProject.setTechnologies(
                            updatedProject.getTechnologies()
                    );

                    existingProject.setGithubUrl(
                            updatedProject.getGithubUrl()
                    );

                    existingProject.setLiveUrl(
                            updatedProject.getLiveUrl()
                    );

                    existingProject.setImageUrl(
                            updatedProject.getImageUrl()
                    );

                    existingProject.setProjectType(
                            updatedProject.getProjectType()
                    );

                    existingProject.setFeatured(
                            updatedProject.isFeatured()
                    );

                    return projectRepository.save(existingProject);
                });
    }

    // Delete project
    public boolean deleteProject(Long id) {

        if (!projectRepository.existsById(id)) {
            return false;
        }

        projectRepository.deleteById(id);

        return true;
    }

    // Get featured projects
    public List<Project> getFeaturedProjects() {
        return projectRepository.findByFeaturedTrue();
    }

    // Get projects by type
    public List<Project> getProjectsByType(String projectType) {
        return projectRepository.findByProjectType(projectType);
    }
}