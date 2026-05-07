package debatechat.backend.presentation.user.dto;

import debatechat.backend.domain.user.entity.User;

import java.time.LocalDateTime;

public record PublicUserResponse(
    String id,
    String nickname,
    String debateGrade,
    LocalDateTime createdAt
) {
    public static PublicUserResponse from(User user) {
        return new PublicUserResponse(
            String.valueOf(user.getId()),
            user.getNickname(),
            user.getDebateGrade().name(),
            user.getCreatedAt()
        );
    }
}
