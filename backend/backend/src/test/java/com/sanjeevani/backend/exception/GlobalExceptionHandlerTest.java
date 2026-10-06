package com.sanjeevani.backend.exception;

import com.sanjeevani.backend.dto.UserRequestDTO;
import com.sanjeevani.backend.controller.UserController;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    @Test
    void returnsValidationMessagesByField() throws NoSuchMethodException {
        Method method = UserController.class.getDeclaredMethod("createUser", UserRequestDTO.class);
        MethodParameter parameter = new MethodParameter(method, 0);
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new UserRequestDTO(), "request");
        bindingResult.addError(new FieldError("request", "email", "Email should be valid"));
        bindingResult.addError(new FieldError("request", "name", "Name is mandatory"));
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(parameter, bindingResult);

        Map<String, String> errors = new GlobalExceptionHandler().handleValidationErrors(exception);

        assertEquals(Map.of("email", "Email should be valid", "name", "Name is mandatory"), errors);
    }
}