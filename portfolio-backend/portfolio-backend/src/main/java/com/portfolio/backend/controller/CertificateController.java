
package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Certificate;
import com.portfolio.backend.service.CertificateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(
            CertificateService certificateService
    ) {
        this.certificateService = certificateService;
    }

    // =========================================================
    // GET ALL CERTIFICATES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        return ResponseEntity.ok(
                certificateService.getAllCertificates()
        );
    }

    // =========================================================
    // GET CERTIFICATES ORDERED
    // =========================================================

    @GetMapping("/ordered")
    public ResponseEntity<List<Certificate>> getAllCertificatesOrdered() {
        return ResponseEntity.ok(
                certificateService.getAllCertificatesOrdered()
        );
    }

    // =========================================================
    // GET FEATURED CERTIFICATES
    // =========================================================

    @GetMapping("/featured")
    public ResponseEntity<List<Certificate>> getFeaturedCertificates() {
        return ResponseEntity.ok(
                certificateService.getFeaturedCertificates()
        );
    }

    // =========================================================
    // GET CERTIFICATE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Certificate> getCertificateById(
            @PathVariable Long id
    ) {
        return certificateService
                .getCertificateById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // =========================================================
    // GET CERTIFICATE PDF PATH
    // =========================================================

    @GetMapping("/{id}/pdf")
    public ResponseEntity<String> getCertificatePdf(
            @PathVariable Long id
    ) {
        return certificateService.getCertificateById(id)
                .filter(certificate ->
                        certificate.getCertificatePdf() != null
                                && !certificate.getCertificatePdf().isBlank()
                )
                .map(certificate ->
                        ResponseEntity.ok(certificate.getCertificatePdf())
                )
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // =========================================================
    // CREATE CERTIFICATE
    // =========================================================

    @PostMapping
    public ResponseEntity<Certificate> createCertificate(
            @RequestBody Certificate certificate
    ) {
        Certificate savedCertificate =
                certificateService.createCertificate(certificate);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedCertificate);
    }

    // =========================================================
    // UPDATE CERTIFICATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Certificate> updateCertificate(
            @PathVariable Long id,
            @RequestBody Certificate certificate
    ) {
        return certificateService
                .updateCertificate(id, certificate)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // =========================================================
    // DELETE CERTIFICATE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertificate(
            @PathVariable Long id
    ) {
        boolean deleted = certificateService.deleteCertificate(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
