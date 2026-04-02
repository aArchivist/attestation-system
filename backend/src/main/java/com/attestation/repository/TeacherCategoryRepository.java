package com.attestation.repository;

import com.attestation.model.TeacherCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherCategoryRepository extends JpaRepository<TeacherCategory, Long> {
    boolean existsByName(String name);
}
