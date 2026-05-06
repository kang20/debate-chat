package debatechat.backend.domain.auth.service;

import debatechat.backend.domain.auth.entity.JwtProperties;
import debatechat.backend.domain.auth.service.implement.JwtHandler;
import debatechat.backend.domain.user.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtHandlerTest {

    private JwtHandler jwtHandler;
    private static final String SECRET = "test-secret-key-for-unit-tests-minimum-32-bytes-long!!";

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties(SECRET, 1800000, 1209600000);
        jwtHandler = new JwtHandler(properties);
    }

    @Test
    void AccessToken_생성_시_userId와_role이_포함된다() {
        String token = jwtHandler.createAccessToken(1L, UserRole.DRAFT);

        Claims claims = jwtHandler.parseAccessToken(token);

        assertThat(claims.getSubject()).isEqualTo("1");
        assertThat(claims.get("role", String.class)).isEqualTo("DRAFT");
    }

    @Test
    void AccessToken_생성_시_만료시간이_설정된다() {
        String token = jwtHandler.createAccessToken(1L, UserRole.USER);

        Claims claims = jwtHandler.parseAccessToken(token);

        assertThat(claims.getExpiration()).isAfter(new Date());
    }

    @Test
    void RefreshToken_생성_시_빈_문자열이_아니다() {
        String token = jwtHandler.createRefreshToken();

        assertThat(token).isNotBlank();
    }

    @Test
    void 만료된_토큰은_파싱에_실패한다() {
        JwtProperties expiredProps = new JwtProperties(SECRET, -1000, 1209600000);
        JwtHandler expiredJwtHandler = new JwtHandler(expiredProps);
        String token = expiredJwtHandler.createAccessToken(1L, UserRole.USER);

        assertThatThrownBy(() -> jwtHandler.parseAccessToken(token))
            .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void 위조된_토큰은_파싱에_실패한다() {
        String fakeSecret = "different-secret-key-for-testing-minimum-32-bytes!!!!!";
        String fakeToken = Jwts.builder()
            .subject("1")
            .signWith(Keys.hmacShaKeyFor(fakeSecret.getBytes(StandardCharsets.UTF_8)))
            .compact();

        assertThatThrownBy(() -> jwtHandler.parseAccessToken(fakeToken))
            .isInstanceOf(SignatureException.class);
    }
}
