package com.attestation.service;

import com.attestation.dto.TeacherDTO;
import com.attestation.dto.TeacherSummaryDTO;
import com.attestation.model.Position;
import com.attestation.model.Teacher;
import com.attestation.model.TeacherCategory;
import com.attestation.model.TeacherDiscipline;
import com.attestation.repository.CourseRepository;
import com.attestation.repository.PositionRepository;
import com.attestation.repository.TeacherCategoryRepository;
import com.attestation.repository.TeacherRepository;
import com.attestation.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final PositionRepository positionRepository;
    private final TeacherCategoryRepository teacherCategoryRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AttestationService attestationService;

    @Transactional(readOnly = true)
    public List<TeacherSummaryDTO> getAll() {
        return teacherRepository.findAll().stream()
            .map(attestationService::buildSummary)
            .toList();
    }

    @Transactional(readOnly = true)
    public TeacherSummaryDTO getById(Long id) {
        return attestationService.buildSummary(findOrThrow(id));
    }

    public Teacher create(TeacherDTO dto) {
        Teacher teacher = new Teacher();
        apply(teacher, dto);
        return teacherRepository.save(teacher);
    }

    public Teacher update(Long id, TeacherDTO dto) {
        Teacher teacher = findOrThrow(id);
        apply(teacher, dto);
        return teacherRepository.save(teacher);
    }

    public void updateSchedule(Long id, LocalDate newDate, String note) {
        Teacher teacher = findOrThrow(id);
        teacher.setNextAttestationDate(newDate);
        teacher.setAttestationNote(note);
        teacherRepository.save(teacher);
    }

    public void delete(Long id) {
        Teacher teacher = findOrThrow(id);
        if (userRepository.existsByTeacherId(id)) {
            throw new IllegalArgumentException("Неможливо видалити викладача, поки до нього прив'язаний користувач");
        }
        if (courseRepository.existsByTeacherId(id)) {
            throw new IllegalArgumentException("Неможливо видалити викладача, для якого вже існують курси");
        }
        teacherRepository.delete(teacher);
    }

    private void apply(Teacher teacher, TeacherDTO dto) {
        Position position = positionRepository.findById(dto.getPositionId())
            .orElseThrow(() -> new EntityNotFoundException("Посаду не знайдено: " + dto.getPositionId()));
        TeacherCategory category = teacherCategoryRepository.findById(dto.getCategoryId())
            .orElseThrow(() -> new EntityNotFoundException("Категорію не знайдено: " + dto.getCategoryId()));
        LocalDate nextAttestationDate = dto.getLastAttestationDate().plusYears(5);

        teacher.setFullName(dto.getFullName());
        teacher.setPosition(position);
        teacher.setCategory(category);
        teacher.setPedagogicalTitle(dto.getPedagogicalTitle());
        teacher.setLastAttestationDate(dto.getLastAttestationDate());
        teacher.setNextAttestationDate(nextAttestationDate);
        teacher.setAttestationNote(dto.getAttestationNote());

        teacher.getDisciplines().clear();
        if (dto.getDisciplines() != null) {
            dto.getDisciplines().stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .forEach(discipline -> teacher.getDisciplines().add(
                    TeacherDiscipline.builder()
                        .teacher(teacher)
                        .discipline(discipline)
                        .build()
                ));
        }
    }

    private Teacher findOrThrow(Long id) {
        return teacherRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Викладача не знайдено: " + id));
    }
}
