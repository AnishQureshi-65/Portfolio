package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Admin;
import com.portfolio.backend.repository.AdminRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminRepository adminRepository;

    public AdminController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // =========================================================
    // ADMIN PROFILE
    // =========================================================

    /**
     * Get currently logged-in admin profile.
     *
     * GET /api/admin/me
     *
     * Requires:
     * Authorization: Bearer JWT_TOKEN
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAdmin(
            Authentication authentication
    ) {

        String username = authentication.getName();

        return adminRepository
                .findByUsername(username)
                .map(admin -> ResponseEntity.ok(
                        adminResponse(admin)
                ))
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // ADMIN MANAGEMENT
    // =========================================================

    /**
     * Get all admins.
     *
     * GET /api/admin
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllAdmins() {

        List<Map<String, Object>> admins =
                adminRepository.findAll()
                        .stream()
                        .map(this::adminResponse)
                        .toList();

        return ResponseEntity.ok(admins);
    }


    /**
     * Get admin by ID.
     *
     * GET /api/admin/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdminById(
            @PathVariable Long id
    ) {

        return adminRepository
                .findById(id)
                .map(admin -> ResponseEntity.ok(
                        adminResponse(admin)
                ))
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // ACTIVATE ADMIN
    // =========================================================

    /**
     * Activate an admin account.
     *
     * PUT /api/admin/{id}/activate
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateAdmin(
            @PathVariable Long id
    ) {

        return adminRepository
                .findById(id)
                .map(admin -> {

                    admin.setActive(true);

                    Admin updatedAdmin =
                            adminRepository.save(admin);

                    return ResponseEntity.ok(
                            Map.of(
                                    "message",
                                    "Admin activated successfully",

                                    "id",
                                    updatedAdmin.getId(),

                                    "username",
                                    updatedAdmin.getUsername(),

                                    "active",
                                    updatedAdmin.isActive()
                            )
                    );
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // DEACTIVATE ADMIN
    // =========================================================

    /**
     * Deactivate an admin account.
     *
     * Current logged-in admin cannot deactivate itself.
     *
     * PUT /api/admin/{id}/deactivate
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAdmin(
            @PathVariable Long id,
            Authentication authentication
    ) {

        String currentUsername =
                authentication.getName();

        return adminRepository
                .findById(id)
                .map(admin -> {

                    // Prevent self-deactivation
                    if (admin.getUsername()
                            .equals(currentUsername)) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        Map.of(
                                                "message",
                                                "You cannot deactivate your own admin account"
                                        )
                                );
                    }

                    admin.setActive(false);

                    Admin updatedAdmin =
                            adminRepository.save(admin);

                    return ResponseEntity.ok(
                            Map.of(
                                    "message",
                                    "Admin deactivated successfully",

                                    "id",
                                    updatedAdmin.getId(),

                                    "username",
                                    updatedAdmin.getUsername(),

                                    "active",
                                    updatedAdmin.isActive()
                            )
                    );
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // DELETE ADMIN
    // =========================================================

    /**
     * Delete an admin account.
     *
     * Current logged-in admin cannot delete itself.
     *
     * DELETE /api/admin/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmin(
            @PathVariable Long id,
            Authentication authentication
    ) {

        String currentUsername =
                authentication.getName();

        return adminRepository
                .findById(id)
                .map(admin -> {

                    // Prevent self deletion
                    if (admin.getUsername()
                            .equals(currentUsername)) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        Map.of(
                                                "message",
                                                "You cannot delete your own admin account"
                                        )
                                );
                    }

                    adminRepository.deleteById(id);

                    return ResponseEntity.ok(
                            Map.of(
                                    "message",
                                    "Admin deleted successfully"
                            )
                    );
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // SAFE ADMIN RESPONSE
    // =========================================================

    /**
     * Converts Admin entity into a safe API response.
     *
     * IMPORTANT:
     * passwordHash is intentionally NOT returned.
     */
    private Map<String, Object> adminResponse(
            Admin admin
    ) {

        return Map.of(
                "id",
                admin.getId(),

                "username",
                admin.getUsername(),

                "email",
                admin.getEmail(),

                "role",
                admin.getRole(),

                "active",
                admin.isActive()
        );
    }
}