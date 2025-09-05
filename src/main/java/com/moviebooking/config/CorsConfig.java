package com.moviebooking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.Optional;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer(Environment env,
                                           @Value("${ALLOWED_ORIGINS:}") String allowedOriginsEnv,
                                           @Value("${spring.web.cors.allowed-origins:}") String allowedOriginsProp) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Resolve from (1) env var ALLOWED_ORIGINS, then (2) Spring property spring.web.cors.allowed-origins, else defaults
                String envValue = Optional.ofNullable(allowedOriginsEnv)
                        .filter(s -> !s.isBlank())
                        .orElse(null);
                String propValue = (envValue == null)
                        ? Optional.ofNullable(allowedOriginsProp).filter(s -> !s.isBlank()).orElse(null)
                        : null;
                String[] defaults = new String[]{
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:3002",
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175"
                };
                String source = (envValue != null) ? envValue : propValue;
                String[] origins = (source != null)
                        ? Arrays.stream(source.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .toArray(String[]::new)
                        : defaults;

                registry.addMapping("/api/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization")
                        .allowCredentials(true);
            }
        };
    }
}
