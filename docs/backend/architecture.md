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

- **Presentation → Domain**: Controller가 Usecase 인터페이스(inbound port)를 호출
- **Infra → Domain**: Infra가 Domain의 outbound Port 인터페이스를 구현
- **Common**: 모든 계층에서 사용 (예외, 보안, DTO)
- **Domain은 Infra의 구체 구현을 모른다** (Port 인터페이스만 의존)

## 계층별 역할과 규칙

### Presentation 계층

- Controller는 비즈니스 로직을 포함하지 않는다
- Usecase 인터페이스(inbound port)만 의존한다 (구체 Service 클래스 직접 의존 금지)
- Request/Response DTO는 presentation 패키지 안에 위치, Java `record`로 정의
- 입력 검증: `@Valid` + Jakarta Validation (`@NotNull`, `@NotBlank`)
- Entity → Response 변환: DTO 내 정적 팩토리 `XxxResponse.from(Entity)`

```java
@RestController
@RequestMapping("/api/{도메인}")
@RequiredArgsConstructor
public class XxxController {
    private final XxxUsecase xxxUsecase;

    @PermitAll
    @PostMapping("/public-endpoint")
    public ResponseEntity<XxxResponse> publicApi(@Valid @RequestBody XxxRequest request) { ... }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/protected-endpoint")
    public ResponseEntity<Void> protectedApi(@CurrentUser AuthUser user) { ... }
}
```

### Domain 계층

| 요소 | 위치 | 역할 |
|------|------|------|
| Entity | `domain/{도메인}/entity/` | JPA 엔티티, 도메인 모델, 설정 Properties |
| Inbound Port | `domain/{도메인}/port/inbound/` | Usecase 인터페이스 (Presentation이 호출하는 계약) |
| Outbound Port | `domain/{도메인}/port/outbound/` | Repository, 외부 API 클라이언트 인터페이스 |
| Service | `domain/{도메인}/service/` | Usecase 구현체 (`@Service`, implements Usecase) |
| Implement | `domain/{도메인}/service/implement/` | 세부 로직 구현 (`@Implement`) |

#### Entity

- `@NoArgsConstructor(access = PROTECTED)`: JPA 전용, 외부 직접 생성 차단
- 정적 팩토리 메서드로 도메인 규칙 캡슐화
- `@PrePersist` / `@PreUpdate`로 생성/수정 시간 자동 관리

```java
@Entity @Table(name = "table_name")
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class XxxEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public static XxxEntity create(String param) { ... }

    @PrePersist
    protected void onCreate() { this.createdAt = this.updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
```

#### Port (인터페이스)

```java
// Inbound — Presentation이 호출하는 진입점. 메서드가 많으면 ReaderUsecase/WriterUsecase로 분리
public interface XxxUsecase { XxxResponse execute(String param); }

// Outbound — Repository: JpaRepository 상속, Client: Infra에서 구현
public interface XxxRepository extends JpaRepository<XxxEntity, Long> { ... }
public interface ExternalClient { SomeResult execute(String param); }
```

#### Service + Implement

```java
@Service @RequiredArgsConstructor @Transactional
public class XxxService implements XxxUsecase {
    private final XxxRepository xxxRepository;
    private final XxxWriter xxxWriter;  // Implement에 위임
    // 유스케이스 흐름 조합, 예외는 throw new BusinessException(ErrorCode.XXX)
}

// @Implement = @Component 래퍼. @Service와 구분하여 "세부 구현 클래스"임을 명시
@Implement
public class XxxWriter { ... }
```

### Infra 계층

- Domain의 Port 인터페이스를 구현한다
- Domain을 의존하되, Presentation은 의존하지 않는다
- 외부 API 호출에는 WebClient 사용, 설정값은 `@ConfigurationProperties` record로 바인딩

```java
@Component @RequiredArgsConstructor
public class XxxExternalClient implements ExternalClient { ... }
```

### Common 계층

- 예외 처리 구조: `api-response-standard.md` 참조
- 인증: JWT 토큰 기반, 메서드 레벨 어노테이션으로 제어
- HTTP 레벨은 `anyRequest().permitAll()`, 각 메서드의 어노테이션으로 인증/인가 제어

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
| 의존성 주입 | `@RequiredArgsConstructor` + `final` 필드 |
| DTO | Java `record` |
| 엔티티 생성 | 정적 팩토리 메서드 |
| 예외 처리 | `throw new BusinessException(ErrorCode.XXX)` |
| 설정 바인딩 | `@ConfigurationProperties` + `record` |
