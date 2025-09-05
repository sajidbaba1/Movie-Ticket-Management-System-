package com.moviebooking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS support so the CorsConfig WebMvcConfigurer is applied
            .cors(cors -> {})
            // Disable CSRF for stateless APIs; enable if you use session forms
            .csrf(csrf -> csrf.disable())
            // Permit preflight requests and allow basic public endpoints
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll() // adjust as needed; controllers can still use @PreAuthorize
                .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
