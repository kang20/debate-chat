# 백엔드 계층 구현 방식

## 계층 구조 개요

```
backend/src/main/java/debatechat/backend/
├── common/                  # 공통 모듈 (예외, 보안, DTO, 어노테이션)
│   ├── annotation/
│   ├── dto/response/
│   ├── exception/
│   └── security/
├── config/                  # 설정 클래스
├── presentation/            # API 진입점 (Controller + Request/Response DTO)
│   └── {도메인}/
│       ├── controller/
│       └── dto/
├── domain/                  # 비즈니스 로직 (Service, Entity, Port)
│   └── {도메인}/
│       ├── entity/
│       ├── port/
│       │   ├── inbound/     # Usecase 인터페이스 (Presentation → Domain 진입점)
│       │   └── outbound/    # Repository, 외부 API 클라이언트 인터페이스
│       └── service/
│           └── implement/
└── infra/                   # 외부 시스템 연동
    └── {기술}/{구현}/
```

## 의존성 흐름

```
Presentation → Domain ← Infra
                 ↑
               Common
```

- **Presentation → Domain**: Controller가 Usecase 인터페이스(inbound port)를 호출한다
- **Infra → Domain**: Infra가 Domain의 outbound Port 인터페이스를 구현한다
- **Common**: 모든 계층에서 사용한다 (예외, 보안, DTO)
- **Domain은 Infra의 구체 구현을 모른다** (Port 인터페이스만 의존)

## 계층별 역할과 규칙

### Presentation 계층

**역할**: HTTP 요청 수신, 입력 검증, 응답 반환

**규칙**:
- Controller는 비즈니스 로직을 포함하지 않는다
- Domain 계층의 Usecase 인터페이스(inbound port)만 의존한다 (구체 Service 클래스 직접 의존 금지)
- Request/Response DTO는 presentation 패키지 안에 위치한다

**구현 패턴**:

```java
@RestController
@RequestMapping("/api/{도메인}")
@RequiredArgsConstructor
public class XxxController {
    private final XxxUsecase xxxUsecase;

    @PermitAll
    @PostMapping("/public-endpoint")
    public ResponseEntity<XxxResponse> publicApi(@Valid @RequestBody XxxRequest request) {
        XxxResponse response = xxxUsecase.execute(request.field());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/protected-endpoint")
    public ResponseEntity<Void> protectedApi(@CurrentUser AuthUser user) {
        xxxUsecase.execute(user.id());
        return ResponseEntity.noContent().build();
    }
}
```

- DTO는 Java `record`로 정의한다
- 입력 검증은 `@Valid` + Jakarta Validation(`@NotNull`, `@NotBlank`)을 사용한다
- Entity → Response DTO 변환은 DTO 내 정적 팩토리 메서드(`XxxResponse.from(Entity)`)로 처리한다

### Domain 계층

**역할**: 비즈니스 로직, 도메인 규칙 구현

**구성 요소**:

| 요소 | 위치 | 역할 |
|------|------|------|
| Entity | `domain/{도메인}/entity/` | JPA 엔티티, 도메인 모델, 설정 Properties |
| Inbound Port | `domain/{도메인}/port/inbound/` | Usecase 인터페이스 (Presentation이 호출하는 계약) |
| Outbound Port | `domain/{도메인}/port/outbound/` | Repository, 외부 API 클라이언트 인터페이스 |
| Service | `domain/{도메인}/service/` | Usecase 구현체 (`@Service`, implements Usecase) |
| Implement | `domain/{도메인}/service/implement/` | 세부 로직 구현 (`@Implement`) |

#### Entity

```java
@Entity
@Table(name = "table_name")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class XxxEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 정적 팩토리 메서드로 생성
    public static XxxEntity create(String param) {
        XxxEntity entity = new XxxEntity();
        entity.field = param;
        return entity;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

- `@NoArgsConstructor(access = PROTECTED)`: JPA 전용, 외부에서 직접 생성을 차단한다
- 정적 팩토리 메서드로 도메인 규칙을 캡슐화한다
- `@PrePersist` / `@PreUpdate`로 생성/수정 시간을 자동 관리한다

#### Port (인터페이스)

Port는 `inbound`와 `outbound`로 분리한다.

**Inbound Port (Usecase)** — Presentation이 호출하는 진입점:

```java
// port/inbound/XxxUsecase.java
public interface XxxUsecase {
    XxxResponse execute(String param);
    void delete(Long id);
}
```

- 메서드가 많을 경우 `XxxReaderUsecase`, `XxxWriterUsecase`로 분리할 수 있다
- Presentation 계층은 이 인터페이스만 의존한다

**Outbound Port** — Domain이 외부 시스템에 요청하는 계약:

```java
// port/outbound/XxxRepository.java - Spring Data JPA가 자동 구현
public interface XxxRepository extends JpaRepository<XxxEntity, Long> {
    Optional<XxxEntity> findByField(String field);
}

