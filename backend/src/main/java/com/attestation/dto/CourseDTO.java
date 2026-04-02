package com.attestation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDTO {

    @NotNull
    private Long categoryId;

    @NotBlank
    private String title;

    @NotBlank
    private String institution;

    @NotNull
    @Min(1)
    private Integer hours;

    private BigDecimal ectsCredits;

    @NotNull
    private LocalDate issueDate;

    private String driveUrl;
}
