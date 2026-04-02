package com.attestation.dto;

import com.attestation.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotNull
    private Role role;

    private Long teacherId;
}
