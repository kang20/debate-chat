package debatechat.backend.domain.auth.port;

import debatechat.backend.domain.auth.port.outbound.OAuthClient;
import debatechat.backend.domain.auth.service.implement.OAuthClientFactory;
import debatechat.backend.domain.user.entity.OAuthProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OAuthClientFactoryTest {

    private OAuthClientFactory factory;

    @BeforeEach
    void setUp() {
        OAuthClient googleClient = mock(OAuthClient.class);
        when(googleClient.provider()).thenReturn(OAuthProvider.GOOGLE);

        OAuthClient kakaoClient = mock(OAuthClient.class);
        when(kakaoClient.provider()).thenReturn(OAuthProvider.KAKAO);

        factory = new OAuthClientFactory(List.of(googleClient, kakaoClient));
    }

    @Test
    void GOOGLE_클라이언트를_정상_조회한다() {
        OAuthClient client = factory.getClient(OAuthProvider.GOOGLE);

        assertThat(client.provider()).isEqualTo(OAuthProvider.GOOGLE);
    }

    @Test
    void KAKAO_클라이언트를_정상_조회한다() {
        OAuthClient client = factory.getClient(OAuthProvider.KAKAO);

        assertThat(client.provider()).isEqualTo(OAuthProvider.KAKAO);
    }

    @Test
    void 지원하지_않는_provider는_예외를_던진다() {
        OAuthClientFactory emptyFactory = new OAuthClientFactory(List.of());

        assertThatThrownBy(() -> emptyFactory.getClient(OAuthProvider.GOOGLE))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
