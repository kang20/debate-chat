package debatechat.backend.common.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtAuthenticationTokenTest {

    @Test
    void 생성_시_인증정보가_올바르게_설정된다() {
        JwtAuthenticationToken token = new JwtAuthenticationToken(1L, "USER");

        assertThat(token.isAuthenticated()).isTrue();
        assertThat(token.getCredentials()).isNull();

        AuthUser principal = token.getPrincipal();
        assertThat(principal.id()).isEqualTo(1L);
        assertThat(principal.role()).isEqualTo("USER");

        assertThat(token.getAuthorities()).hasSize(1);
        assertThat(token.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_USER");
    }
}
