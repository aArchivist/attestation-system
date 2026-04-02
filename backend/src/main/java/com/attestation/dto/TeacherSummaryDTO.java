package com.attestation.dto;

import com.attestation.model.DeadlineStatus;
import java.time.LocalDate;
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
    private String categoryName;
    private String positionName;
    private LocalDate lastAttestationDate;
    private LocalDate nextAttestationDate;
    private int confirmedHours;
    private int totalHours;
    @Builder.Default
    private int requiredHours = 150;
    private DeadlineStatus deadlineStatus;
    private String attestationNote;
}
