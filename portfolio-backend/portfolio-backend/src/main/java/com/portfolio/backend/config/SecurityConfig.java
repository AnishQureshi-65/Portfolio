
package com.portfolio.backend.config;

import com.portfolio.backend.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // PASSWORD ENCODER
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // SECURITY FILTER CHAIN
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // Appropriate for a stateless API using Bearer JWT headers.
                // Revisit this if authentication is moved to cookies.
                .csrf(csrf -> csrf.disable())

                // CORS
                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))

                // JWT-based stateless authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // AUTHORIZATION
                .authorizeHttpRequests(auth -> auth

                        // Allow browser CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // Public login only
                        .requestMatchers(
                                "/api/auth/admin/login"
                        ).permitAll()

                        // Admin registration and password reset
                        // require an authenticated administrator.
                        .requestMatchers(
                                "/api/auth/admin/register",
                                "/api/auth/admin/reset-password"
                        ).hasAuthority("ROLE_ADMIN")

                        // File upload endpoints: ADMIN only
                        .requestMatchers(
                                "/api/upload/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // Public uploaded files.
                        // NOTE: this also makes resume files public.
                        .requestMatchers(
                                "/uploads/**"
                        ).permitAll()

                        // PROFILE: public read
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/profile",
                                "/api/profile/**"
                        ).permitAll()

                        // PROJECTS: public read
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projects",
                                "/api/projects/**"
                        ).permitAll()

                        // SKILLS: public read
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/skills",
                                "/api/skills/**"
                        ).permitAll()

                        // EDUCATION: public read
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/education",
                                "/api/education/**"
                        ).permitAll()

                        // CERTIFICATES: public read
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/certificates",
                                "/api/certificates/**"
                        ).permitAll()

                        // EXPERIENCES: public read
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/experiences",
                                "/api/experiences/**"
                        ).permitAll()

                        // CONTACT: anyone can submit a message
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/contact"
                        ).permitAll()

                        // CONTACT: admin-only message management
                        .requestMatchers(
                                "/api/contact",
                                "/api/contact/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // Health endpoint
                        .requestMatchers(
                                "/api/health"
                        ).permitAll()

                        // Home, error and favicon
                        .requestMatchers(
                                "/",
                                "/error",
                                "/favicon.ico"
                        ).permitAll()

                        // Admin APIs
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // All remaining write requests for portfolio
                        // content require an administrator.
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/profile", "/api/profile/**",
                                "/api/projects", "/api/projects/**",
                                "/api/skills", "/api/skills/**",
                                "/api/education", "/api/education/**",
                                "/api/certificates", "/api/certificates/**",
                                "/api/experiences", "/api/experiences/**"
                        ).hasAuthority("ROLE_ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/profile", "/api/profile/**",
                                "/api/projects", "/api/projects/**",
                                "/api/skills", "/api/skills/**",
                                "/api/education", "/api/education/**",
                                "/api/certificates", "/api/certificates/**",
                                "/api/experiences", "/api/experiences/**"
                        ).hasAuthority("ROLE_ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/profile", "/api/profile/**",
                                "/api/projects", "/api/projects/**",
                                "/api/skills", "/api/skills/**",
                                "/api/education", "/api/education/**",
                                "/api/certificates", "/api/certificates/**",
                                "/api/experiences", "/api/experiences/**"
                        ).hasAuthority("ROLE_ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/profile", "/api/profile/**",
                                "/api/projects", "/api/projects/**",
                                "/api/skills", "/api/skills/**",
                                "/api/education", "/api/education/**",
                                "/api/certificates", "/api/certificates/**",
                                "/api/experiences", "/api/experiences/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // Deny access to anything not explicitly permitted
                        // or matched by an authenticated rule above.
                        .anyRequest().denyAll()
                )

                // JWT authentication filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // CORS CONFIGURATION
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Local React/Vite frontend origins
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:3000"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
