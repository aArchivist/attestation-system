package com.attestation.dto;

import com.attestation.model.DeadlineStatus;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherSummaryDTO {
    private Long id;
    private String fullName;
    private Long categoryId;
    private String categoryName;
    private Long positionId;
    private String positionName;
    private String pedagogicalTitle;
    private LocalDate lastAttestationDate;
    private LocalDate nextAttestationDate;
    private int confirmedHours;
    private int totalHours;
    @Builder.Default
    private int requiredHours = 150;
    private DeadlineStatus deadlineStatus;
    private String attestationNote;
    private List<String> disciplines;
}
