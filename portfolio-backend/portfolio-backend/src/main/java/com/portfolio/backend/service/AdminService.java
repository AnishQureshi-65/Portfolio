package com.portfolio.backend.service;

import com.portfolio.backend.entity.Admin;
import com.portfolio.backend.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================================
    // FIND ADMIN
    // =========================================================

    public Optional<Admin> findByUsername(String username) {
        return adminRepository.findByUsername(username);
    }

    public Optional<Admin> findByEmail(String email) {
        return adminRepository.findByEmail(email);
    }


    // =========================================================
    // CREATE ADMIN
    // =========================================================

    public Admin createAdmin(
            String username,
            String email,
            String password
    ) {

        if (adminRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        if (adminRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        Admin admin = new Admin();

        admin.setUsername(username);
        admin.setEmail(email);

        admin.setPasswordHash(
                passwordEncoder.encode(password)
        );

        admin.setRole("ADMIN");
        admin.setActive(true);

        return adminRepository.save(admin);
    }


    // =========================================================
    // VERIFY PASSWORD
    // =========================================================

    public boolean verifyPassword(
            String rawPassword,
            String encodedPassword
    ) {

        return passwordEncoder.matches(
                rawPassword,
                encodedPassword
        );
    }


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    public Optional<Admin> resetPassword(
            String username,
            String newPassword
    ) {

        return adminRepository
                .findByUsername(username)
                .map(admin -> {

                    admin.setPasswordHash(
                            passwordEncoder.encode(newPassword)
                    );

                    return adminRepository.save(admin);
                });
    }
}