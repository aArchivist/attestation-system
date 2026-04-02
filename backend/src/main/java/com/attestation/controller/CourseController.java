package com.attestation.controller;

import com.attestation.dto.CourseDTO;
import com.attestation.dto.CourseResponseDTO;
import com.attestation.security.CurrentUser;
import com.attestation.service.CourseService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('TEACHER')")
    public List<CourseResponseDTO> getMyCourses(Authentication auth) {
        CurrentUser user = (CurrentUser) auth.getPrincipal();
        if (user.getTeacherId() == null) {
            throw new IllegalArgumentException("Обліковий запис викладача не прив'язаний до профілю викладача");
        }
        return courseService.getCoursesForTeacher(user.getTeacherId());
    }

    @GetMapping("/teacher/{id}")
    @PreAuthorize("hasAnyRole('HEAD','ADMIN')")
    public List<CourseResponseDTO> getByTeacher(@PathVariable Long id) {
        return courseService.getCoursesForTeacher(id);
    }

    @GetMapping("/unconfirmed")
    @PreAuthorize("hasRole('HEAD')")
    public List<CourseResponseDTO> getUnconfirmed() {
        return courseService.getUnconfirmed();
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<CourseResponseDTO> addCourse(@Valid @RequestBody CourseDTO dto, Authentication auth) {
        CurrentUser user = (CurrentUser) auth.getPrincipal();
        if (user.getTeacherId() == null) {
            throw new IllegalArgumentException("Обліковий запис викладача не прив'язаний до профілю викладача");
        }
        return ResponseEntity.status(201).body(courseService.addCourse(dto, user.getTeacherId()));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('HEAD')")
    public CourseResponseDTO confirm(@PathVariable Long id, Authentication auth) {
        CurrentUser user = (CurrentUser) auth.getPrincipal();
        return courseService.confirmCourse(id, user.getUserId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        CurrentUser user = (CurrentUser) auth.getPrincipal();
        courseService.deleteCourse(id, user.getTeacherId(), user.getRole().name());
        return ResponseEntity.noContent().build();
    }
}
