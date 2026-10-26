
package com.portfolio.backend.controller;

import com.portfolio.backend.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    /*
     * ============================================================
     * CONSTRUCTOR
     * ============================================================
     */
    public FileUploadController(
            FileStorageService fileStorageService
    ) {
        this.fileStorageService = fileStorageService;
    }

    /*
     * ============================================================
     * PROFILE IMAGE UPLOAD
     * ============================================================
     *
     * POST: /api/upload/profile-image
     * Form field: file
     */
    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            String fileUrl =
                    fileStorageService.saveProfileImage(file);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Profile image uploaded successfully.",
                            "fileUrl",
                            fileUrl
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to upload profile image."
                            )
                    );
        }
    }

    /*
     * ============================================================
     * RESUME PDF UPLOAD
     * ============================================================
     *
     * POST: /api/upload/resume
     * Form field: file
     */
    @PostMapping("/resume")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            String fileUrl =
                    fileStorageService.saveResume(file);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Resume uploaded successfully.",
                            "fileUrl",
                            fileUrl
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to upload resume."
                            )
                    );
        }
    }

    /*
     * ============================================================
     * CERTIFICATE PDF UPLOAD
     * ============================================================
     *
     * POST: /api/upload/certificate
     * Form field: file
     */
    @PostMapping("/certificate")
    public ResponseEntity<?> uploadCertificate(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            String fileUrl =
                    fileStorageService.saveCertificatePdf(file);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            Map.of(
                                    "message",
                                    "Certificate PDF uploaded successfully.",
                                    "fileUrl",
                                    fileUrl
                            )
                    );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to upload certificate PDF."
                            )
                    );
        }
    }
}
