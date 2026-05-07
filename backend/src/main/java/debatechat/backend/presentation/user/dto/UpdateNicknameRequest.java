package debatechat.backend.presentation.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateNicknameRequest(
    @NotBlank(message = "닉네임은 필수입니다.")
    @Pattern(
        regexp = "^[가-힣a-zA-Z0-9]{2,20}$",
        message = "닉네임은 2~20자의 한글, 영문, 숫자 조합이어야 합니다."
    )
    String nickname
) {}
