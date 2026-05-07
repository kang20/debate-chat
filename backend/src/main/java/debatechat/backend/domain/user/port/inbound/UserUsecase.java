package debatechat.backend.domain.user.port.inbound;

import debatechat.backend.presentation.user.dto.PublicUserResponse;
import debatechat.backend.presentation.user.dto.SetNicknameResponse;
import debatechat.backend.presentation.user.dto.UserResponse;

public interface UserUsecase {

    SetNicknameResponse setNickname(Long userId, String nickname);

    UserResponse getMyProfile(Long userId);

    UserResponse updateNickname(Long userId, String nickname);

    PublicUserResponse getPublicProfile(Long userId);
}
