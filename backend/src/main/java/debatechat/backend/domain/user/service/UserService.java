package debatechat.backend.domain.user.service;

import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.common.transaction.TransactionalCommandExecutor;
import debatechat.backend.domain.auth.service.implement.JwtHandler;
import debatechat.backend.domain.user.entity.User;
import debatechat.backend.domain.user.entity.UserRole;
import debatechat.backend.domain.user.port.inbound.UserUsecase;
import debatechat.backend.domain.user.port.outbound.UserRepository;
import debatechat.backend.presentation.user.dto.PublicUserResponse;
import debatechat.backend.presentation.user.dto.SetNicknameResponse;
import debatechat.backend.presentation.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService implements UserUsecase {
    private final UserRepository userRepository;
    private final JwtHandler jwtHandler;
    private final TransactionalCommandExecutor txExecutor;

    @Override
    public SetNicknameResponse setNickname(Long userId, String nickname) {
        User user = txExecutor.executeOrTranslate(
            () -> activateAndChangeNickname(userId, nickname),
            DataIntegrityViolationException.class,
            ErrorCode.DUPLICATE_NICKNAME
        );

        String accessToken = jwtHandler.createAccessToken(user.getId(), user.getRole());
        return new SetNicknameResponse(accessToken, UserResponse.from(user));
    }

    private User activateAndChangeNickname(Long userId, String nickname) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() != UserRole.DRAFT) {
            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_SET);
        }

        user.activateWithNickname(nickname);
        return user;
    }

    @Override
    public UserResponse updateNickname(Long userId, String nickname) {
        User user = txExecutor.executeOrTranslate(
            () -> changeNickname(userId, nickname),
            DataIntegrityViolationException.class,
            ErrorCode.DUPLICATE_NICKNAME
        );

        return UserResponse.from(user);
    }

    private User changeNickname(Long userId, String nickname) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() == UserRole.DRAFT) {
            throw new BusinessException(ErrorCode.NICKNAME_NOT_SET);
        }

        if (nickname.equals(user.getNickname())) {
            throw new BusinessException(ErrorCode.SAME_NICKNAME);
        }

        user.updateNickname(nickname);
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return UserResponse.from(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserResponse getPublicProfile(Long userId) {
        return userRepository.findById(userId)
            .filter(u -> u.getRole() != UserRole.DRAFT)
            .map(PublicUserResponse::from)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_ACCESSIBLE));
    }
}
