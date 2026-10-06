package com.sanjeevani.backend.service;

import com.sanjeevani.backend.dto.UserRequestDTO;
import com.sanjeevani.backend.entity.User;
import com.sanjeevani.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceTest {

    @Test
    void createUserHashesPasswordAndSavesUser() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        UserService service = new UserService(userRepository, passwordEncoder);
        UserRequestDTO request = new UserRequestDTO();
        request.setName("Sam");
        request.setEmail("sam@example.com");
        request.setPassword("secret123");

        when(passwordEncoder.encode("secret123")).thenReturn("bcrypt-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = service.createUser(request);

        assertEquals("Sam", result.getName());
        assertEquals("sam@example.com", result.getEmail());
        assertEquals("bcrypt-hash", result.getPasswordHash());
        verify(passwordEncoder).encode("secret123");
        verify(userRepository).save(result);
    }
}