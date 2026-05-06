package debatechat.backend.domain.auth.port.outbound;

import debatechat.backend.domain.auth.entity.OAuthUserInfo;
import debatechat.backend.domain.auth.service.implement.OAuthClientFactory;
import debatechat.backend.domain.user.entity.OAuthProvider;

/**
 * OAuth 제공자별 인증 클라이언트 인터페이스.
 *
 * <p>각 OAuth 제공자(Google, Kakao 등)는 이 인터페이스를 구현하고,
 * {@link OAuthClientFactory}에 의해 Authorization Code에 맞는 구현체가 선택된다.
 */
public interface OAuthClient {

    /**
     * 이 클라이언트가 담당하는 OAuth 제공자를 반환한다.
     */
    OAuthProvider provider();

    /**
     * Authorization Code를 사용해 OAuth 제공자로부터 사용자 정보를 조회한다.
     *
     * @param authorizationCode 프론트엔드에서 전달받은 OAuth Authorization Code
     * @return 제공자에서 조회한 사용자 정보 (oauthId, email 등)
     * @throws debatechat.backend.common.exception.BusinessException OAuth 인증 실패 시 (AUTH_003)
     */
    OAuthUserInfo getUserInfo(String authorizationCode);
}
