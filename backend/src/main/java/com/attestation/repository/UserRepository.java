package com.attestation.repository;

import com.attestation.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByUsernameAndIdNot(String username, Long id);
    boolean existsByTeacherId(Long teacherId);
    boolean existsByTeacherIdAndIdNot(Long teacherId, Long id);
}
