
package com.portfolio.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    // PROFILE IMAGE
    public String saveProfileImage(MultipartFile file)
            throws IOException {

        validateFile(file);

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Image size must not exceed 10 MB."
            );
        }

        // Validate actual image content, not just Content-Type.
        BufferedImage image;
        try (InputStream input = file.getInputStream()) {
            image = ImageIO.read(input);
        }

        if (image == null) {
            throw new IllegalArgumentException(
                    "Please upload a valid image file."
            );
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename()
        ).toLowerCase(Locale.ROOT);

        String extension;
        if (originalName.endsWith(".jpg")
                || originalName.endsWith(".jpeg")) {
            extension = ".jpg";
        } else if (originalName.endsWith(".png")) {
            extension = ".png";
        } else if (originalName.endsWith(".gif")) {
            extension = ".gif";
        } else {
            throw new IllegalArgumentException(
                    "Only JPG, JPEG, PNG and GIF images are allowed."
            );
        }

        return saveFile(file, "profile", extension);
    }

    // RESUME PDF
    public String saveResume(MultipartFile file)
            throws IOException {

        validatePdf(file, "resume");
        return saveFile(file, "resume", ".pdf");
    }

    // CERTIFICATE PDF
    public String saveCertificatePdf(MultipartFile file)
            throws IOException {

        validatePdf(file, "certificate");
        return saveFile(file, "certificates", ".pdf");
    }

    // PDF VALIDATION
    private void validatePdf(
            MultipartFile file,
            String fileType
    ) throws IOException {

        validateFile(file);

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "PDF file size must not exceed 10 MB."
            );
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename()
        ).toLowerCase(Locale.ROOT);

        if (!originalName.endsWith(".pdf")) {
            throw new IllegalArgumentException(
                    "Only PDF files are allowed for " + fileType + "."
            );
        }

        byte[] signature = new byte[5];

        try (InputStream input = file.getInputStream()) {
            if (input.read(signature) != 5
                    || signature[0] != '%'
                    || signature[1] != 'P'
                    || signature[2] != 'D'
                    || signature[3] != 'F'
                    || signature[4] != '-') {

                throw new IllegalArgumentException(
                        "The selected file is not a valid PDF."
                );
            }
        }
    }

    // COMMON FILE SAVE METHOD
    private String saveFile(
            MultipartFile file,
            String folder,
            String extension
    ) throws IOException {

        Path uploadRoot = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Path directory = uploadRoot.resolve(folder).normalize();

        if (!directory.startsWith(uploadRoot)) {
            throw new IOException("Invalid upload directory.");
        }

        Files.createDirectories(directory);

        String newFilename = folder + "-"
                + UUID.randomUUID()
                + extension;

        Path target = directory.resolve(newFilename).normalize();

        if (!target.startsWith(directory)) {
            throw new IOException("Invalid file path.");
        }

        // No overwrite: UUID filenames should be unique.
        try (InputStream input = file.getInputStream()) {
            Files.copy(input, target);
        }

        return "/uploads/" + folder + "/" + newFilename;
    }

    // DELETE FILE
    public void deleteFile(String fileUrl) {

        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        // Only accept paths belonging to this service's upload URL format.
        if (!fileUrl.startsWith("/uploads/")) {
            return;
        }

        String relativePath = fileUrl.substring("/uploads/".length());
        Path uploadRoot = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Path filePath = uploadRoot.resolve(relativePath).normalize();

        if (!filePath.startsWith(uploadRoot)) {
            return;
        }

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to delete uploaded file.",
                    exception
            );
        }
    }

    // COMMON VALIDATION
    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a file."
            );
        }
    }
}
