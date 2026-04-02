package com.attestation.service;

import com.attestation.dto.TeacherSummaryDTO;
import com.attestation.model.DeadlineStatus;
import com.attestation.model.Teacher;
import com.attestation.repository.CourseRepository;
import com.attestation.repository.TeacherRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AttestationService {

    public static final int REQUIRED_HOURS = 150;

    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;

    public TeacherSummaryDTO buildSummary(Teacher teacher) {
        LocalDate from = teacher.getLastAttestationDate();
        int confirmed = courseRepository.sumConfirmedHours(teacher.getId(), from);
        int total = courseRepository.sumAllHours(teacher.getId(), from);

        return TeacherSummaryDTO.builder()
            .id(teacher.getId())
            .fullName(teacher.getFullName())
            .categoryName(teacher.getCategory().getName())
            .positionName(teacher.getPosition().getName())
            .lastAttestationDate(teacher.getLastAttestationDate())
            .nextAttestationDate(teacher.getNextAttestationDate())
            .confirmedHours(confirmed)
            .totalHours(total)
            .requiredHours(REQUIRED_HOURS)
            .deadlineStatus(teacher.getDeadlineStatus())
            .attestationNote(teacher.getAttestationNote())
            .build();
    }

    public List<TeacherSummaryDTO> getAllSummaries() {
        return teacherRepository.findAll().stream()
            .map(this::buildSummary)
            .toList();
    }

    public List<TeacherSummaryDTO> getRedList() {
        return getAllSummaries().stream()
            .filter(summary -> summary.getDeadlineStatus() == DeadlineStatus.CRITICAL)
            .toList();
    }

    public List<TeacherSummaryDTO> getByAttestationYear(int year) {
        return teacherRepository.findByAttestationYear(year).stream()
            .map(this::buildSummary)
            .toList();
    }
}
