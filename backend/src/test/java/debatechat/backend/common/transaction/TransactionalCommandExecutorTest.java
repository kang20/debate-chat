package debatechat.backend.common.transaction;

import debatechat.backend.base.ServiceIntegrationTest;
import debatechat.backend.base.fixture.UserFixture;
import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.domain.user.entity.OAuthProvider;
import debatechat.backend.domain.user.entity.User;
import debatechat.backend.domain.user.port.outbound.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TransactionalCommandExecutorTest extends ServiceIntegrationTest {

    private static final OAuthProvider PROVIDER = OAuthProvider.GOOGLE;
    private static final String OAUTH_ID = "google-oauth-id-executor-test";
    private static final String NICKNAME = "테스트닉";

    @Autowired private TransactionalCommandExecutor executor;
    @Autowired private UserRepository userRepository;
    @Autowired private UserFixture userFixture;

    @Nested
    class executeOrTranslate {

        @Test
        void 정상_케이스_action_실행_후_결과_반환() {
            User draft = userFixture.createDraft(PROVIDER, OAUTH_ID);

            User result = executor.executeOrTranslate(
                () -> {
                    User u = userRepository.findById(draft.getId()).get();
                    u.activateWithNickname(NICKNAME);
                    return u;
                },
                DataIntegrityViolationException.class,
                ErrorCode.DUPLICATE_NICKNAME
            );

            assertThat(result.getId()).isEqualTo(draft.getId());
            assertThat(result.getNickname()).isEqualTo(NICKNAME);

            flushAndClearContext();
            User saved = userRepository.findById(draft.getId()).get();
            assertThat(saved.getNickname()).isEqualTo(NICKNAME);
        }

        @Test
        void 지정한_예외_타입_발생_시_ErrorCode로_변환() {
            User user1 = userFixture.createUser(PROVIDER, OAUTH_ID, NICKNAME);
            User draft = userFixture.createDraft(PROVIDER, "other-oauth-id");

            assertThatThrownBy(() ->
                executor.executeOrTranslate(
                    () -> {
                        User u = userRepository.findById(draft.getId()).get();
                        u.activateWithNickname(NICKNAME);  // flush 시 unique 제약 위반
                        return u;
                    },
                    DataIntegrityViolationException.class,
                    ErrorCode.DUPLICATE_NICKNAME
                )
            )
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.DUPLICATE_NICKNAME);
        }

        @Test
        void 지정하지_않은_예외_타입_발생_시_그대로_전파() {
            User draft = userFixture.createDraft(PROVIDER, OAUTH_ID);

            assertThatThrownBy(() ->
                executor.executeOrTranslate(
                    () -> {
                        throw new IllegalArgumentException("테스트 예외");
                    },
                    DataIntegrityViolationException.class,
                    ErrorCode.DUPLICATE_NICKNAME
                )
            )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("테스트 예외");
        }

        @Test
        void 비즈니스_예외_발생_시_감싸지_않고_그대로_전파() {
            assertThatThrownBy(() ->
                executor.executeOrTranslate(
                    () -> {
                        throw new BusinessException(ErrorCode.USER_NOT_FOUND);
                    },
                    DataIntegrityViolationException.class,
                    ErrorCode.DUPLICATE_NICKNAME
                )
            )
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
        }
    }
}
