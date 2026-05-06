# 백엔드 테스트 구현 방식

## 테스트 구조 개요

```
backend/src/test/
├── java/debatechat/backend/
│   ├── BackendApplicationTests.java        # 애플리케이션 로드 검증
│   ├── base/                              # 테스트 공통 기반
│   │   ├── ServiceIntegrationTest.java    # 통합 테스트 기반 추상 클래스
│   │   ├── arch/
│   │   │   └── ArchitectureTest.java      # ArchUnit 아키텍처 검증
│   │   └── fixture/                       # 테스트 Fixture (엔티티 사전 세팅)
│   │       ├── UserFixture.java
│   │       └── RefreshTokenFixture.java
│   ├── common/                             # 공통 모듈 테스트
│   ├── domain/{도메인}/
│   │   ├── entity/                         # Entity 단위 테스트
│   │   ├── port/                           # Port 관련 단위 테스트 (Factory 등)
│   │   └── service/
│   │       ├── {Implement}Test.java        # Implement 단위 테스트 (복잡한 로직 시에만)
│   │       └── integration/
│   │           └── {Service}IntegrationTest.java  # Service + Implement 통합 테스트
│   ├── infra/                              # 외부 API 테스트 (MockWebServer)
│   └── presentation/{도메인}/
│       └── {Controller}Test.java           # Controller 테스트 (@WebMvcTest)
└── resources/
    └── application.yml                     # 테스트 전용 설정 (H2, 더미 설정값)
```

## 테스트 전략

| 클래스 | 테스트 방식 | 비고 |
|--------|-----------|------|
| **Service** | 통합 테스트 (DB 포함) | 복잡한 로직 시에만 추가 단위 테스트 |
| **Implement** | Service 통합 테스트로 대체 | 복잡한 로직 시에만 추가 단위 테스트 |
| **Repository** (자동 생성 쿼리) | Service 통합 테스트로 대체 | 별도 테스트 불필요 |
| **Repository** (커스텀 쿼리) | `@DataJpaTest` 단위 테스트 | JPQL, QueryDSL 등 |
| **Controller** | `@WebMvcTest` | HTTP 요청/응답, 입력 검증, 보안 |
| **외부 API Client** | MockWebServer | HTTP 통신 로직 검증 |
| **그 외** (Entity, DTO 등) | 단위 테스트 | Spring 컨텍스트 없이 순수 Java |

## 테스트 유형별 구현 방식

### 1. 단위 테스트

클래스 레벨 어노테이션 없이 순수 Java로 테스트. `@ConfigurationProperties` 빈은 직접 생성.

```java
class XxxEntityTest {
    @Test void 정적_팩토리_메서드로_정상_생성() { ... }
}

// ConfigurationProperties가 필요한 경우
class XxxHandlerTest {
    @BeforeEach void setUp() { handler = new XxxHandler(new XxxProperties("value", 1000L)); }
}

// 커스텀 쿼리 Repository
@DataJpaTest @ActiveProfiles("test")
class XxxRepositoryTest { ... }
```

### 2. Controller 테스트 (@WebMvcTest)

- `@Import({SecurityConfig.class, JwtAuthenticationFilter.class})`
- Usecase 인터페이스를 `@MockitoBean` (구체 Service가 아닌 인터페이스)
- SecurityConfig가 로드하는 Properties도 `@MockitoBean`으로 선언

```java
@WebMvcTest(XxxController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class XxxControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockitoBean private XxxUsecase xxxUsecase;
    @MockitoBean private JwtHandler jwtHandler;
    @MockitoBean private JwtProperties jwtProperties;
    @MockitoBean private OAuthProperties oAuthProperties;

    @Nested
    class Xxx_API {
        @Test void 정상_요청_시_2xx_반환() throws Exception { ... }
        @Test void 필수값_누락_시_400_반환() throws Exception { ... }
    }
}
```

**인증 테스트**: `.with(authentication(new JwtAuthenticationToken(1L, "USER")))` 사용

### 3. 서비스 통합 테스트 (@SpringBootTest)

`ServiceIntegrationTest` 기반 클래스를 상속한다:

```java
@SpringBootTest @ActiveProfiles("test") @Transactional
public abstract class ServiceIntegrationTest {
    @Autowired protected EntityManager em;
    protected void flushAndClearContext() { em.flush(); em.clear(); }
}
```

```java
class XxxServiceIntegrationTest extends ServiceIntegrationTest {
    @Autowired private XxxUsecase xxxUsecase;
    @Autowired private XxxFixture xxxFixture;
    @MockitoBean private ExternalClient externalClient;  // 외부 API만 Mock

    @Nested
    class 유스케이스명 {
        @Test void 정상_실행_시_DB에_저장된다() {
            XxxEntity existing = xxxFixture.create("param");
            given(externalClient.execute(any())).willReturn(result);

            xxxUsecase.execute(param);

            flushAndClearContext();
            assertThat(xxxRepository.findById(id)).isPresent();
        }
    }
}
```

**Mock 전략**: 외부 API만 `@MockitoBean`, DB/JPA/Implement/Repository는 모두 실제 동작 (H2)

### 4. 외부 API 테스트 (MockWebServer)

```java
class ExternalClientTest {
    private MockWebServer mockWebServer;
    @BeforeEach void setUp() throws IOException { mockWebServer = new MockWebServer(); mockWebServer.start(); }
    @AfterEach void tearDown() throws IOException { mockWebServer.close(); }

    @Test void 정상_응답_시_결과_반환() { ... }
    @Test void 실패_응답_시_예외_발생() { ... }
}
```

유사 구현체가 여럿이면 `@ParameterizedTest` + `@EnumSource`로 중복 제거.

### 5. 예외 핸들러 테스트 (Standalone MockMvc)

`standaloneSetup` + `setControllerAdvice(new GlobalExceptionHandler())` + `FakeController`로 최소 MVC 환경 구성.

## Fixture 패턴

`base/fixture/` 패키지, `@Component`로 등록. 내부에서 `save` + `flush` + `clear`까지 처리.

```java
@Component
public class XxxFixture {
    @Autowired private XxxRepository xxxRepository;
    @Autowired private EntityManager em;

    public XxxEntity create(String param) {
        XxxEntity entity = XxxEntity.create(param);
        xxxRepository.save(entity);
        em.flush(); em.clear();
        return entity;
    }
}
```

- 도메인별로 Fixture 클래스 분리
- 자주 쓰는 시나리오는 의미 있는 메서드명 제공 (예: `createExpired()`)

## 컨벤션

- **메서드 네이밍**: `주제_상황_결과` (한글) — `정상_요청_시_201_반환()`
- **구조**: `@Nested`로 API/기능 단위 그룹화, Given-When-Then 순서, 반복 데이터는 클래스 상수
- **Assertion**: AssertJ 사용 (`assertThat`, `assertThatThrownBy`)
- **Mock 기준**: Controller → `@MockitoBean`(인터페이스), 통합 → `@MockitoBean`(외부 API만), 단위 → `mock()` 직접
- **실행**: 반드시 전체 테스트 (`./gradlew test`), 단일 테스트만 실행 금지
