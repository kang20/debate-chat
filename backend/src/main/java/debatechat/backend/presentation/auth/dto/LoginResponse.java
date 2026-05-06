package debatechat.backend.presentation.auth.dto;

public record LoginResponse(
    String accessToken,
    String refreshToken,
    UserResponse user
) {}
