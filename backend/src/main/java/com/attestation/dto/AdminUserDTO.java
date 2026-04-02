package com.attestation.dto;

import com.attestation.model.Role;
import com.attestation.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDTO {

    private Long id;
    private String username;
    private Role role;
    private Long teacherId;
    private boolean active;

    public static AdminUserDTO from(User user) {
        return AdminUserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .role(user.getRole())
            .teacherId(user.getTeacher() != null ? user.getTeacher().getId() : null)
            .active(user.isActive())
            .build();
    }
}
