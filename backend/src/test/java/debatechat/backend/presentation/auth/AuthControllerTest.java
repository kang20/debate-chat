package debatechat.backend.presentation.auth;

import tools.jackson.databind.ObjectMapper;
import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.common.security.JwtAuthenticationFilter;
import debatechat.backend.common.security.JwtAuthenticationToken;
import debatechat.backend.config.SecurityConfig;
import debatechat.backend.domain.auth.entity.JwtProperties;
import debatechat.backend.domain.auth.port.inbound.AuthUsecase;
import debatechat.backend.domain.auth.service.implement.JwtHandler;
import debatechat.backend.domain.user.entity.DebateGrade;
import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.UserRole;
import debatechat.backend.infra.api.oauth.OAuthProperties;
import debatechat.backend.presentation.auth.controller.AuthController;
import debatechat.backend.presentation.auth.dto.LoginRequest;
import debatechat.backend.presentation.auth.dto.LoginResponse;
import debatechat.backend.presentation.auth.dto.SignupRequest;
import debatechat.backend.presentation.auth.dto.TokenRefreshRequest;
import debatechat.backend.presentation.auth.dto.TokenRefreshResponse;
import debatechat.backend.presentation.auth.dto.UserResponse;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    private static final String AUTHORIZATION_CODE = "valid-authorization-code";
    private static final String ACCESS_TOKEN = "test-access-token";
    private static final String REFRESH_TOKEN = "test-refresh-token";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthUsecase authService;
    @MockitoBean private JwtHandler jwtHandler;
    @MockitoBean private JwtProperties jwtProperties;
    @MockitoBean private OAuthProperties oAuthProperties;

    private static final UserResponse DRAFT_USER = new UserResponse(
        "1", OAuthProvider.GOOGLE.name(), null, UserRole.DRAFT.name(), DebateGrade.BRONZE.name(),
        LocalDateTime.of(2026, 5, 4, 12, 0), LocalDateTime.of(2026, 5, 4, 12, 0)
    );

    @Nested
    class 회원가입_API {
        @Test
        void 정상_가입_시_201_반환() throws Exception {
            LoginResponse loginResponse = new LoginResponse(ACCESS_TOKEN, REFRESH_TOKEN, DRAFT_USER);
            given(authService.signup(any(), anyString())).willReturn(loginResponse);

            mockMvc.perform(post("/api/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                        new SignupRequest(OAuthProvider.GOOGLE, AUTHORIZATION_CODE))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value(ACCESS_TOKEN))
                .andExpect(jsonPath("$.user.role").value(UserRole.DRAFT.name()));
        }

        @Test
        void code_누락_시_400_반환() throws Exception {
            mockMvc.perform(post("/api/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                        new SignupRequest(OAuthProvider.GOOGLE, ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_INPUT.getCode()));
        }

        @Test
        void 잘못된_provider_시_400_반환() throws Exception {
            // OAuthProvider enum에 없는 값은 DTO로 표현 불가 → raw JSON 유지
            mockMvc.perform(post("/api/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {"provider": "FACEBOOK", "code": "valid-code"}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_INPUT.getCode()));
        }

        @Test
        void OAuth_계정_중복_시_409_반환() throws Exception {
            given(authService.signup(any(), anyString()))
                .willThrow(new BusinessException(ErrorCode.DUPLICATE_OAUTH_ACCOUNT));

            mockMvc.perform(post("/api/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                        new SignupRequest(OAuthProvider.GOOGLE, AUTHORIZATION_CODE))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(ErrorCode.DUPLICATE_OAUTH_ACCOUNT.getCode()));
        }
    }

    @Nested
    class 로그인_API {

        @Test
        void 정상_로그인_시_200_반환() throws Exception {
            LoginResponse loginResponse = new LoginResponse(ACCESS_TOKEN, REFRESH_TOKEN, DRAFT_USER);
            given(authService.login(any(), anyString())).willReturn(loginResponse);

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                        new LoginRequest(OAuthProvider.GOOGLE, AUTHORIZATION_CODE))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(ACCESS_TOKEN));
        }

        @Test
        void 미가입_사용자_시_401_반환() throws Exception {
            given(authService.login(any(), anyString()))
                .willThrow(new BusinessException(ErrorCode.USER_NOT_FOUND));

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                        new LoginRequest(OAuthProvider.GOOGLE, AUTHORIZATION_CODE))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_FOUND.getCode()));
        }
    }

    @Nested
    class 로그아웃_API {

        @Test
        void 인증된_사용자_로그아웃_시_204_반환() throws Exception {
            mockMvc.perform(post("/api/auth/logout")
                    .with(authentication(new JwtAuthenticationToken(1L, UserRole.USER.name()))))
                .andExpect(status().isNoContent());
        }

        @Test
        void 인증_없이_로그아웃_시_401_반환() throws Exception {
            mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.AUTHENTICATION_REQUIRED.getCode()));
        }
    }

    @Nested
    class 토큰_갱신_API {

        @Test
        void 정상_갱신_시_200_반환() throws Exception {
            given(authService.refresh(anyString()))
                .willReturn(new TokenRefreshResponse(ACCESS_TOKEN, REFRESH_TOKEN));

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                        new TokenRefreshRequest(REFRESH_TOKEN))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(ACCESS_TOKEN))
                .andExpect(jsonPath("$.refreshToken").value(REFRESH_TOKEN));
        }

        @Test
        void refreshToken_누락_시_400_반환() throws Exception {
            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                        new TokenRefreshRequest(""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_INPUT.getCode()));
        }

        @Test
        void 무효한_refreshToken_시_401_반환() throws Exception {
            given(authService.refresh(anyString()))
                .willThrow(new BusinessException(ErrorCode.INVALID_TOKEN));

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                        new TokenRefreshRequest("invalid-token"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_TOKEN.getCode()));
        }
    }
}
