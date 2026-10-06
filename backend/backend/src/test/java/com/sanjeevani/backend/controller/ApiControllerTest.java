package com.sanjeevani.backend.controller;

import com.sanjeevani.backend.dto.UserRequestDTO;
import com.sanjeevani.backend.entity.HealthProfile;
import com.sanjeevani.backend.entity.Symptom;
import com.sanjeevani.backend.entity.SymptomLog;
import com.sanjeevani.backend.entity.User;
import com.sanjeevani.backend.entity.VitalLog;
import com.sanjeevani.backend.entity.WellnessLog;
import com.sanjeevani.backend.repository.HealthProfileRepository;
import com.sanjeevani.backend.repository.SymptomLogRepository;
import com.sanjeevani.backend.repository.SymptomRepository;
import com.sanjeevani.backend.repository.VitalLogRepository;
import com.sanjeevani.backend.repository.WellnessLogRepository;
import com.sanjeevani.backend.service.UserService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ApiControllerTest {

    @Test
    void healthEndpointReturnsStatusMessage() {
        assertEquals("Backend is running smoothly!", new HealthController().healthCheck());
    }

    @Test
    void healthProfileControllerCreatesAndFindsProfile() {
        HealthProfileRepository repository = mock(HealthProfileRepository.class);
        HealthProfileController controller = new HealthProfileController(repository);
        HealthProfile profile = new HealthProfile();
        when(repository.save(profile)).thenReturn(profile);
        when(repository.findById(1L)).thenReturn(Optional.of(profile));

        assertSame(profile, controller.create(profile));
        assertSame(profile, controller.get(1L));
        verify(repository).save(profile);
        verify(repository).findById(1L);
    }

    @Test
    void symptomControllerCreatesAndListsSymptoms() {
        SymptomRepository repository = mock(SymptomRepository.class);
        SymptomController controller = new SymptomController(repository);
        Symptom symptom = new Symptom();
        List<Symptom> symptoms = List.of(symptom);
        when(repository.save(symptom)).thenReturn(symptom);
        when(repository.findAll()).thenReturn(symptoms);

        assertSame(symptom, controller.create(symptom));
        assertEquals(symptoms, controller.getAll());
    }

    @Test
    void symptomLogControllerCreatesAndListsLogs() {
        SymptomLogRepository repository = mock(SymptomLogRepository.class);
        SymptomLogController controller = new SymptomLogController(repository);
        SymptomLog log = new SymptomLog();
        List<SymptomLog> logs = List.of(log);
        when(repository.save(log)).thenReturn(log);
        when(repository.findAll()).thenReturn(logs);

        assertSame(log, controller.create(log));
        assertEquals(logs, controller.getAll());
    }

    @Test
    void userControllerDelegatesRegistration() {
        UserService service = mock(UserService.class);
        UserController controller = new UserController(service);
        UserRequestDTO request = new UserRequestDTO();
        User user = new User();
        when(service.createUser(request)).thenReturn(user);

        assertSame(user, controller.createUser(request));
        verify(service).createUser(request);
    }

    @Test
    void vitalControllerCreatesAndListsLogs() {
        VitalLogRepository repository = mock(VitalLogRepository.class);
        VitalController controller = new VitalController(repository);
        VitalLog vital = new VitalLog();
        List<VitalLog> vitals = List.of(vital);
        when(repository.save(vital)).thenReturn(vital);
        when(repository.findAll()).thenReturn(vitals);

        assertSame(vital, controller.create(vital));
        assertEquals(vitals, controller.getAll());
    }

    @Test
    void wellnessControllerCreatesAndListsLogs() {
        WellnessLogRepository repository = mock(WellnessLogRepository.class);
        WellnessController controller = new WellnessController(repository);
        WellnessLog log = new WellnessLog();
        List<WellnessLog> logs = List.of(log);
        when(repository.save(log)).thenReturn(log);
        when(repository.findAll()).thenReturn(logs);

        assertSame(log, controller.create(log));
        assertEquals(logs, controller.getAll());
    }
}