package debatechat.backend.presentation.auth.controller;

import debatechat.backend.common.security.AuthUser;
import debatechat.backend.common.security.CurrentUser;
import debatechat.backend.domain.auth.port.inbound.AuthUsecase;
import debatechat.backend.presentation.auth.dto.LoginRequest;
import debatechat.backend.presentation.auth.dto.LoginResponse;
import debatechat.backend.presentation.auth.dto.SignupRequest;
import debatechat.backend.presentation.auth.dto.TokenRefreshRequest;
import debatechat.backend.presentation.auth.dto.TokenRefreshResponse;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthUsecase authService;

    @PermitAll
    @PostMapping("/signup")
    public ResponseEntity<LoginResponse> signup(@Valid @RequestBody SignupRequest request) {
        LoginResponse response = authService.signup(request.provider(), request.code());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PermitAll
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request.provider(), request.code());

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CurrentUser AuthUser user) {
        authService.logout(user.id());
        return ResponseEntity.noContent().build();
    }

    @PermitAll
    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = authService.refresh(request.refreshToken());

        return ResponseEntity.ok(response);
    }
}
