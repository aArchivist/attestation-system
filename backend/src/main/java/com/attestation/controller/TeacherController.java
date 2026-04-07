package com.attestation.controller;

import com.attestation.dto.TeacherDTO;
import com.attestation.dto.TeacherSummaryDTO;
import com.attestation.dto.UpdateScheduleRequest;
import com.attestation.security.CurrentUser;
import com.attestation.service.TeacherService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HEAD','ADMIN')")
    public List<TeacherSummaryDTO> getAll() {
        return teacherService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HEAD','ADMIN') or (hasRole('TEACHER') and #id == authentication.principal.teacherId)")
    public TeacherSummaryDTO getById(@PathVariable Long id) {
        return teacherService.getById(id);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TEACHER')")
    public TeacherSummaryDTO getMe(Authentication auth) {
        CurrentUser user = (CurrentUser) auth.getPrincipal();
        if (user.getTeacherId() == null) {
            throw new IllegalArgumentException("Обліковий запис викладача не прив'язаний до профілю викладача");
        }
        return teacherService.getById(user.getTeacherId());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherSummaryDTO> create(@Valid @RequestBody TeacherDTO dto) {
        return ResponseEntity.status(201).body(teacherService.getById(teacherService.create(dto).getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TeacherSummaryDTO update(@PathVariable Long id, @Valid @RequestBody TeacherDTO dto) {
        teacherService.update(id, dto);
        return teacherService.getById(id);
    }

    @PutMapping("/{id}/schedule")
    @PreAuthorize("hasAnyRole('HEAD','ADMIN')")
    public ResponseEntity<Void> updateSchedule(@PathVariable Long id, @Valid @RequestBody UpdateScheduleRequest request) {
        teacherService.updateSchedule(id, request.getNewDate(), request.getNote());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
