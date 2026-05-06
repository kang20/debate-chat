# 백엔드 테스트 구현 방식

## 테스트 구조 개요

```
backend/src/test/
├── java/debatechat/backend/
│   ├── BackendApplicationTests.java        # 애플리케이션 로드 검증
│   ├── ServiceIntegrationTest.java         # 통합 테스트 기반 추상 클래스
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
    └── application.yml                     # 테스트 전용 설정
```

## 테스트 전략

### 클래스별 테스트 방식 결정 기준

| 클래스 | 기본 테스트 방식 | 비고 |
|--------|----------------|------|
| **Service** | 통합 테스트 (DB 포함) | 복잡한 로직이 있는 경우에만 추가로 단위 테스트 |
| **Implement** | 통합 테스트 (Service 통합 테스트로 대체) | 복잡한 로직이 있는 경우에만 추가로 단위 테스트 |
| **Repository** (JpaRepository 자동 생성 쿼리) | 통합 테스트 (Service 통합 테스트로 대체) | 별도 테스트 불필요 |
| **Repository** (JPQL, QueryDSL, MyBatis 등 커스텀 쿼리) | 단위 테스트 | 커스텀 쿼리 정확성 검증 |
| **Controller** | @WebMvcTest | HTTP 요청/응답, 입력 검증, 보안 |
| **외부 API Client** | MockWebServer | HTTP 통신 로직 검증 |
| **그 외 모든 클래스** (Entity, DTO, Factory 등) | 단위 테스트 | Spring 컨텍스트 없이 순수 Java로 검증 |

**핵심 원칙**:
- Service와 Implement는 DB를 포함하는 **통합 테스트를 지향**한다
- Service/Implement의 단위 테스트는 **복잡한 로직이 있는 경우에만** 작성한다
- JpaRepository 인터페이스 상속으로 자동 생성되는 쿼리는 Service 통합 테스트로 충분하며, **별도 Repository 테스트를 작성하지 않는다**
- 위 표에 명시되지 않은 클래스는 **단위 테스트**로 진행한다

## 테스트 유형별 구현 방식

### 1. 단위 테스트

**대상**: Entity, DTO, Factory 등 Spring 컨텍스트 없이 검증 가능한 클래스 (Service, Implement 제외)

**특징**: 클래스 레벨 어노테이션 없이 순수 Java로 테스트한다

```java
class XxxEntityTest {
    @Test
    void 정적_팩토리_메서드로_정상_생성() {
        XxxEntity entity = XxxEntity.create("param");

        assertThat(entity.getField()).isEqualTo("param");
    }
}
```

`@ConfigurationProperties` 빈이 필요한 경우 직접 생성한다:

```java
class XxxHandlerTest {
    private XxxHandler handler;

    @BeforeEach
    void setUp() {
        XxxProperties props = new XxxProperties("test-value", 1000L);
        handler = new XxxHandler(props);
    }

    @Test
    void 정상_동작_검증() { ... }
}
```

**Service/Implement 단위 테스트** — 복잡한 로직이 있는 경우에만 작성한다:

```java
class XxxServiceTest {
    private XxxService service;

    @BeforeEach
    void setUp() {
        service = new XxxService(mock(XxxRepository.class), mock(XxxWriter.class));
    }

    @Test
    void 복잡한_분기_로직_검증() { ... }
}
```

**커스텀 쿼리 Repository 테스트** — JPQL, QueryDSL, MyBatis 등 직접 작성한 쿼리만 테스트한다:

```java
@DataJpaTest
@ActiveProfiles("test")
class XxxRepositoryTest {
    @Autowired private XxxRepository xxxRepository;

    @Test
    void 커스텀_쿼리_정상_조회() {
        // given - 테스트 데이터 저장
        // when - 커스텀 쿼리 실행
        // then - 결과 검증
    }
}
```

> JpaRepository가 자동 생성하는 쿼리(`findById`, `findByField` 등)는 별도 테스트 없이 Service 통합 테스트로 검증한다.

### 2. Controller 테스트 (@WebMvcTest)

**대상**: HTTP 요청/응답, 입력 검증, 보안 어노테이션 동작

