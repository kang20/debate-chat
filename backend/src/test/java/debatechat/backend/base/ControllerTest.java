package debatechat.backend.base;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import debatechat.backend.common.security.JwtAuthenticationFilter;
import debatechat.backend.config.SecurityConfig;
import debatechat.backend.domain.auth.entity.JwtProperties;
import debatechat.backend.domain.auth.service.implement.JwtHandler;
import debatechat.backend.infra.api.oauth.OAuthProperties;
import tools.jackson.databind.ObjectMapper;

/**
 * 컨트롤러 슬라이스 테스트(@WebMvcTest) 공통 베이스.
 *
 * <p>서브클래스는 {@code @WebMvcTest(SpecificController.class)} 와 도메인별 {@code @MockitoBean} 만
 * 추가하면 되며, Security 설정·MockMvc·공용 보안 빈 모킹은 본 베이스에서 처리한다.
 */
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
public abstract class ControllerTest {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;

    @MockitoBean protected JwtHandler jwtHandler;
    @MockitoBean protected JwtProperties jwtProperties;
    @MockitoBean protected OAuthProperties oAuthProperties;
}
