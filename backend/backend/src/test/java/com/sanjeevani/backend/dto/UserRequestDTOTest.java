package com.sanjeevani.backend.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserRequestDTOTest {

    @Test
    void rejectsBlankNameInvalidEmailAndShortPassword() {
        UserRequestDTO request = new UserRequestDTO();
        request.setName(" ");
        request.setEmail("not-an-email");
        request.setPassword("123");

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            var violations = validator.validate(request);

            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
        }
    }

    @Test
    void acceptsValidRegistrationData() {
        UserRequestDTO request = new UserRequestDTO();
        request.setName("Sam");
        request.setEmail("sam@example.com");
        request.setPassword("secret123");

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            assertFalse(factory.getValidator().validate(request).iterator().hasNext());
        }
    }
}