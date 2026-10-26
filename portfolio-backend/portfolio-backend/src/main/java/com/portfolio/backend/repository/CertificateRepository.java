
package com.portfolio.backend.repository;

import com.portfolio.backend.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    // Get all featured certificates
    List<Certificate> findByFeaturedTrue();

    // Get all certificates sorted by display order and ID
    List<Certificate> findAllByOrderByDisplayOrderAscIdAsc();
}
