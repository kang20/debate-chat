package debatechat.backend.infra.api.oauth;

import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.domain.auth.port.outbound.OAuthClient;
import debatechat.backend.domain.auth.entity.OAuthUserInfo;
import debatechat.backend.domain.user.entity.OAuthProvider;
import mockwebserver3.MockResponse;
import mockwebserver3.MockWebServer;
import mockwebserver3.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OAuthClientTest {

    private static final String AUTHORIZATION_CODE = "valid-authorization-code";
    private static final String OAUTH_USER_ID = "oauth-user-123";

    private MockWebServer mockWebServer;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.close();
    }

    private OAuthClient createClient(OAuthProvider provider) {
        String baseUrl = mockWebServer.url("/").toString();
        WebClient webClient = WebClient.builder().build();

        return switch (provider) {
            case GOOGLE -> {
                var props = new OAuthProperties(
                    new OAuthProperties.Provider("test-client-id", "test-client-secret",
                        "http://localhost:5173/callback", baseUrl + "token", baseUrl + "userinfo"),
                    null
                );
                yield new GoogleOAuthClient(webClient, props);
            }
            case KAKAO -> {
                var props = new OAuthProperties(
                    null,
                    new OAuthProperties.Provider("test-client-id", "test-client-secret",
                        "http://localhost:5173/callback", baseUrl + "token", baseUrl + "userinfo")
                );
                yield new KakaoOAuthClient(webClient, props);
            }
        };
    }

    private MockResponse jsonResponse(String body) {
        return new MockResponse.Builder()
            .body(body)
            .addHeader("Content-Type", "application/json")
            .build();
    }

    @ParameterizedTest
    @EnumSource(OAuthProvider.class)
    void provider를_올바르게_반환한다(OAuthProvider provider) {
        OAuthClient client = createClient(provider);
        assertThat(client.provider()).isEqualTo(provider);
    }

    @Nested
    class 사용자_정보_조회 {

        @ParameterizedTest
        @EnumSource(OAuthProvider.class)
        void 정상_코드로_사용자정보_조회_성공(OAuthProvider provider) throws Exception {
            OAuthClient client = createClient(provider);

            mockWebServer.enqueue(jsonResponse("""
                {"access_token": "mock-access-token"}
                """));
            mockWebServer.enqueue(jsonResponse("""
                {"id": "%s"}
                """.formatted(OAUTH_USER_ID)));

            OAuthUserInfo result = client.getUserInfo(AUTHORIZATION_CODE);

            assertThat(result.oauthId()).isEqualTo(OAUTH_USER_ID);

            // 토큰 교환 요청 검증
            RecordedRequest tokenRequest = mockWebServer.takeRequest();
            String tokenBody = tokenRequest.getBody().utf8();
            assertThat(tokenBody).contains("grant_type");
            assertThat(tokenBody).contains("client_id");
            assertThat(tokenBody).contains("client_secret");

            // 사용자 정보 요청 검증
            RecordedRequest userInfoRequest = mockWebServer.takeRequest();
            assertThat(userInfoRequest.getHeaders().get("Authorization"))
                .isEqualTo("Bearer mock-access-token");
        }

        @ParameterizedTest
        @EnumSource(OAuthProvider.class)
        void 토큰_교환_실패_시_예외_발생(OAuthProvider provider) {
            OAuthClient client = createClient(provider);

            mockWebServer.enqueue(new MockResponse.Builder()
                .code(401)
                .body("""
                    {"error": "invalid_grant"}
                    """)
                .addHeader("Content-Type", "application/json")
                .build());

            assertThatThrownBy(() -> client.getUserInfo(AUTHORIZATION_CODE))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }

        @ParameterizedTest
        @EnumSource(OAuthProvider.class)
        void 토큰_응답에_access_token_누락_시_예외_발생(OAuthProvider provider) {
            OAuthClient client = createClient(provider);

            mockWebServer.enqueue(jsonResponse("""
                {"token_type": "Bearer"}
                """));

            assertThatThrownBy(() -> client.getUserInfo(AUTHORIZATION_CODE))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }

        @ParameterizedTest
        @EnumSource(OAuthProvider.class)
        void 사용자정보_응답에_id_누락_시_예외_발생(OAuthProvider provider) {
            OAuthClient client = createClient(provider);

            mockWebServer.enqueue(jsonResponse("""
                {"access_token": "mock-access-token"}
                """));
            mockWebServer.enqueue(jsonResponse("""
                {"email": "user@example.com"}
                """));

            assertThatThrownBy(() -> client.getUserInfo(AUTHORIZATION_CODE))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }

        @ParameterizedTest
        @EnumSource(OAuthProvider.class)
        void 예상치_못한_오류_시_OAUTH_AUTHENTICATION_FAILED_예외(OAuthProvider provider) {
            String invalidUrl = "http://localhost:1/";
            WebClient webClient = WebClient.builder().build();
            OAuthClient client = switch (provider) {
                case GOOGLE -> new GoogleOAuthClient(webClient, new OAuthProperties(
                    new OAuthProperties.Provider("id", "secret", "redirect", invalidUrl + "token", invalidUrl + "userinfo"),
                    null));
                case KAKAO -> new KakaoOAuthClient(webClient, new OAuthProperties(
                    null,
                    new OAuthProperties.Provider("id", "secret", "redirect", invalidUrl + "token", invalidUrl + "userinfo")));
            };

            assertThatThrownBy(() -> client.getUserInfo(AUTHORIZATION_CODE))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }
    }
}
