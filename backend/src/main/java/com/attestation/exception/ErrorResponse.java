package com.attestation.exception;

import java.time.LocalDateTime;

public record ErrorResponse(String message, int status, LocalDateTime timestamp) {
}
