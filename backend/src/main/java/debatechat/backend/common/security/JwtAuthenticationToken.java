package debatechat.backend.common.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final AuthUser authUser;

    public JwtAuthenticationToken(Long userId, String role) {
        super(List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        this.authUser = new AuthUser(userId, role);
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public AuthUser getPrincipal() {
        return authUser;
    }
}
