package com.portfolio.backend.security;

import com.portfolio.backend.entity.Admin;
import com.portfolio.backend.repository.AdminRepository;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    public AdminDetailsService(
            AdminRepository adminRepository
    ) {
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String username
    ) throws UsernameNotFoundException {

        Admin admin = adminRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Admin not found: " + username
                        )
                );

        GrantedAuthority authority =
                new SimpleGrantedAuthority(
                        "ROLE_" + admin.getRole()
                );

        return User.builder()
                .username(admin.getUsername())
                .password(admin.getPasswordHash())
                .authorities(List.of(authority))
                .disabled(!admin.isActive())
                .build();
    }
}