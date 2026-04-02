package com.attestation.repository;

import com.attestation.model.Course;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacherId(Long teacherId);
    List<Course> findByTeacherIdOrderByIssueDateDesc(Long teacherId);
    List<Course> findByConfirmedFalseOrderByCreatedAtDesc();

    @Query("""
        SELECT COALESCE(SUM(c.hours), 0) FROM Course c
        WHERE c.teacher.id = :teacherId
          AND c.confirmed = true
          AND c.issueDate >= :fromDate
        """)
    int sumConfirmedHours(@Param("teacherId") Long teacherId, @Param("fromDate") LocalDate fromDate);

    @Query("""
        SELECT COALESCE(SUM(c.hours), 0) FROM Course c
        WHERE c.teacher.id = :teacherId
          AND c.issueDate >= :fromDate
        """)
    int sumAllHours(@Param("teacherId") Long teacherId, @Param("fromDate") LocalDate fromDate);
}
