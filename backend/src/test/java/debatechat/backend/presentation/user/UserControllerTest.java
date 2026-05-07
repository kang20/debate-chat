package debatechat.backend.presentation.user;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import debatechat.backend.base.ControllerTest;
import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.common.security.JwtAuthenticationToken;
import debatechat.backend.domain.user.entity.DebateGrade;
import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.UserRole;
import debatechat.backend.domain.user.port.inbound.UserUsecase;
import debatechat.backend.presentation.user.controller.UserController;
import debatechat.backend.presentation.user.dto.PublicUserResponse;
import debatechat.backend.presentation.user.dto.SetNicknameRequest;
import debatechat.backend.presentation.user.dto.SetNicknameResponse;
import debatechat.backend.presentation.user.dto.UpdateNicknameRequest;
import debatechat.backend.presentation.user.dto.UserResponse;

@WebMvcTest(UserController.class)
class UserControllerTest extends ControllerTest {

    private static final String NICKNAME = "토론왕";
    private static final String ACCESS_TOKEN = "test-access-token";
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 5, 7, 12, 0);

    @MockitoBean private UserUsecase userUsecase;

    private static final UserResponse USER_RESPONSE = new UserResponse(
        "1", OAuthProvider.GOOGLE.name(), NICKNAME, UserRole.USER.name(), DebateGrade.BRONZE.name(), NOW, NOW
    );

    private static final JwtAuthenticationToken DRAFT_AUTH = new JwtAuthenticationToken(1L, UserRole.DRAFT.name());
    private static final JwtAuthenticationToken USER_AUTH = new JwtAuthenticationToken(1L, UserRole.USER.name());

    @Nested
    class 닉네임_설정_API {

        @Test
        void 정상_요청_시_200_반환() throws Exception {
            SetNicknameResponse response = new SetNicknameResponse(ACCESS_TOKEN, USER_RESPONSE);
            given(userUsecase.setNickname(anyLong(), anyString())).willReturn(response);

            mockMvc.perform(post("/api/users/me/nickname")
                    .with(authentication(DRAFT_AUTH))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new SetNicknameRequest(NICKNAME))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(ACCESS_TOKEN))
                .andExpect(jsonPath("$.user.nickname").value(NICKNAME))
                .andExpect(jsonPath("$.user.role").value(UserRole.USER.name()));
        }

        @Test
        void 미인증_시_401_반환() throws Exception {
            mockMvc.perform(post("/api/users/me/nickname")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new SetNicknameRequest(NICKNAME))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.AUTHENTICATION_REQUIRED.getCode()));
        }

        @Test
        void 닉네임_형식_위반_시_400_반환() throws Exception {
            mockMvc.perform(post("/api/users/me/nickname")
                    .with(authentication(DRAFT_AUTH))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new SetNicknameRequest("a"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_INPUT.getCode()));
        }

        @Test
        void 닉네임_중복_시_409_반환() throws Exception {
            given(userUsecase.setNickname(anyLong(), anyString()))
                .willThrow(new BusinessException(ErrorCode.DUPLICATE_NICKNAME));

            mockMvc.perform(post("/api/users/me/nickname")
                    .with(authentication(DRAFT_AUTH))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new SetNicknameRequest(NICKNAME))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(ErrorCode.DUPLICATE_NICKNAME.getCode()));
        }
    }

    @Nested
    class 내_프로필_조회_API {

        @Test
        void 정상_요청_시_200_반환() throws Exception {
            given(userUsecase.getMyProfile(anyLong())).willReturn(USER_RESPONSE);

            mockMvc.perform(get("/api/users/me")
                    .with(authentication(USER_AUTH)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value(NICKNAME))
                .andExpect(jsonPath("$.provider").value(OAuthProvider.GOOGLE.name()));
        }

        @Test
        void 미인증_시_401_반환() throws Exception {
            mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.AUTHENTICATION_REQUIRED.getCode()));
        }
    }

    @Nested
    class 닉네임_수정_API {
        @Test
        void 정상_요청_시_200_반환() throws Exception {
            UserResponse updated = new UserResponse(
                "1", OAuthProvider.GOOGLE.name(), "새닉네임", UserRole.USER.name(), DebateGrade.BRONZE.name(), NOW, NOW
            );
            given(userUsecase.updateNickname(anyLong(), anyString())).willReturn(updated);

            mockMvc.perform(patch("/api/users/me/nickname")
                    .with(authentication(USER_AUTH))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new UpdateNicknameRequest("새닉네임"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("새닉네임"));
        }

        @Test
        void 미인증_시_401_반환() throws Exception {
            mockMvc.perform(patch("/api/users/me/nickname")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new UpdateNicknameRequest("새닉네임"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.AUTHENTICATION_REQUIRED.getCode()));
        }

        @Test
        void 닉네임_형식_위반_시_400_반환() throws Exception {
            mockMvc.perform(patch("/api/users/me/nickname")
                    .with(authentication(USER_AUTH))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new UpdateNicknameRequest("!invalid!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_INPUT.getCode()));
        }
    }

    @Nested
    class 공개_프로필_조회_API {
        @Test
        void 정상_요청_시_200_반환() throws Exception {
            PublicUserResponse publicResponse = new PublicUserResponse(
                "1", NICKNAME, DebateGrade.BRONZE.name(), NOW
            );
            given(userUsecase.getPublicProfile(anyLong())).willReturn(publicResponse);

            mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value(NICKNAME))
                .andExpect(jsonPath("$.debateGrade").value(DebateGrade.BRONZE.name()));
        }

        @Test
        void 존재하지_않는_사용자_시_404_반환() throws Exception {
            given(userUsecase.getPublicProfile(anyLong()))
                .willThrow(new BusinessException(ErrorCode.USER_NOT_ACCESSIBLE));

            mockMvc.perform(get("/api/users/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_ACCESSIBLE.getCode()));
        }
    }
}
