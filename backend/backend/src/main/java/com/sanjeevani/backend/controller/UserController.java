package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.dto.UserRequestDTO;
import com.sanjeevani.backend.entity.User;
import com.sanjeevani.backend.service.UserService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@Valid @RequestBody UserRequestDTO request) {
        return userService.createUser(request);
    }
}
