package debatechat.backend.domain.auth.service.implement;

import debatechat.backend.common.annotation.Implement;
import debatechat.backend.domain.auth.port.outbound.OAuthClient;
import debatechat.backend.domain.user.entity.OAuthProvider;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Implement
public class OAuthClientFactory {
    private final Map<OAuthProvider, OAuthClient> clients;

    public OAuthClientFactory(List<OAuthClient> clientList) {
        this.clients = clientList.stream()
            .collect(Collectors.toUnmodifiableMap(OAuthClient::provider, Function.identity()));
    }

    public OAuthClient getClient(OAuthProvider provider) {
        OAuthClient client = clients.get(provider);

        if (client == null) {
            throw new IllegalArgumentException("지원하지 않는 OAuth 제공자: " + provider);
        }

        return client;
    }
}
