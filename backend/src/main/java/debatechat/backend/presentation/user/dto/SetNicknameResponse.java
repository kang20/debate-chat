package debatechat.backend.presentation.user.dto;

public record SetNicknameResponse(
    String accessToken,
    UserResponse user
) {}