**특징**:
- `@WebMvcTest`로 MVC 계층만 로드한다
- `@Import`로 SecurityConfig, JwtAuthenticationFilter를 포함한다
- Usecase 인터페이스(inbound port)를 `@MockitoBean`으로 Mock 처리한다 (구체 Service 클래스가 아닌 인터페이스)

```java
@WebMvcTest(XxxController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class XxxControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private XxxUsecase xxxUsecase;
    // SecurityConfig가 로드하는 Properties도 MockitoBean으로 선언
    @MockitoBean private JwtHandler jwtHandler;
    @MockitoBean private JwtProperties jwtProperties;
    @MockitoBean private OAuthProperties oAuthProperties;
}
```

**`@Nested`로 API별 그룹화**:

```java
@Nested
class Xxx_API {
    @Test
    void 정상_요청_시_2xx_반환() throws Exception {
        // given
        given(xxxUsecase.execute(any())).willReturn(response);

        // when & then
        mockMvc.perform(post("/api/xxx")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.field").value("expected"));
    }

    @Test
    void 필수값_누락_시_400_반환() throws Exception { ... }

    @Test
    void 비즈니스_예외_시_해당_상태코드_반환() throws Exception { ... }
}
```

**인증이 필요한 API 테스트**:

```java
// 인증된 사용자
mockMvc.perform(post("/api/xxx/protected")
        .with(authentication(new JwtAuthenticationToken(1L, "USER"))))
    .andExpect(status().isOk());

// 미인증 사용자
mockMvc.perform(post("/api/xxx/protected"))
    .andExpect(status().isUnauthorized())
    .andExpect(jsonPath("$.code").value(ErrorCode.AUTHENTICATION_REQUIRED.getCode()));
```

### 3. 서비스 통합 테스트 (@SpringBootTest)

**대상**: Service와 Implement의 비즈니스 로직이 DB, 트랜잭션과 함께 올바르게 동작하는지 검증. JpaRepository 자동 생성 쿼리도 이 테스트에서 함께 검증된다.

**기반 클래스**: `ServiceIntegrationTest`를 상속한다

```java
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class ServiceIntegrationTest {
    @Autowired
    protected EntityManager em;

    protected void flushAndClearContext() {
        em.flush();
        em.clear();
    }
}
```

- `@SpringBootTest`: 전체 Spring 컨텍스트 로드
- `@ActiveProfiles("test")`: test 프로필 활성화 (H2 DB)
- `@Transactional`: 각 테스트 후 자동 롤백
- `flushAndClearContext()`: 영속성 컨텍스트를 초기화하여 실제 DB 조회로 검증

**구현 패턴**:

```java
class XxxServiceIntegrationTest extends ServiceIntegrationTest {

    @Autowired private XxxUsecase xxxUsecase;  // Usecase 인터페이스로 주입
    @Autowired private XxxRepository xxxRepository;

    // 외부 API 의존성만 Mock
    @MockitoBean private ExternalClientFactory externalClientFactory;

    @BeforeEach
    void setUp() {
        // Mock 설정
    }

    @Test
    void 정상_실행_시_DB에_저장된다() {
        // given - 외부 API 응답 Mock
        given(mockClient.execute(any())).willReturn(result);

        // when
        XxxResponse response = xxxUsecase.execute(param);

        // then - 영속성 캐시 초기화 후 DB 상태 검증
        flushAndClearContext();
        XxxEntity saved = xxxRepository.findById(id).get();
        assertThat(saved.getField()).isEqualTo("expected");
    }
}
```

**Mock 전략**:

| 대상 | 방식 |
|------|------|
| 외부 API | `@MockitoBean`으로 Mock |
| DB, 트랜잭션, JPA | 실제 동작 (H2) |
| 내부 Implement 클래스 | 실제 동작 |
| Repository (자동 생성 쿼리) | 실제 동작 (H2) — 별도 테스트 불필요 |

### 4. 외부 API 테스트 (MockWebServer)

**대상**: Infra 계층의 외부 API 클라이언트 HTTP 통신 로직

**특징**: `MockWebServer`로 가짜 HTTP 서버를 띄워 요청/응답을 검증한다

