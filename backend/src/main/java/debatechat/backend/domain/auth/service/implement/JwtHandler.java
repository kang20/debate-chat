package debatechat.backend.domain.auth.service.implement;

import debatechat.backend.common.annotation.Implement;
import debatechat.backend.domain.auth.entity.JwtProperties;
import debatechat.backend.domain.user.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Implement
@RequiredArgsConstructor
public class JwtHandler {
    private final JwtProperties jwtProperties;

    public String createAccessToken(Long userId, UserRole role) {
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("role", role.name())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + jwtProperties.accessTokenExpiration()))
            .signWith(getSigningKey())
            .compact();
    }

    public String createRefreshToken() {
        return Jwts.builder()
            .id(UUID.randomUUID().toString())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + jwtProperties.refreshTokenExpiration()))
            .signWith(getSigningKey())
            .compact();
    }

    public Claims parseAccessToken(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public long getRefreshTokenExpirationMillis() {
        return jwtProperties.refreshTokenExpiration();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }
}
