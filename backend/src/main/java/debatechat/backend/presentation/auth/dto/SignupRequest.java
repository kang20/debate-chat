package debatechat.backend.presentation.auth.dto;

import debatechat.backend.domain.user.entity.OAuthProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SignupRequest(
    @NotNull(message = "provider는 필수입니다.")
    OAuthProvider provider,

    @NotBlank(message = "OAuth 인증 코드는 필수입니다.")
    String code
) {}
