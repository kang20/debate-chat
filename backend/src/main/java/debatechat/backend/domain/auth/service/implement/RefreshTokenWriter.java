package debatechat.backend.domain.auth.service.implement;

import debatechat.backend.common.annotation.Implement;
import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.domain.auth.entity.RefreshToken;
import debatechat.backend.domain.auth.port.outbound.RefreshTokenRepository;
import debatechat.backend.domain.user.entity.User;
import debatechat.backend.presentation.auth.dto.LoginResponse;
import debatechat.backend.presentation.auth.dto.TokenRefreshResponse;
import debatechat.backend.presentation.auth.dto.UserResponse;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Implement
@RequiredArgsConstructor
public class RefreshTokenWriter {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtHandler jwtHandler;

    public LoginResponse create(User user) {
        String accessToken = jwtHandler.createAccessToken(user.getId(), user.getRole());
        String refreshTokenValue = jwtHandler.createRefreshToken();

        RefreshToken refreshToken = RefreshToken.create(user.getId(), refreshTokenValue, calcExpiresAt());
        refreshTokenRepository.save(refreshToken);

        return new LoginResponse(accessToken, refreshTokenValue, UserResponse.from(user));
    }

    public LoginResponse rotate(User user) {
        RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId())
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        String accessToken = jwtHandler.createAccessToken(user.getId(), user.getRole());
        String refreshTokenValue = jwtHandler.createRefreshToken();
        refreshToken.rotate(refreshTokenValue, calcExpiresAt());

        return new LoginResponse(accessToken, refreshTokenValue, UserResponse.from(user));
    }

    public TokenRefreshResponse refresh(RefreshToken refreshToken, User user) {
        String newAccessToken = jwtHandler.createAccessToken(user.getId(), user.getRole());
        String newRefreshTokenValue = jwtHandler.createRefreshToken();
        refreshToken.rotate(newRefreshTokenValue, calcExpiresAt());

        return new TokenRefreshResponse(newAccessToken, newRefreshTokenValue);
    }

    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private LocalDateTime calcExpiresAt() {
        return LocalDateTime.now().plusSeconds(jwtHandler.getRefreshTokenExpirationMillis() / 1000);
    }
}
