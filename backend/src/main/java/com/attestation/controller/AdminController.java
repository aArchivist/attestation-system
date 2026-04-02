package com.attestation.controller;

import com.attestation.dto.AdminUserDTO;
import com.attestation.dto.CreateUserRequest;
import com.attestation.dto.ResetPasswordRequest;
import com.attestation.model.CourseCategory;
import com.attestation.model.TeacherCategory;
import com.attestation.model.Position;
import com.attestation.repository.CourseCategoryRepository;
import com.attestation.repository.PositionRepository;
import com.attestation.repository.TeacherCategoryRepository;
import com.attestation.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CourseCategoryRepository categoryRepository;
    private final PositionRepository positionRepository;
    private final TeacherCategoryRepository teacherCategoryRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUserDTO> getUsers() {
        return adminService.getAllUsers().stream()
            .map(AdminUserDTO::from)
            .toList();
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(201).body(AdminUserDTO.from(
            adminService.createUser(request.getUsername(), request.getPassword(), request.getRole(), request.getTeacherId())
        ));
    }

    @PutMapping("/users/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest request) {
        adminService.resetPassword(id, request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleActive(@PathVariable Long id) {
        adminService.toggleActive(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users-categories")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TeacherCategory> getTeacherCategories() {
        return teacherCategoryRepository.findAll();
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('TEACHER','HEAD','ADMIN')")
    public List<CourseCategory> getCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/positions")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Position> getPositions() {
        return positionRepository.findAll();
    }
}
