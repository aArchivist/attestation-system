package com.attestation.service;

import com.attestation.dto.AuthRequest;
import com.attestation.dto.AuthResponse;
import com.attestation.model.User;
import com.attestation.repository.UserRepository;
import com.attestation.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("Користувача не знайдено"));

        String token = jwtService.generateToken(user);
        Long teacherId = user.getTeacher() != null ? user.getTeacher().getId() : null;
        return AuthResponse.builder()
            .token(token)
            .role(user.getRole().name())
            .teacherId(teacherId)
            .build();
    }
}
