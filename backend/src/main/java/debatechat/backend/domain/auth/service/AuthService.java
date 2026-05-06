package debatechat.backend.domain.auth.service;

import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.domain.auth.entity.OAuthUserInfo;
import debatechat.backend.domain.auth.entity.RefreshToken;
import debatechat.backend.domain.auth.port.inbound.AuthUsecase;
import debatechat.backend.domain.auth.port.outbound.OAuthClient;
import debatechat.backend.domain.auth.port.outbound.RefreshTokenRepository;
import debatechat.backend.domain.auth.service.implement.OAuthClientFactory;
import debatechat.backend.domain.auth.service.implement.RefreshTokenWriter;
import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.User;
import debatechat.backend.domain.user.port.outbound.UserRepository;
import debatechat.backend.presentation.auth.dto.LoginResponse;
import debatechat.backend.presentation.auth.dto.TokenRefreshResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService implements AuthUsecase {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OAuthClientFactory oAuthClientFactory;
    private final RefreshTokenWriter refreshTokenWriter;

    @Override
    public LoginResponse signup(OAuthProvider provider, String authorizationCode) {
        OAuthClient client = oAuthClientFactory.getClient(provider);
        OAuthUserInfo userInfo = client.getUserInfo(authorizationCode);

        if (userRepository.existsByProviderAndOauthId(provider, userInfo.oauthId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_OAUTH_ACCOUNT);
        }

        User user = User.createDraft(provider, userInfo.oauthId());
        userRepository.save(user);

        return refreshTokenWriter.create(user);
    }

    @Override
    public LoginResponse login(OAuthProvider provider, String code) {
        OAuthClient client = oAuthClientFactory.getClient(provider);
        OAuthUserInfo userInfo = client.getUserInfo(code);

        User user = userRepository.findByProviderAndOauthId(provider, userInfo.oauthId())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return refreshTokenWriter.rotate(user);
    }

    @Override
    public void logout(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        refreshTokenWriter.deleteByUserId(userId);
    }

    @Override
    public TokenRefreshResponse refresh(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        User user = userRepository.findById(refreshToken.getUserId())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return refreshTokenWriter.refresh(refreshToken, user);
    }
}
