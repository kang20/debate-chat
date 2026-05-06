package debatechat.backend.common.security;

import debatechat.backend.domain.auth.service.implement.JwtHandler;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

class JwtAuthenticationFilterTest {

    private JwtHandler jwtHandler;
    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        jwtHandler = mock(JwtHandler.class);
        filter = new JwtAuthenticationFilter(jwtHandler);
        SecurityContextHolder.clearContext();
    }

    @Test
    void 유효한_토큰이면_SecurityContext에_인증정보가_설정된다() throws Exception {
        Claims claims = mock(Claims.class);
        given(claims.getSubject()).willReturn("1");
        given(claims.get("role", String.class)).willReturn("USER");
        given(jwtHandler.parseAccessToken("valid-token")).willReturn(claims);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");

        filter.doFilterInternal(request, new MockHttpServletResponse(), new MockFilterChain());

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isInstanceOf(JwtAuthenticationToken.class);
        assertThat(auth.getPrincipal()).isInstanceOf(AuthUser.class);

        AuthUser user = (AuthUser) auth.getPrincipal();
        assertThat(user.id()).isEqualTo(1L);
        assertThat(user.role()).isEqualTo("USER");
    }

    @Test
    void Authorization_헤더가_없으면_인증정보가_설정되지_않는다() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();

        filter.doFilterInternal(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void 토큰_파싱_실패_시_SecurityContext가_비워진다() throws Exception {
        given(jwtHandler.parseAccessToken("invalid-token")).willThrow(new RuntimeException("invalid"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid-token");

        filter.doFilterInternal(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void Bearer_접두사가_아닌_헤더는_무시된다() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic some-value");

        filter.doFilterInternal(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
