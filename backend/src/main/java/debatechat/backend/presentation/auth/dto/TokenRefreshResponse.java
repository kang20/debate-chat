package debatechat.backend.presentation.auth.dto;

public record TokenRefreshResponse(
    String accessToken,
    String refreshToken
) {}
