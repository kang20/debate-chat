package debatechat.backend.presentation.auth.dto;

import debatechat.backend.domain.user.entity.User;

import java.time.LocalDateTime;

public record UserResponse(
    String id,
    String provider,
    String nickname,
    String role,
    String debateGrade,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            String.valueOf(user.getId()),
            user.getProvider().name(),
            user.getNickname(),
            user.getRole().name(),
            user.getDebateGrade().name(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
