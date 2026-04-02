package com.attestation.service;

import com.attestation.model.Role;
import com.attestation.model.Teacher;
import com.attestation.model.User;
import com.attestation.repository.TeacherRepository;
import com.attestation.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(String username, String rawPassword, Role role, Long teacherId) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Логін вже існує: " + username);
        }
        if (role == Role.TEACHER && teacherId == null) {
            throw new IllegalArgumentException("Для користувача з роллю TEACHER потрібно обрати викладача");
        }

        User user = User.builder()
            .username(username)
            .password(passwordEncoder.encode(rawPassword))
            .role(role)
            .active(true)
            .build();

        if (teacherId != null) {
            Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Викладача не знайдено"));
            user.setTeacher(teacher);
        }

        return userRepository.save(user);
    }

    public void resetPassword(Long userId, String newRawPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Користувача не знайдено"));
        user.setPassword(passwordEncoder.encode(newRawPassword));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void toggleActive(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Користувача не знайдено"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }
}
