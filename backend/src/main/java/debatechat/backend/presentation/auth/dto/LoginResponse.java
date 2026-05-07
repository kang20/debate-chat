package debatechat.backend.presentation.auth.dto;

import debatechat.backend.presentation.user.dto.UserResponse;

public record LoginResponse(
    String accessToken,
    String refreshToken,
    UserResponse user
) {}
