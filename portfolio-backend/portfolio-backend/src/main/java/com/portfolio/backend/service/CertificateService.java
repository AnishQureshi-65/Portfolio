
package com.portfolio.backend.service;

import com.portfolio.backend.entity.Certificate;
import com.portfolio.backend.repository.CertificateRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;

    public CertificateService(
            CertificateRepository certificateRepository
    ) {
        this.certificateRepository = certificateRepository;
    }

    // =========================================================
    // GET ALL CERTIFICATES
    // =========================================================

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    // =========================================================
    // GET CERTIFICATES ORDERED BY DISPLAY ORDER AND ID
    // =========================================================

    public List<Certificate> getAllCertificatesOrdered() {
        return certificateRepository
                .findAllByOrderByDisplayOrderAscIdAsc();
    }

    // =========================================================
    // GET CERTIFICATE BY ID
    // =========================================================

    public Optional<Certificate> getCertificateById(Long id) {
        return certificateRepository.findById(id);
    }

    // =========================================================
    // CREATE CERTIFICATE
    // =========================================================

    public Certificate createCertificate(Certificate certificate) {
        return certificateRepository.save(certificate);
    }

    // =========================================================
    // UPDATE CERTIFICATE
    // =========================================================

    public Optional<Certificate> updateCertificate(
            Long id,
            Certificate updatedCertificate
    ) {

        return certificateRepository.findById(id)
                .map(existingCertificate -> {

                    existingCertificate.setTitle(
                            updatedCertificate.getTitle()
                    );

                    existingCertificate.setIssuer(
                            updatedCertificate.getIssuer()
                    );

                    existingCertificate.setIssueDate(
                            updatedCertificate.getIssueDate()
                    );

                    existingCertificate.setCredentialId(
                            updatedCertificate.getCredentialId()
                    );

                    existingCertificate.setCredentialUrl(
                            updatedCertificate.getCredentialUrl()
                    );

                    existingCertificate.setCertificateImage(
                            updatedCertificate.getCertificateImage()
                    );

                    // Update PDF only when a new path is provided.
                    // Otherwise, preserve the existing PDF path.
                    if (updatedCertificate.getCertificatePdf() != null
                            && !updatedCertificate.getCertificatePdf()
                            .isBlank()) {

                        existingCertificate.setCertificatePdf(
                                updatedCertificate.getCertificatePdf()
                        );
                    }

                    existingCertificate.setDescription(
                            updatedCertificate.getDescription()
                    );

                    existingCertificate.setDisplayOrder(
                            updatedCertificate.getDisplayOrder()
                    );

                    existingCertificate.setFeatured(
                            updatedCertificate.isFeatured()
                    );

                    return certificateRepository.save(
                            existingCertificate
                    );
                });
    }

    // =========================================================
    // DELETE CERTIFICATE
    // =========================================================

    public boolean deleteCertificate(Long id) {

        if (!certificateRepository.existsById(id)) {
            return false;
        }

        certificateRepository.deleteById(id);

        return true;
    }

    // =========================================================
    // GET FEATURED CERTIFICATES
    // =========================================================

    public List<Certificate> getFeaturedCertificates() {
        return certificateRepository.findByFeaturedTrue();
    }
}
