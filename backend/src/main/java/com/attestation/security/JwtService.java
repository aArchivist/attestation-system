package com.attestation.security;

import com.attestation.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(User user) {
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("userId", user.getId())
            .claim("role", user.getRole().name())
            .claim("teacherId", user.getTeacher() != null ? user.getTeacher().getId() : null)
            .claim("active", user.isActive())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            .compact();
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername())
            && !getClaims(token).getExpiration().before(new Date());
    }

    public CurrentUser extractCurrentUser(String token) {
        Claims claims = getClaims(token);
        Long teacherId = claims.get("teacherId", Integer.class) != null
            ? claims.get("teacherId", Integer.class).longValue()
            : claims.get("teacherId", Long.class);

        Long userId = claims.get("userId", Integer.class) != null
            ? claims.get("userId", Integer.class).longValue()
            : claims.get("userId", Long.class);

        return new CurrentUser(
            userId,
            claims.getSubject(),
            Enum.valueOf(com.attestation.model.Role.class, claims.get("role", String.class)),
            teacherId,
            claims.get("active", Boolean.class)
        );
    }

    private Claims getClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build()
            .parseSignedClaims(token).getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}
