package debatechat.backend.domain.user.service.integration;

import debatechat.backend.base.ServiceIntegrationTest;
import debatechat.backend.base.fixture.UserFixture;
import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.User;
import debatechat.backend.domain.user.entity.UserRole;
import debatechat.backend.domain.user.port.inbound.UserUsecase;
import debatechat.backend.domain.user.port.outbound.UserRepository;
import debatechat.backend.presentation.user.dto.PublicUserResponse;
import debatechat.backend.presentation.user.dto.SetNicknameResponse;
import debatechat.backend.presentation.user.dto.UserResponse;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserServiceIntegrationTest extends ServiceIntegrationTest {

    private static final OAuthProvider PROVIDER = OAuthProvider.GOOGLE;
    private static final String OAUTH_ID = "google-oauth-id-user";
    private static final String NICKNAME = "토론왕";

    @Autowired UserUsecase userUsecase;
    @Autowired UserRepository userRepository;
    @Autowired UserFixture userFixture;

    @Nested
    class 닉네임_설정 {

        @Test
        void 성공_시_DRAFT가_USER로_전환되고_accessToken이_반환된다() {
            User draft = userFixture.createDraft(PROVIDER, OAUTH_ID);

            SetNicknameResponse response = userUsecase.setNickname(draft.getId(), NICKNAME);
            flushAndClearContext();


            // then
            User saved = userRepository.findById(draft.getId()).get();

            assertThat(saved.getRole()).isEqualTo(UserRole.USER);
            assertThat(saved.getNickname()).isEqualTo(NICKNAME);
            assertThat(response.accessToken()).isNotBlank();
            assertThat(response.user().role()).isEqualTo(UserRole.USER.name());
            assertThat(response.user().nickname()).isEqualTo(NICKNAME);
        }

        @Test
        void 이미_USER인_경우_NICKNAME_ALREADY_SET_예외() {
            User user = userFixture.createUser(PROVIDER, OAUTH_ID, NICKNAME);

            assertThatThrownBy(() -> userUsecase.setNickname(user.getId(), "다른닉네임"))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.NICKNAME_ALREADY_SET);
        }

        @Test
        void 닉네임_중복_시_DUPLICATE_NICKNAME_예외() {
            userFixture.createUser(PROVIDER, OAUTH_ID, NICKNAME);
            User draft = userFixture.createDraft(PROVIDER, "other-oauth-id");

            assertThatThrownBy(() -> userUsecase.setNickname(draft.getId(), NICKNAME))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.DUPLICATE_NICKNAME);
        }

        @Test
        void 존재하지_않는_userId_시_USER_NOT_FOUND_예외() {
            assertThatThrownBy(() -> userUsecase.setNickname(999L, NICKNAME))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }
    }

    @Nested
    class 내_프로필_조회 {
        @Test
        void 성공_시_UserResponse_반환() {
            User user = userFixture.createUser(PROVIDER, OAUTH_ID, NICKNAME);

            UserResponse response = userUsecase.getMyProfile(user.getId());

            assertThat(response.id()).isEqualTo(String.valueOf(user.getId()));
            assertThat(response.nickname()).isEqualTo(NICKNAME);
            assertThat(response.role()).isEqualTo(UserRole.USER.name());
        }

        @Test
        void DRAFT_사용자도_조회_가능() {
            User draft = userFixture.createDraft(PROVIDER, OAUTH_ID);

            UserResponse response = userUsecase.getMyProfile(draft.getId());

            assertThat(response.role()).isEqualTo(UserRole.DRAFT.name());
            assertThat(response.nickname()).isNull();
        }

        @Test
        void 존재하지_않는_userId_시_USER_NOT_FOUND_예외() {
            assertThatThrownBy(() -> userUsecase.getMyProfile(999L))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }
    }

    @Nested
    class 닉네임_수정 {

        @Test
        void 성공_시_닉네임이_변경된다() {
            User user = userFixture.createUser(PROVIDER, OAUTH_ID, NICKNAME);
            String newNickname = "새닉네임";

            UserResponse response = userUsecase.updateNickname(user.getId(), newNickname);
            flushAndClearContext();

            User saved = userRepository.findById(user.getId()).get();
            assertThat(saved.getNickname()).isEqualTo(newNickname);
            assertThat(response.nickname()).isEqualTo(newNickname);
        }

        @Test
        void DRAFT_사용자_시_NICKNAME_NOT_SET_예외() {
            User draft = userFixture.createDraft(PROVIDER, OAUTH_ID);

            assertThatThrownBy(() -> userUsecase.updateNickname(draft.getId(), "새닉네임"))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.NICKNAME_NOT_SET);
        }

        @Test
        void 현재_닉네임과_동일_시_SAME_NICKNAME_예외() {
            User user = userFixture.createUser(PROVIDER, OAUTH_ID, NICKNAME);

            assertThatThrownBy(() -> userUsecase.updateNickname(user.getId(), NICKNAME))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.SAME_NICKNAME);
        }

        @Test
        void 다른_사용자_닉네임과_중복_시_DUPLICATE_NICKNAME_예외() {
            userFixture.createUser(PROVIDER, OAUTH_ID, NICKNAME);
            User other = userFixture.createUser(PROVIDER, "other-oauth-id", "다른닉네임");

            assertThatThrownBy(() -> userUsecase.updateNickname(other.getId(), NICKNAME))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.DUPLICATE_NICKNAME);
        }

        @Test
        void 존재하지_않는_userId_시_USER_NOT_FOUND_예외() {
            assertThatThrownBy(() -> userUsecase.updateNickname(999L, "새닉네임"))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }
    }

    @Nested
    class 공개_프로필_조회 {

        @Test
        void 성공_시_PublicUserResponse_반환() {
            User user = userFixture.createUser(PROVIDER, OAUTH_ID, NICKNAME);

            PublicUserResponse response = userUsecase.getPublicProfile(user.getId());

            assertThat(response.id()).isEqualTo(String.valueOf(user.getId()));
            assertThat(response.nickname()).isEqualTo(NICKNAME);
        }

        @Test
        void DRAFT_사용자_조회_시_USER_NOT_ACCESSIBLE_예외() {
            User draft = userFixture.createDraft(PROVIDER, OAUTH_ID);

            assertThatThrownBy(() -> userUsecase.getPublicProfile(draft.getId()))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_ACCESSIBLE);
        }

        @Test
        void 존재하지_않는_userId_시_USER_NOT_ACCESSIBLE_예외() {
            assertThatThrownBy(() -> userUsecase.getPublicProfile(999L))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_ACCESSIBLE);
        }
    }
}
