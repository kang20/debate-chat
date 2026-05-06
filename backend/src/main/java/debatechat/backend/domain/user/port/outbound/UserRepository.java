package debatechat.backend.domain.user.port.outbound;

import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByProviderAndOauthId(OAuthProvider provider, String oauthId);

    boolean existsByProviderAndOauthId(OAuthProvider provider, String oauthId);
}
