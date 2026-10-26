
package com.portfolio.backend.security;

import com.portfolio.backend.entity.Admin;
import com.portfolio.backend.repository.AdminRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AdminRepository adminRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            AdminRepository adminRepository
    ) {
        this.jwtService = jwtService;
        this.adminRepository = adminRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader(
                HttpHeaders.AUTHORIZATION
        );

        // No Bearer token: continue.
        // Protected endpoints will be handled by Spring Security.
        if (authHeader == null || authHeader.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // An Authorization header was supplied but is not a Bearer token.
        if (!authHeader.startsWith("Bearer ")) {
            rejectUnauthorized(response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isEmpty()) {
            rejectUnauthorized(response);
            return;
        }

        try {
            // Verify token signature and expiration.
            if (!jwtService.isTokenValid(token)) {
                rejectUnauthorized(response);
                return;
            }

            String username = jwtService.extractUsername(token);

            if (username == null || username.isBlank()) {
                rejectUnauthorized(response);
                return;
            }

            // Do not overwrite an existing authenticated context.
            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null) {

                Admin admin = adminRepository
                        .findByUsername(username)
                        .orElse(null);

                // Token must belong to an existing admin.
                if (admin == null) {
                    rejectUnauthorized(response);
                    return;
                }

                // Disabled/inactive account must not authenticate.
                if (!admin.isActive()) {
                    rejectUnauthorized(response);
                    return;
                }

                // This application expects the ROLE_ADMIN authority.
                if (admin.getRole() == null
                        || !"ADMIN".equalsIgnoreCase(
                        admin.getRole().trim()
                )) {
                    response.setStatus(
                            HttpStatus.FORBIDDEN.value()
                    );
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(
                            "{\"message\":\"Access denied\"}"
                    );
                    return;
                }

                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority("ROLE_ADMIN");

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                admin.getUsername(),
                                null,
                                List.of(authority)
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception exception) {
            // Do not log the JWT, secret, or exception message.
            SecurityContextHolder.clearContext();
            rejectUnauthorized(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void rejectUnauthorized(
            HttpServletResponse response
    ) throws IOException {

        SecurityContextHolder.clearContext();

        response.setStatus(
                HttpStatus.UNAUTHORIZED.value()
        );
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"message\":\"Invalid or expired authentication token\"}"
        );
    }
}
