package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Admin;
import com.portfolio.backend.security.JwtService;
import com.portfolio.backend.service.AdminService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminService adminService;
    private final JwtService jwtService;

    public AuthController(
            AdminService adminService,
            JwtService jwtService
    ) {
        this.adminService = adminService;
        this.jwtService = jwtService;
    }


    // =========================================================
    // ADMIN REGISTER
    // =========================================================

    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(
            @RequestBody AdminRegisterRequest request
    ) {

        try {

            Admin admin = adminService.createAdmin(
                    request.username(),
                    request.email(),
                    request.password()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            Map.of(
                                    "message",
                                    "Admin created successfully",

                                    "username",
                                    admin.getUsername(),

                                    "email",
                                    admin.getEmail()
                            )
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // ADMIN LOGIN
    // =========================================================

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(
            @RequestBody AdminLoginRequest request
    ) {

        // ---------------------------------------------------------
        // BASIC VALIDATION
        // ---------------------------------------------------------

        if (request.email() == null ||
                request.email().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Email is required"
                            )
                    );
        }


        if (request.password() == null ||
                request.password().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Password is required"
                            )
                    );
        }


        // ---------------------------------------------------------
        // FIND ADMIN BY EMAIL
        // ---------------------------------------------------------

        return adminService
                .findByEmail(request.email().trim())
                .map(admin -> {

                    // -------------------------------------------------
                    // CHECK ACTIVE STATUS
                    // -------------------------------------------------

                    if (!admin.isActive()) {

                        return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(
                                        Map.of(
                                                "message",
                                                "Admin account is inactive"
                                        )
                                );
                    }


                    // -------------------------------------------------
                    // VERIFY PASSWORD
                    // -------------------------------------------------

                    boolean passwordMatches =
                            adminService.verifyPassword(
                                    request.password(),
                                    admin.getPasswordHash()
                            );

                    if (!passwordMatches) {

                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(
                                        Map.of(
                                                "message",
                                                "Invalid email or password"
                                        )
                                );
                    }


                    // -------------------------------------------------
                    // GENERATE JWT
                    // -------------------------------------------------

                    String token =
                            jwtService.generateToken(
                                    admin.getUsername(),
                                    admin.getRole()
                            );


                    // -------------------------------------------------
                    // LOGIN SUCCESS
                    // -------------------------------------------------

                    return ResponseEntity.ok(
                            Map.of(
                                    "message",
                                    "Login successful",

                                    "token",
                                    token,

                                    "username",
                                    admin.getUsername(),

                                    "email",
                                    admin.getEmail(),

                                    "role",
                                    admin.getRole()
                            )
                    );

                })
                .orElseGet(() ->
                        ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(
                                        Map.of(
                                                "message",
                                                "Invalid email or password"
                                        )
                                )
                );
    }


    // =========================================================
    // ADMIN PASSWORD RESET
    // =========================================================
    //
    // TEMPORARY DEVELOPMENT ENDPOINT
    //
    // POST:
    // /api/auth/admin/reset-password
    //
    // IMPORTANT:
    // This endpoint should NOT remain public in production.
    // =========================================================

    @PostMapping("/admin/reset-password")
    public ResponseEntity<?> resetAdminPassword(
            @RequestBody AdminPasswordResetRequest request
    ) {

        // ---------------------------------------------------------
        // BASIC VALIDATION
        // ---------------------------------------------------------

        if (request.username() == null ||
                request.username().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Username is required"
                            )
                    );
        }


        if (request.newPassword() == null ||
                request.newPassword().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "New password is required"
                            )
                    );
        }


        // ---------------------------------------------------------
        // PASSWORD LENGTH CHECK
        // ---------------------------------------------------------

        if (request.newPassword().length() < 8) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Password must be at least 8 characters"
                            )
                    );
        }


        // ---------------------------------------------------------
        // RESET PASSWORD
        // ---------------------------------------------------------

        return adminService
                .resetPassword(
                        request.username(),
                        request.newPassword()
                )
                .map(admin ->
                        ResponseEntity.ok(
                                Map.of(
                                        "message",
                                        "Admin password reset successfully",

                                        "username",
                                        admin.getUsername()
                                )
                        )
                )
                .orElseGet(() ->
                        ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(
                                        Map.of(
                                                "message",
                                                "Admin not found"
                                        )
                                )
                );
    }


    // =========================================================
    // REQUEST RECORDS
    // =========================================================

    public record AdminRegisterRequest(
            String username,
            String email,
            String password
    ) {
    }


    // =========================================================
    // EMAIL LOGIN REQUEST
    // =========================================================

    public record AdminLoginRequest(
            String email,
            String password
    ) {
    }


    public record AdminPasswordResetRequest(
            String username,
            String newPassword
    ) {
    }
}