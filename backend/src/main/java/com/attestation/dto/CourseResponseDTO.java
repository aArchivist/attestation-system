package com.attestation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponseDTO {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String institution;
    private Integer hours;
    private BigDecimal ectsCredits;
    private LocalDate issueDate;
    private String driveUrl;
    private boolean confirmed;
    private LocalDateTime confirmedAt;
    private LocalDateTime createdAt;
}
