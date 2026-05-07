package debatechat.backend.base.fixture;

import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.User;
import debatechat.backend.domain.user.port.outbound.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserFixture {

    @Autowired private UserRepository userRepository;
    @Autowired private EntityManager em;

    public User createDraft(OAuthProvider provider, String oauthId) {
        User user = User.createDraft(provider, oauthId);
        userRepository.save(user);
        em.flush();
        em.clear();
        return user;
    }

    public User createUser(OAuthProvider provider, String oauthId, String nickname) {
        User user = User.createDraft(provider, oauthId);
        user.activateWithNickname(nickname);
        userRepository.save(user);
        em.flush();
        em.clear();
        return user;
    }
}
