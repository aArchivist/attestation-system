package com.attestation.service;

import com.attestation.dto.CourseDTO;
import com.attestation.dto.CourseResponseDTO;
import com.attestation.model.Course;
import com.attestation.model.CourseCategory;
import com.attestation.model.Teacher;
import com.attestation.model.User;
import com.attestation.repository.CourseCategoryRepository;
import com.attestation.repository.CourseRepository;
import com.attestation.repository.TeacherRepository;
import com.attestation.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final CourseCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private static final BigDecimal HOURS_PER_CREDIT_STEP = BigDecimal.valueOf(3);
    private static final BigDecimal CREDIT_STEP = BigDecimal.valueOf(0.1);

    public CourseResponseDTO addCourse(CourseDTO dto, Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new EntityNotFoundException("Викладача не знайдено"));
        CourseCategory category = categoryRepository.findById(dto.getCategoryId())
            .orElseThrow(() -> new EntityNotFoundException("Категорію не знайдено"));

        Course course = Course.builder()
            .teacher(teacher)
            .category(category)
            .title(dto.getTitle())
            .institution(dto.getInstitution())
            .hours(dto.getHours())
            .ectsCredits(calculateEcts(dto.getHours()))
            .issueDate(dto.getIssueDate())
            .driveUrl(dto.getDriveUrl())
            .build();

        return toResponseDTO(courseRepository.save(course));
    }

    public CourseResponseDTO updateCourse(Long courseId, CourseDTO dto, Long requesterTeacherId, String requesterRole) {
        Course course = findOrThrow(courseId);
        boolean isAdmin = "ADMIN".equals(requesterRole);
        boolean isOwner = requesterTeacherId != null && course.getTeacher().getId().equals(requesterTeacherId);
        if (!isAdmin && (!isOwner || course.isConfirmed())) {
            throw new AccessDeniedException("Неможливо редагувати підтверджений курс");
        }

        CourseCategory category = categoryRepository.findById(dto.getCategoryId())
            .orElseThrow(() -> new EntityNotFoundException("Категорію не знайдено"));

        course.setCategory(category);
        course.setTitle(dto.getTitle());
        course.setInstitution(dto.getInstitution());
        course.setHours(dto.getHours());
        course.setEctsCredits(calculateEcts(dto.getHours()));
        course.setIssueDate(dto.getIssueDate());
        course.setDriveUrl(dto.getDriveUrl());

        return toResponseDTO(courseRepository.save(course));
    }

    public CourseResponseDTO confirmCourse(Long courseId, Long userId) {
        Course course = findOrThrow(courseId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Користувача не знайдено"));
        course.setConfirmed(true);
        course.setConfirmedBy(user);
        course.setConfirmedAt(LocalDateTime.now());
        return toResponseDTO(courseRepository.save(course));
    }

    public void deleteCourse(Long courseId, Long requesterTeacherId, String requesterRole) {
        Course course = findOrThrow(courseId);
        boolean isAdmin = "ADMIN".equals(requesterRole);
        boolean isOwner = requesterTeacherId != null && course.getTeacher().getId().equals(requesterTeacherId);
        if (!isAdmin && (!isOwner || course.isConfirmed())) {
            throw new AccessDeniedException("Неможливо видалити підтверджений курс");
        }
        courseRepository.delete(course);
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getCoursesForTeacher(Long teacherId) {
        return courseRepository.findByTeacherIdOrderByIssueDateDesc(teacherId).stream()
            .map(this::toResponseDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getUnconfirmed() {
        return courseRepository.findByConfirmedFalseOrderByCreatedAtDesc().stream()
            .map(this::toResponseDTO)
            .toList();
    }

    private Course findOrThrow(Long id) {
        return courseRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Курс не знайдено: " + id));
    }

    private BigDecimal calculateEcts(Integer hours) {
        return BigDecimal.valueOf(hours)
            .divideToIntegralValue(HOURS_PER_CREDIT_STEP)
            .multiply(CREDIT_STEP)
            .setScale(1);
    }

    private CourseResponseDTO toResponseDTO(Course course) {
        return CourseResponseDTO.builder()
            .id(course.getId())
            .teacherId(course.getTeacher().getId())
            .teacherName(course.getTeacher().getFullName())
            .categoryId(course.getCategory().getId())
            .categoryName(course.getCategory().getName())
            .title(course.getTitle())
            .institution(course.getInstitution())
            .hours(course.getHours())
            .ectsCredits(course.getEctsCredits())
            .issueDate(course.getIssueDate())
            .driveUrl(course.getDriveUrl())
            .confirmed(course.isConfirmed())
            .confirmedAt(course.getConfirmedAt())
            .createdAt(course.getCreatedAt())
            .build();
    }
}
