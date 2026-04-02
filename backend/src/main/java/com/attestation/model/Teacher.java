package com.attestation.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = false)
    private Position position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private TeacherCategory category;

    @Column(name = "pedagogical_title")
    private String pedagogicalTitle;

    @Column(name = "last_attestation_date", nullable = false)
    private LocalDate lastAttestationDate;

    @Column(name = "next_attestation_date", nullable = false)
    private LocalDate nextAttestationDate;

    @Column(name = "attestation_note")
    private String attestationNote;

    @Builder.Default
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeacherDiscipline> disciplines = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    private List<Course> courses = new ArrayList<>();

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    public DeadlineStatus getDeadlineStatus() {
        int yearsUntil = nextAttestationDate.getYear() - LocalDate.now().getYear();
        if (yearsUntil <= 0) {
            return DeadlineStatus.CRITICAL;
        }
        if (yearsUntil == 1) {
            return DeadlineStatus.WARNING;
        }
        return DeadlineStatus.OK;
    }
}
