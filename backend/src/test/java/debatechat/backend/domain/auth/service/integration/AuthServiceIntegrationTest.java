package debatechat.backend.domain.auth.service.integration;

import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.domain.auth.port.inbound.AuthUsecase;
import debatechat.backend.domain.auth.port.outbound.OAuthClient;
import debatechat.backend.domain.auth.service.implement.OAuthClientFactory;
import debatechat.backend.domain.auth.entity.OAuthUserInfo;
import debatechat.backend.domain.auth.port.outbound.RefreshTokenRepository;
import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.User;
import debatechat.backend.domain.user.entity.UserRole;
import debatechat.backend.domain.user.port.outbound.UserRepository;
import debatechat.backend.ServiceIntegrationTest;
import debatechat.backend.presentation.auth.dto.LoginResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

class AuthServiceIntegrationTest extends ServiceIntegrationTest {
    private static final String AUTHORIZATION_CODE = "valid-authorization-code";
    private static final String GOOGLE_OAUTH_ID = "google-oauth-id-123";

    @Autowired AuthUsecase authService;
    @Autowired UserRepository userRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;

    @MockitoBean private OAuthClientFactory oAuthClientFactory;

    private OAuthClient mockGoogleClient;

    @BeforeEach
    void setUp() {
        mockGoogleClient = mock(OAuthClient.class);
        given(oAuthClientFactory.getClient(OAuthProvider.GOOGLE)).willReturn(mockGoogleClient);
    }

    @Test
    void 회원가입_성공_시_DRAFT_유저가_저장되고_토큰이_발급된다() {
        given(mockGoogleClient.getUserInfo(AUTHORIZATION_CODE))
            .willReturn(new OAuthUserInfo(GOOGLE_OAUTH_ID));

        LoginResponse response = authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);

        flushAndClearContext();

        User saved = userRepository.findByProviderAndOauthId(OAuthProvider.GOOGLE, GOOGLE_OAUTH_ID).get();
        assertThat(saved.getRole()).isEqualTo(UserRole.DRAFT);
        assertThat(saved.getCreatedAt()).isNotNull();

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(refreshTokenRepository.findByToken(response.refreshToken())).isPresent();
    }

    @Test
    void 로그인_성공_시_리프레시토큰이_갱신된다() {
        given(mockGoogleClient.getUserInfo(AUTHORIZATION_CODE))
            .willReturn(new OAuthUserInfo(GOOGLE_OAUTH_ID));

        LoginResponse signupResponse = authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);

        flushAndClearContext();

        LoginResponse loginResponse = authService.login(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);

        flushAndClearContext();

        // 기존 토큰은 더 이상 유효하지 않음
        assertThat(refreshTokenRepository.findByToken(signupResponse.refreshToken())).isEmpty();

        // 새 토큰으로 갱신 확인
        assertThat(loginResponse.accessToken()).isNotBlank();
        assertThat(loginResponse.refreshToken()).isNotBlank();
        assertThat(refreshTokenRepository.findByToken(loginResponse.refreshToken())).isPresent();

        // 유저 정보 확인
        assertThat(loginResponse.user().role()).isEqualTo(UserRole.DRAFT.name());
    }

    @Test
    void 미가입_사용자로_로그인_시_USER_NOT_FOUND_예외() {
        given(mockGoogleClient.getUserInfo(AUTHORIZATION_CODE))
            .willReturn(new OAuthUserInfo(GOOGLE_OAUTH_ID));

        assertThatThrownBy(() -> authService.login(OAuthProvider.GOOGLE, AUTHORIZATION_CODE))
            .isInstanceOf(BusinessException.class)
            .extracting(e -> ((BusinessException) e).getErrorCode())
            .isEqualTo(ErrorCode.USER_NOT_FOUND);
    }

    @Test
    void 이미_가입된_OAuth_계정으로_재가입_시_DUPLICATE_OAUTH_ACCOUNT_예외() {
        given(mockGoogleClient.getUserInfo(AUTHORIZATION_CODE))
            .willReturn(new OAuthUserInfo(GOOGLE_OAUTH_ID));

        authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);

        flushAndClearContext();

        assertThatThrownBy(() -> authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE))
            .isInstanceOf(BusinessException.class)
            .extracting(e -> ((BusinessException) e).getErrorCode())
            .isEqualTo(ErrorCode.DUPLICATE_OAUTH_ACCOUNT);
    }
}