// port/outbound/ExternalClient.java - Infra 계층에서 구현
public interface ExternalClient {
    SomeResult execute(String param);
}
```

#### Service (Usecase 구현체)

```java
@Service
@RequiredArgsConstructor
@Transactional
public class XxxService implements XxxUsecase {
    private final XxxRepository xxxRepository;
    private final XxxWriter xxxWriter;

    @Override
    public XxxResponse execute(String param) {
        // 유스케이스 흐름 조합
        // 세부 로직은 Implement 클래스에 위임
        // 예외는 BusinessException(ErrorCode)으로 던진다
    }
}
```

- Service는 반드시 Usecase 인터페이스를 구현한다 (`implements XxxUsecase`)
- 유스케이스 흐름을 조합한다
- 세부 로직은 `implement/` 패키지의 클래스에 위임한다
- 예외는 `throw new BusinessException(ErrorCode.XXX)` 형태로 던진다

#### @Implement

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Component
public @interface Implement { ... }
```

- `@Component`의 래퍼 어노테이션이다
- `@Service`와 구분하여 "세부 구현 클래스"임을 명시한다

### Infra 계층

**역할**: 외부 시스템과의 실제 통신 구현

**규칙**:
- Domain 계층의 Port 인터페이스를 구현한다
- Domain 계층을 의존하되, Presentation 계층은 의존하지 않는다

**구현 패턴**:

```java
@Component
@RequiredArgsConstructor
public class XxxExternalClient implements ExternalClient {
    private final WebClient webClient;
    private final XxxProperties xxxProperties;

    @Override
    public SomeResult execute(String param) {
        // 외부 API 호출 구현
    }
}
```

- Domain의 Port 인터페이스를 구현한다
- 외부 API 호출에는 WebClient를 사용한다
- 설정값은 `@ConfigurationProperties` record로 YAML에서 바인딩한다

### Common 계층

**역할**: 계층을 관통하는 공통 기능 제공

#### 예외 처리 구조

```
ErrorCode (enum)           → 에러 코드/메시지/HTTP 상태 정의
BusinessException          → 비즈니스 예외 (ErrorCode 포함)
GlobalExceptionHandler     → 전역 예외 → JSON 응답 변환
ErrorResponse (record)     → 클라이언트 응답 형식 {"code", "message"}
```

`GlobalExceptionHandler`가 처리하는 예외:

| 예외 | HTTP 상태 | 설명 |
|------|-----------|------|
| `BusinessException` | ErrorCode에 정의된 상태 | 비즈니스 로직 예외 |
| `MethodArgumentNotValidException` | 400 | `@Valid` 검증 실패 |
| `HttpMessageNotReadableException` | 400 | JSON 파싱 실패 |
| `AccessDeniedException` (미인증) | 401 | 인증 없이 보호된 API 접근 |
| `AccessDeniedException` (권한 부족) | 403 | 인증됐지만 권한 없음 |
| `Exception` | 500 | 예상치 못한 에러 |

#### 보안 구조

- 인증 방식: JWT 토큰 기반
- 보안 제어: 메서드 레벨 어노테이션 (`@PermitAll`, `@PreAuthorize`)
- HTTP 레벨에서는 `anyRequest().permitAll()`로 모든 요청을 통과시키고, 각 Controller 메서드의 어노테이션으로 인증/인가를 제어한다

| 어노테이션 | 용도 |
|-----------|------|
| `@PermitAll` | 인증 불필요 (공개 API) |
| `@PreAuthorize("isAuthenticated()")` | 인증 필수 |
| `@PreAuthorize("hasRole('ADMIN')")` | 특정 역할 필수 |
| `@PreAuthorize("hasAnyRole('ADMIN','USER')")` | 복수 역할 허용 |

### Config 계층

| 설정 클래스 | 역할 |
|-----------|------|
| SecurityConfig | Spring Security 설정, `@EnableMethodSecurity(jsr250Enabled = true)` |
| WebConfig | CORS 설정 |
| WebClientConfig | 외부 API 호출용 WebClient 빈 등록 |

## 컨벤션 요약

| 항목 | 규칙 |
|------|------|
| 의존성 주입 | `@RequiredArgsConstructor` + `final` 필드 (생성자 주입) |
| DTO | Java `record` 사용 |
| 엔티티 생성 | 정적 팩토리 메서드 |
| 예외 처리 | `throw new BusinessException(ErrorCode.XXX)` |
| API 보안 | `@PermitAll` (공개), `@PreAuthorize` (인증/권한 필요) |
| 설정 바인딩 | `@ConfigurationProperties` + `record` |
| Service 클래스 | `@Service` + `implements XxxUsecase` |
| Usecase 인터페이스 | `port/inbound/`에 위치, Controller가 의존하는 대상 |
| Port 분리 | `port/inbound/` (Usecase), `port/outbound/` (Repository, Client) |
| 세부 구현 클래스 | `@Implement` 어노테이션 |
