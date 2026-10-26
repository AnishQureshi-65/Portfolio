
package com.portfolio.backend.service;

import com.portfolio.backend.entity.Profile;
import com.portfolio.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    // Get all profiles
    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    // Get profile by ID
    public Optional<Profile> getProfileById(Long id) {
        return profileRepository.findById(id);
    }

    // Create a new profile
    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    // Update an existing profile
    public Optional<Profile> updateProfile(
            Long id,
            Profile updatedProfile
    ) {
        return profileRepository.findById(id).map(existingProfile -> {

            // Update only fields that are not null
            if (updatedProfile.getName() != null) {
                existingProfile.setName(updatedProfile.getName());
            }

            if (updatedProfile.getHeadline() != null) {
                existingProfile.setHeadline(updatedProfile.getHeadline());
            }

            if (updatedProfile.getBio() != null) {
                existingProfile.setBio(updatedProfile.getBio());
            }

            if (updatedProfile.getEmail() != null) {
                existingProfile.setEmail(updatedProfile.getEmail());
            }

            if (updatedProfile.getPhone() != null) {
                existingProfile.setPhone(updatedProfile.getPhone());
            }

            if (updatedProfile.getLocation() != null) {
                existingProfile.setLocation(updatedProfile.getLocation());
            }

            if (updatedProfile.getGithubUrl() != null) {
                existingProfile.setGithubUrl(updatedProfile.getGithubUrl());
            }

            if (updatedProfile.getLinkedinUrl() != null) {
                existingProfile.setLinkedinUrl(updatedProfile.getLinkedinUrl());
            }

            // Preserve existing resume URL if incoming value is null
            if (updatedProfile.getResumeUrl() != null) {
                existingProfile.setResumeUrl(
                        updatedProfile.getResumeUrl()
                );
            }

            // Preserve existing profile image if incoming value is null
            if (updatedProfile.getProfileImage() != null) {
                existingProfile.setProfileImage(
                        updatedProfile.getProfileImage()
                );
            }

            return profileRepository.save(existingProfile);
        });
    }

    // Delete profile by ID
    public boolean deleteProfile(Long id) {
        if (!profileRepository.existsById(id)) {
            return false;
        }

        profileRepository.deleteById(id);
        return true;
    }
}
