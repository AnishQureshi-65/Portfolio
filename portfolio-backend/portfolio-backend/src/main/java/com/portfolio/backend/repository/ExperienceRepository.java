package com.portfolio.backend.repository;

import com.portfolio.backend.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceRepository
        extends JpaRepository<Experience, Long> {

    // Get featured experiences
    List<Experience> findByFeaturedTrue();

    // Get currently working experiences
    List<Experience> findByCurrentlyWorkingTrue();

    // Get experiences ordered by display order
    List<Experience> findAllByOrderByDisplayOrderAsc();
}