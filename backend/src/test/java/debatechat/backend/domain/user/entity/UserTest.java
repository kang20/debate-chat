package debatechat.backend.domain.user.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {
    @Test
    void createDraft_정상_생성() {
        User user = User.createDraft(OAuthProvider.GOOGLE, "oauth-123");

        assertThat(user.getProvider()).isEqualTo(OAuthProvider.GOOGLE);
        assertThat(user.getOauthId()).isEqualTo("oauth-123");
        assertThat(user.getRole()).isEqualTo(UserRole.DRAFT);
        assertThat(user.getDebateGrade()).isEqualTo(DebateGrade.BRONZE);
    }

    @Test
    void createDraft_닉네임은_null이다() {
        User user = User.createDraft(OAuthProvider.KAKAO, "kakao-456");

        assertThat(user.getNickname()).isNull();
    }

    @Test
    void createDraft_id는_null이다() {
        User user = User.createDraft(OAuthProvider.GOOGLE, "oauth-789");

        assertThat(user.getId()).isNull();
    }

    @Test
    void onCreate_호출_시_createdAt과_updatedAt이_설정된다() {
        User user = User.createDraft(OAuthProvider.GOOGLE, "oauth-123");

        user.onCreate();

        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
        assertThat(user.getCreatedAt()).isEqualTo(user.getUpdatedAt());
    }

    @Test
    void onUpdate_호출_시_updatedAt만_갱신된다() {
        User user = User.createDraft(OAuthProvider.GOOGLE, "oauth-123");
        user.onCreate();

        var originalCreatedAt = user.getCreatedAt();

        user.onUpdate();

        assertThat(user.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(user.getUpdatedAt()).isAfterOrEqualTo(originalCreatedAt);
    }
}
