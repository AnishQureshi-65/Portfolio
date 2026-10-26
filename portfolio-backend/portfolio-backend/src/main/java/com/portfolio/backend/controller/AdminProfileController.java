package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Profile;
import com.portfolio.backend.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/profile")
public class AdminProfileController {

    private final ProfileService profileService;

    public AdminProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /*
     * =====================================================
     * GET PROFILE
     * =====================================================
     */

    @GetMapping
    public ResponseEntity<?> getProfile() {

        List<Profile> profiles =
                profileService.getAllProfiles();

        if (profiles.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Profile information not found."
                            )
                    );
        }

        return ResponseEntity.ok(
                profiles.get(0)
        );
    }


    /*
     * =====================================================
     * UPDATE PROFILE
     * =====================================================
     */

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody Profile updatedProfile
    ) {

        List<Profile> profiles =
                profileService.getAllProfiles();

        if (profiles.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Profile information not found."
                            )
                    );
        }

        Long profileId =
                profiles.get(0).getId();

        java.util.Optional<Profile> updated =
                profileService.updateProfile(
                        profileId,
                        updatedProfile
                );

        if (updated.isPresent()) {

            return ResponseEntity.ok(
                    updated.get()
            );
        }

        return ResponseEntity
                .badRequest()
                .body(
                        Map.of(
                                "message",
                                "Unable to update profile."
                        )
                );
    }
}