package debatechat.backend.domain.auth.service.integration;

import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.domain.auth.port.inbound.AuthUsecase;
import debatechat.backend.domain.auth.port.outbound.OAuthClient;
import debatechat.backend.domain.auth.service.implement.OAuthClientFactory;
import debatechat.backend.domain.auth.entity.OAuthUserInfo;
import debatechat.backend.domain.auth.entity.RefreshToken;
import debatechat.backend.domain.auth.port.outbound.RefreshTokenRepository;
import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.User;
import debatechat.backend.domain.user.entity.UserRole;
import debatechat.backend.domain.user.port.outbound.UserRepository;
import debatechat.backend.base.fixture.RefreshTokenFixture;
import debatechat.backend.base.fixture.UserFixture;
import debatechat.backend.base.ServiceIntegrationTest;
import debatechat.backend.presentation.auth.dto.LoginResponse;
import debatechat.backend.presentation.auth.dto.TokenRefreshResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
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
    @Autowired UserFixture userFixture;
    @Autowired RefreshTokenFixture refreshTokenFixture;

    @MockitoBean private OAuthClientFactory oAuthClientFactory;

    private OAuthClient mockGoogleClient;

    @BeforeEach
    void setUp() {
        mockGoogleClient = mock(OAuthClient.class);
        given(oAuthClientFactory.getClient(OAuthProvider.GOOGLE)).willReturn(mockGoogleClient);
        given(mockGoogleClient.getUserInfo(AUTHORIZATION_CODE))
            .willReturn(new OAuthUserInfo(GOOGLE_OAUTH_ID));
    }

    @Nested
    class 회원가입 {
        @Test
        void 성공_시_DRAFT_유저가_저장되고_토큰이_발급된다() {
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
        void 이미_가입된_OAuth_계정으로_재가입_시_DUPLICATE_OAUTH_ACCOUNT_예외() {
            authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);
            flushAndClearContext();

            assertThatThrownBy(() -> authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.DUPLICATE_OAUTH_ACCOUNT);
        }
    }

    @Nested
    class 로그인 {
        @Test
        void 성공_시_기존_리프레시토큰이_갱신된다() {
            LoginResponse signupResponse = authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);
            flushAndClearContext();

            LoginResponse loginResponse = authService.login(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);
            flushAndClearContext();

            assertThat(refreshTokenRepository.findByToken(signupResponse.refreshToken())).isEmpty();
            assertThat(loginResponse.accessToken()).isNotBlank();
            assertThat(loginResponse.refreshToken()).isNotBlank();
            assertThat(refreshTokenRepository.findByToken(loginResponse.refreshToken())).isPresent();
            assertThat(loginResponse.user().role()).isEqualTo(UserRole.DRAFT.name());
        }

        @Test
        void 리프레시토큰_없이_로그인_시_새로_생성된다() {
            userFixture.createDraft(OAuthProvider.GOOGLE, GOOGLE_OAUTH_ID);

            LoginResponse response = authService.login(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);
            flushAndClearContext();

            assertThat(response.accessToken()).isNotBlank();
            assertThat(response.refreshToken()).isNotBlank();
            assertThat(refreshTokenRepository.findByToken(response.refreshToken())).isPresent();
        }

        @Test
        void 미가입_사용자_시_USER_NOT_FOUND_예외() {
            assertThatThrownBy(() -> authService.login(OAuthProvider.GOOGLE, AUTHORIZATION_CODE))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }
    }

    @Nested
    class 로그아웃 {
        @Test
        void 성공_시_리프레시토큰이_삭제된다() {
            LoginResponse signupResponse = authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);
            flushAndClearContext();

            User user = userRepository.findByProviderAndOauthId(OAuthProvider.GOOGLE, GOOGLE_OAUTH_ID).get();
            authService.logout(user.getId());
            flushAndClearContext();

            assertThat(refreshTokenRepository.findByToken(signupResponse.refreshToken())).isEmpty();
            assertThat(refreshTokenRepository.findByUserId(user.getId())).isEmpty();
        }

        @Test
        void 존재하지_않는_유저_시_USER_NOT_FOUND_예외() {
            assertThatThrownBy(() -> authService.logout(999L))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }
    }

    @Nested
    class 토큰_갱신 {
        @Test
        void 성공_시_새_토큰이_발급되고_기존_토큰은_무효화된다() {
            LoginResponse signupResponse = authService.signup(OAuthProvider.GOOGLE, AUTHORIZATION_CODE);
            flushAndClearContext();

            TokenRefreshResponse refreshResponse = authService.refresh(signupResponse.refreshToken());
            flushAndClearContext();

            assertThat(refreshResponse.accessToken()).isNotBlank();
            assertThat(refreshResponse.refreshToken()).isNotBlank();
            assertThat(refreshResponse.refreshToken()).isNotEqualTo(signupResponse.refreshToken());
            assertThat(refreshTokenRepository.findByToken(signupResponse.refreshToken())).isEmpty();
            assertThat(refreshTokenRepository.findByToken(refreshResponse.refreshToken())).isPresent();
        }

        @Test
        void 존재하지_않는_토큰_시_INVALID_TOKEN_예외() {
            assertThatThrownBy(() -> authService.refresh("non-existent-token"))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.INVALID_TOKEN);
        }

        @Test
        void 만료된_토큰_시_삭제_후_INVALID_TOKEN_예외() {
            User user = userFixture.createDraft(OAuthProvider.GOOGLE, GOOGLE_OAUTH_ID);
            RefreshToken expired = refreshTokenFixture.createExpired(user);

            assertThatThrownBy(() -> authService.refresh(expired.getToken()))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.INVALID_TOKEN);

            assertThat(refreshTokenRepository.findByToken(expired.getToken())).isEmpty();
        }

        @Test
        void 유효한_토큰이지만_유저가_삭제된_경우_USER_NOT_FOUND_예외() {
            User user = userFixture.createDraft(OAuthProvider.GOOGLE, GOOGLE_OAUTH_ID);
            RefreshToken token = refreshTokenFixture.create(user);
            userRepository.deleteById(user.getId());
            flushAndClearContext();

            assertThatThrownBy(() -> authService.refresh(token.getToken()))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }
    }
}
