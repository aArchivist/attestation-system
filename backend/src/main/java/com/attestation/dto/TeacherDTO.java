package com.attestation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class TeacherDTO {

    @NotBlank
    private String fullName;

    @NotNull
    private Long positionId;

    @NotNull
    private Long categoryId;

    @Pattern(
        regexp = "^(Старший викладач|Викладач-методист)?$",
        message = "Педагогічне звання може бути тільки 'Старший викладач' або 'Викладач-методист'"
    )
    private String pedagogicalTitle;

    @NotNull
    private LocalDate lastAttestationDate;

    private LocalDate nextAttestationDate;

    private String attestationNote;

    private List<String> disciplines;
}
