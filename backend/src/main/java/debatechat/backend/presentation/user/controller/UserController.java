package debatechat.backend.presentation.user.controller;

import debatechat.backend.common.security.AuthUser;
import debatechat.backend.common.security.CurrentUser;
import debatechat.backend.domain.user.port.inbound.UserUsecase;
import debatechat.backend.presentation.user.dto.PublicUserResponse;
import debatechat.backend.presentation.user.dto.SetNicknameRequest;
import debatechat.backend.presentation.user.dto.SetNicknameResponse;
import debatechat.backend.presentation.user.dto.UpdateNicknameRequest;
import debatechat.backend.presentation.user.dto.UserResponse;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserUsecase userUsecase;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/me/nickname")
    public ResponseEntity<SetNicknameResponse> setNickname(
            @CurrentUser AuthUser user,
            @Valid @RequestBody SetNicknameRequest request) {
        return ResponseEntity.ok(userUsecase.setNickname(user.id(), request.nickname()));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(@CurrentUser AuthUser user) {
        return ResponseEntity.ok(userUsecase.getMyProfile(user.id()));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/me/nickname")
    public ResponseEntity<UserResponse> updateNickname(
            @CurrentUser AuthUser user,
            @Valid @RequestBody UpdateNicknameRequest request) {
        return ResponseEntity.ok(userUsecase.updateNickname(user.id(), request.nickname()));
    }

    @PermitAll
    @GetMapping("/{userId}")
    public ResponseEntity<PublicUserResponse> getPublicProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userUsecase.getPublicProfile(userId));
    }
}
