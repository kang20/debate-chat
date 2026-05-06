package debatechat.backend.infra.api.oauth;

import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import debatechat.backend.domain.auth.port.outbound.OAuthClient;
import debatechat.backend.domain.auth.entity.OAuthUserInfo;
import debatechat.backend.domain.user.entity.OAuthProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthClient implements OAuthClient {

    private final WebClient webClient;
    private final OAuthProperties oAuthProperties;

    @Override
    public OAuthProvider provider() {
        return OAuthProvider.GOOGLE;
    }

    @Override
    public OAuthUserInfo getUserInfo(String authorizationCode) {
        try {
            String accessToken = exchangeCodeForToken(authorizationCode);
            return fetchUserInfo(accessToken);
        } catch (WebClientResponseException e) {
            log.warn("[GoogleOAuth] 인증 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("[GoogleOAuth] 예상치 못한 오류", e);
            throw new BusinessException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }
    }

    private String exchangeCodeForToken(String code) {
        OAuthProperties.Provider google = oAuthProperties.google();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = webClient.post()
            .uri(google.tokenUri())
            .bodyValue(Map.of(
                "grant_type", "authorization_code",
                "code", code,
                "client_id", google.clientId(),
                "client_secret", google.clientSecret(),
                "redirect_uri", google.redirectUri()
            ))
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        if (response == null || !response.containsKey("access_token")) {
            throw new BusinessException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }
        return (String) response.get("access_token");
    }

    private OAuthUserInfo fetchUserInfo(String accessToken) {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = webClient.get()
            .uri(oAuthProperties.google().userInfoUri())
            .header("Authorization", "Bearer " + accessToken)
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        if (response == null || !response.containsKey("id")) {
            throw new BusinessException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }
        return new OAuthUserInfo(String.valueOf(response.get("id")));
    }
}
