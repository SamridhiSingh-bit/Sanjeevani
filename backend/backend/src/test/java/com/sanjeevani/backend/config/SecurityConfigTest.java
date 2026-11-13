package com.sanjeevani.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityConfigTest {

    @Test
    void configuresBCryptPasswordEncoding() {
        PasswordEncoder encoder = new SecurityConfig().passwordEncoder();

        assertInstanceOf(BCryptPasswordEncoder.class, encoder);
        assertTrue(encoder.matches("secret123", encoder.encode("secret123")));
    }

    @Test
    void allowsProductionAndLocalDevelopmentOrigins() {
        CorsConfigurationSource source = new SecurityConfig()
                .corsConfigurationSource("https://sanjeevani-hazel.vercel.app, http://localhost:5173");

        CorsConfiguration configuration = source.getCorsConfiguration(
                new MockHttpServletRequest("GET", "/api/health"));

        assertNotNull(configuration);
        assertEquals(List.of("https://sanjeevani-hazel.vercel.app", "http://localhost:5173"),
                configuration.getAllowedOrigins());
    }
}
