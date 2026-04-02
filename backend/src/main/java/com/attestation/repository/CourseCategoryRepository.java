package com.attestation.repository;

import com.attestation.model.CourseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseCategoryRepository extends JpaRepository<CourseCategory, Long> {
}
