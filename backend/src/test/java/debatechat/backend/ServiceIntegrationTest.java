package debatechat.backend;

import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * 서비스 통합 테스트 기반 클래스.
 *
 * <p>영속성 컨텍스트 캐시를 초기화하여 검증 시 실제 DB에서 조회하도록 하는
 * 유틸리티 메서드를 제공한다.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class ServiceIntegrationTest {
    @Autowired
    protected EntityManager em;

    protected void flushAndClearContext() {
        em.flush();
        em.clear();
        System.out.println("\n==================== 검증 쿼리 시작 ====================\n");
    }
}
