package debatechat.backend.base.fixture;

import debatechat.backend.domain.auth.entity.RefreshToken;
import debatechat.backend.domain.auth.port.outbound.RefreshTokenRepository;
import debatechat.backend.domain.user.entity.User;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class RefreshTokenFixture {

    @Autowired private RefreshTokenRepository refreshTokenRepository;
    @Autowired private EntityManager em;

    public RefreshToken create(User user) {
        return create(user, UUID.randomUUID().toString(), LocalDateTime.now().plusDays(7));
    }

    public RefreshToken createExpired(User user) {
        return create(user, UUID.randomUUID().toString(), LocalDateTime.now().minusSeconds(1));
    }

    public RefreshToken create(User user, String token, LocalDateTime expiresAt) {
        RefreshToken refreshToken = RefreshToken.create(user.getId(), token, expiresAt);
        refreshTokenRepository.save(refreshToken);
        em.flush();
        em.clear();
        return refreshToken;
    }
}