```java
class ExternalClientTest {
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

    @Test
    void 정상_응답_시_결과_반환() {
        mockWebServer.enqueue(jsonResponse("""
            {"key": "value"}
            """));

        ExternalClient client = createClient();
        SomeResult result = client.execute("param");

        assertThat(result.field()).isEqualTo("value");
    }

    @Test
    void 실패_응답_시_예외_발생() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(400));

        ExternalClient client = createClient();

        assertThatThrownBy(() -> client.execute("param"))
            .isInstanceOf(BusinessException.class);
    }
}
```

유사한 구현체가 여러 개인 경우 `@ParameterizedTest`로 중복을 제거한다:

```java
@ParameterizedTest
@EnumSource(ProviderType.class)
void 모든_Provider에_대해_정상_동작(ProviderType type) {
    ExternalClient client = createClient(type);
    assertThat(client.provider()).isEqualTo(type);
}
```

### 5. 예외 핸들러 테스트 (Standalone MockMvc)

**대상**: `GlobalExceptionHandler`의 예외 → HTTP 응답 변환 로직

**특징**: `standaloneSetup`으로 최소한의 MVC 환경만 구성한다

```java
class GlobalExceptionHandlerTest {
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(new FakeController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @RestController
    static class FakeController {
        @GetMapping("/test/business")
        void businessException() {
            throw new BusinessException(ErrorCode.SOME_ERROR);
        }
    }

    @Test
    void BusinessException은_해당_ErrorCode의_상태와_코드를_반환한다() throws Exception {
        mockMvc.perform(get("/test/business"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value(ErrorCode.SOME_ERROR.getCode()));
    }
}
```

## 테스트 설정

### application.yml (테스트 전용)

- H2 메모리 DB 사용 (`create-drop`으로 테스트 격리)
- `@ConfigurationProperties`에 필요한 설정값은 더미 값으로 채운다
- 외부 API 설정은 테스트에서 직접 호출하지 않으므로 더미 값을 사용한다

## 컨벤션

### 메서드 네이밍

**패턴**: `주제_상황_결과` (한글)

```
정상_요청_시_201_반환()
필수값_누락_시_400_반환()
중복_데이터_시_409_반환()
인증_없이_접근_시_401_반환()
```

### 구조 패턴

- **`@Nested`**: API 또는 기능 단위로 테스트를 그룹화한다
- **Given-When-Then**: Mock 설정 → 실행 → 검증 순서를 따른다
- **상수 활용**: 반복되는 테스트 데이터는 클래스 상수로 선언한다

### Assertion

**AssertJ** 사용 (Fluent API):

```java
// 값 검증
assertThat(entity.getField()).isEqualTo("expected");

// 예외 검증
assertThatThrownBy(() -> service.execute(...))
    .isInstanceOf(BusinessException.class)
    .extracting(e -> ((BusinessException) e).getErrorCode())
    .isEqualTo(ErrorCode.SOME_ERROR);

// MockMvc 검증
mockMvc.perform(post("/api/xxx")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
    .andExpect(status().isCreated())
    .andExpect(jsonPath("$.field").value("expected"));
```

### Mock 사용 기준

| 상황 | 방식 |
|------|------|
| Controller 테스트의 Usecase | `@MockitoBean` (인터페이스 기반) |
| 통합 테스트의 외부 API | `@MockitoBean` + `mock()` |
| 단위 테스트의 의존 객체 | `Mockito.mock()` 직접 사용 |
| DB/JPA | 실제 동작 (H2) |

## 테스트 실행

```bash
# 전체 테스트 실행 (필수 - 단일 테스트만 실행하지 않는다)
cd backend
./gradlew test
```

## 테스트 유형 요약

| 유형 | 어노테이션 | DB | Spring 컨텍스트 | 대상 |
|------|-----------|-----|----------------|------|
| 단위 | 없음 | X | X | Entity, DTO, Factory 등 (Service/Implement는 복잡한 로직 시에만) |
| 단위 (커스텀 쿼리) | `@DataJpaTest` | H2 | 부분 로드 | JPQL, QueryDSL, MyBatis 등 커스텀 쿼리 |
| Controller | `@WebMvcTest` | X | 부분 로드 | Controller + 보안 |
| 통합 | `@SpringBootTest` | H2 | 전체 로드 | Service + Implement + Repository (자동 생성 쿼리 포함) |
| 외부 API | 없음 (MockWebServer) | X | X | Infra 클라이언트 |
| 예외 핸들러 | 없음 (standaloneSetup) | X | X | GlobalExceptionHandler |
