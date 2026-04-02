package com.attestation.service;

import com.attestation.model.CourseCategory;
import com.attestation.model.Position;
import com.attestation.model.Role;
import com.attestation.model.TeacherCategory;
import com.attestation.model.User;
import com.attestation.repository.CourseCategoryRepository;
import com.attestation.repository.PositionRepository;
import com.attestation.repository.TeacherCategoryRepository;
import com.attestation.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataBootstrapService implements CommandLineRunner {

    private final CourseCategoryRepository courseCategoryRepository;
    private final PositionRepository positionRepository;
    private final TeacherCategoryRepository teacherCategoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedCourseCategories();
        seedPositions();
        seedTeacherCategories();
        seedAdmin();
    }

    private void seedCourseCategories() {
        if (courseCategoryRepository.count() > 0) {
            return;
        }

        courseCategoryRepository.saveAll(List.of(
            CourseCategory.builder().name("Профільне (ІТ)").build(),
            CourseCategory.builder().name("Психолого-педагогічне").build(),
            CourseCategory.builder().name("Інклюзивна освіта").build(),
            CourseCategory.builder().name("Інше").build()
        ));
    }

    private void seedPositions() {
        if (positionRepository.count() > 0) {
            return;
        }

        positionRepository.saveAll(List.of(
            Position.builder().name("Викладач").build(),
            Position.builder().name("Старший викладач").build(),
            Position.builder().name("Методист").build()
        ));
    }

    private void seedTeacherCategories() {
        saveTeacherCategoryIfMissing("Вища");
        saveTeacherCategoryIfMissing("Перша");
        saveTeacherCategoryIfMissing("Друга");
        saveTeacherCategoryIfMissing("Спеціаліст");
        saveTeacherCategoryIfMissing("Без категорії");
    }

    private void seedAdmin() {
        if (userRepository.existsByUsername("admin")) {
            return;
        }

        userRepository.save(User.builder()
            .username("admin")
            .password(passwordEncoder.encode("admin123"))
            .role(Role.ADMIN)
            .active(true)
            .build());
    }

    private void saveTeacherCategoryIfMissing(String name) {
        if (teacherCategoryRepository.existsByName(name)) {
            return;
        }

        teacherCategoryRepository.save(TeacherCategory.builder()
            .name(name)
            .build());
    }
}
