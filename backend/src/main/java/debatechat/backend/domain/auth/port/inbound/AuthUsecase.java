package debatechat.backend.domain.auth.port.inbound;

import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.presentation.auth.dto.LoginResponse;
import debatechat.backend.presentation.auth.dto.TokenRefreshResponse;

public interface AuthUsecase {

    LoginResponse signup(OAuthProvider provider, String authorizationCode);

    LoginResponse login(OAuthProvider provider, String code);

    void logout(Long userId);

    TokenRefreshResponse refresh(String refreshTokenValue);
}
