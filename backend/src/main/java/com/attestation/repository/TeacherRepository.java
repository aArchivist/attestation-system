package com.attestation.repository;

import com.attestation.model.Teacher;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    @Query("SELECT t FROM Teacher t WHERE YEAR(t.nextAttestationDate) = :year")
    List<Teacher> findByAttestationYear(@Param("year") int year);
}
