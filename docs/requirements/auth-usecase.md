# 인증 기능 유스케이스 명세

> 비즈니스 요구사항(섹션 1. 사용자 및 인증)을 기반으로, 회원가입/로그인/로그아웃/토큰 갱신 기능의 흐름, 제한사항, 검증 규칙, 비즈니스 규칙을 정의한다.
>
> **범위**: 회원가입, 로그인, 로그아웃, 토큰 갱신 (닉네임 설정, 프로필 조회/수정, 사용자 공개 조회는 추후 개발)

---

## 목차

1. [도메인 모델](#1-도메인-모델)
2. [UC-1. OAuth 회원가입](#uc-1-oauth-회원가입)
3. [UC-2. OAuth 로그인](#uc-2-oauth-로그인)
4. [UC-3. 로그아웃](#uc-3-로그아웃)
5. [UC-4. 토큰 갱신](#uc-4-토큰-갱신)
6. [에러 코드 정의](#에러-코드-정의)
7. [기술 구현 방향](#기술-구현-방향)
8. [테스트 검증 케이스](#테스트-검증-케이스)

---

## 1. 도메인 모델

### 1.1 User 엔티티

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, AUTO_INCREMENT | 내부 식별자 (API 응답 시 String 변환) |
| provider | enum(GOOGLE, KAKAO) | NOT NULL | OAuth 제공자 |
| oauthId | String(255) | NOT NULL | OAuth 제공자의 고유 사용자 ID |
| nickname | String(20) | UNIQUE, NULLABLE | 서비스 내 표시 이름 (DRAFT 상태에서는 null) |
| role | enum(ADMIN, USER, DRAFT) | NOT NULL, 기본값 DRAFT | 사용자 권한 |
| debateGrade | enum(BRONZE, SILVER, GOLD) | NOT NULL, 기본값 BRONZE | 토론 등급 |
| createdAt | LocalDateTime | NOT NULL, 자동 생성 | 가입일시 |
| updatedAt | LocalDateTime | NOT NULL, 자동 갱신 | 최종 수정일시 |

**복합 유니크 제약**: `(provider, oauthId)` — 동일 OAuth 계정 중복 가입 방지

> **UserRole 정책**
>
> | 역할 | 설명 | 접근 범위 |
> |------|------|----------|
> | DRAFT | 신규 가입 후 닉네임 미설정 상태 | 닉네임 설정 화면만 접근 가능 |
> | USER | 닉네임 설정 완료된 일반 사용자 | 전체 서비스 이용 가능 |
> | ADMIN | 관리자 | 관리 기능 포함 전체 접근 |

### 1.2 RefreshToken 엔티티

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, AUTO_INCREMENT | - |
| userId | Long | NOT NULL, FK → User.id | 토큰 소유자 |
| token | String(512) | NOT NULL, UNIQUE | RefreshToken 값 |
| expiresAt | LocalDateTime | NOT NULL | 만료 일시 |
| createdAt | LocalDateTime | NOT NULL, 자동 생성 | 발급 일시 |

### 1.3 API 응답 모델 (UserResponse)

```json
{
  "id": "1",
  "provider": "GOOGLE",
  "nickname": null,
  "role": "DRAFT",
  "debateGrade": "BRONZE",
  "createdAt": "2026-05-03T12:00:00",
  "updatedAt": "2026-05-03T12:00:00"
}
```

- `id`는 Long이지만 API에서는 **String으로 직렬화**한다 (프론트엔드 호환).
- `nickname`은 DRAFT 상태일 때 `null`이다.
- 시간은 서버 로컬 시각 기준 **ISO-8601** 형식이다 (`LocalDateTime`, 타임존 없음).

### 1.4 API 응답 모델 (LoginResponse)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "...": "UserResponse" }
}
```

---

## UC-1. OAuth 회원가입

### 개요

사용자가 Google 또는 Kakao OAuth 인증 후 draft 계정을 생성하고 자동 로그인한다. 닉네임은 로그인 후 별도 화면에서 설정한다.

### 액터

- 비로그인 사용자

### 사전조건

- 사용자가 Google 또는 Kakao OAuth 동의 화면을 거쳐 **인가 코드(authorization code)** 를 보유한 상태

### 사후조건

- 사용자 레코드가 DB에 생성됨 (role=DRAFT, nickname=null)
- AccessToken, RefreshToken 발급 (자동 로그인)
- 프론트엔드: 닉네임 입력 화면으로 이동

### API 명세

```
POST /api/auth/signup
Content-Type: application/json

요청 본문:
{
  "provider": "GOOGLE" | "KAKAO",
  "code": "oauth-authorization-code"
}

성공 응답: 201 Created
→ LoginResponse

실패 응답:
→ 409 Conflict (OAuth 계정 중복)
→ 401 Unauthorized (OAuth 인가 코드 무효)
→ 400 Bad Request (입력값 검증 실패)
```

### 기본 흐름 (Happy Path)

```
1. 사용자 → [POST /api/auth/signup] { provider, code }
2. 서버: 입력값 검증 (provider, code 형식)
3. 서버 → OAuth 제공자: 인가 코드로 액세스 토큰 교환
4. 서버 → OAuth 제공자: 액세스 토큰으로 사용자 정보 조회 (oauthId)
5. 서버: (provider + oauthId) 조합으로 기존 가입 여부 확인 → 없음
6. 서버: User 엔티티 생성
   - provider, oauthId ← OAuth 응답
   - nickname ← null
   - role ← DRAFT (기본값)
   - debateGrade ← BRONZE (기본값)
   - createdAt, updatedAt ← 현재 시각
7. 서버: DB 저장
8. 서버: AccessToken + RefreshToken 생성 (자동 로그인)
   - AccessToken: subject=userId, role=DRAFT, 유효기간 30분, HMAC-SHA256
   - RefreshToken: 유효기간 14일, DB 저장
9. 서버 → 사용자: 201 Created + LoginResponse
```

### 대안 흐름

| ID | 조건 | 에러 코드 | 응답 | 메시지 |
|----|------|-----------|------|--------|
| AF-1 | 동일 OAuth 계정(provider + oauthId)으로 이미 가입됨 | AUTH_002 | 409 Conflict | "이미 가입된 OAuth 계정입니다." |
| AF-2 | OAuth 인가 코드가 무효/만료 | AUTH_003 | 401 Unauthorized | "OAuth 인증에 실패했습니다." |
| AF-3 | provider 값이 GOOGLE/KAKAO가 아님 | COMMON_001 | 400 Bad Request | "provider는 GOOGLE 또는 KAKAO만 허용됩니다." |
| AF-4 | code 누락 또는 빈 문자열 | COMMON_001 | 400 Bad Request | "OAuth 인증 코드는 필수입니다." |

### 비즈니스 규칙

- 하나의 OAuth 계정(provider + oauthId)으로 한 번만 가입 가능
- 가입 완료 후 즉시 자동 로그인 (AccessToken + RefreshToken 발급)
- 신규 사용자는 DRAFT 상태로 시작 — 닉네임 설정 후 USER로 전환 (추후 개발)
- 신규 사용자의 토론 등급은 BRONZE로 시작
- 프로필 이미지는 이름 기반 썸네일로 프론트엔드에서 표시 (서버 저장 없음)

### 검증 규칙

| 필드 | 규칙 | 비고 |
|------|------|------|
| provider | 필수, `GOOGLE` 또는 `KAKAO`만 허용 | enum 매핑 |
| code | 필수, 빈 문자열 불가 | OAuth 인가 코드 |

---

## UC-2. OAuth 로그인

### 개요

가입이 완료된 사용자가 OAuth 인증 후 AccessToken, RefreshToken을 발급받아 인증된 상태로 전환한다.

### 액터

- 가입 완료된 비로그인 사용자

### 사전조건

- UC-1을 통해 회원가입이 완료된 OAuth 계정 보유
- OAuth 동의 화면을 거쳐 인가 코드를 보유한 상태

### 사후조건

- AccessToken, RefreshToken 발급됨
- 프론트엔드: localStorage에 토큰 저장
- DRAFT 상태 사용자 → 닉네임 입력 화면으로 이동
- USER/ADMIN 상태 사용자 → 서비스 메인 화면으로 이동

### API 명세

```
POST /api/auth/login
Content-Type: application/json

요청 본문:
{
  "provider": "GOOGLE" | "KAKAO",
  "code": "oauth-authorization-code"
}

성공 응답: 200 OK
→ LoginResponse

실패 응답:
→ 401 Unauthorized (미가입 사용자 또는 OAuth 인증 실패)
→ 400 Bad Request (입력값 검증 실패)
```

### 기본 흐름 (Happy Path)

```
1. 사용자 → [POST /api/auth/login] { provider, code }
2. 서버: 입력값 검증 (provider, code)
3. 서버 → OAuth 제공자: 인가 코드로 액세스 토큰 교환
4. 서버 → OAuth 제공자: 액세스 토큰으로 사용자 정보 조회 (oauthId)
5. 서버: (provider + oauthId)로 기존 사용자 조회 → 존재함
6. 서버: AccessToken + RefreshToken 생성
   - AccessToken: subject=userId, role, 유효기간 30분, HMAC-SHA256
   - RefreshToken: 유효기간 14일, DB 저장 (기존 토큰 교체)
7. 서버 → 사용자: 200 OK + LoginResponse
```

### 대안 흐름

| ID | 조건 | 에러 코드 | 응답 | 메시지 |
|----|------|-----------|------|--------|
| AF-1 | (provider + oauthId)에 해당하는 사용자가 없음 (미가입) | AUTH_004 | 401 Unauthorized | "가입되지 않은 사용자입니다. 먼저 회원가입을 해주세요." |
| AF-2 | OAuth 인가 코드가 무효/만료 | AUTH_003 | 401 Unauthorized | "OAuth 인증에 실패했습니다." |
| AF-3 | provider 값이 유효하지 않음 | COMMON_001 | 400 Bad Request | "provider는 GOOGLE 또는 KAKAO만 허용됩니다." |
| AF-4 | code 누락 또는 빈 문자열 | COMMON_001 | 400 Bad Request | "OAuth 인증 코드는 필수입니다." |

### 비즈니스 규칙

- 가입된 사용자만 로그인 가능 — 미가입 시 회원가입 유도
- DRAFT, USER, ADMIN 모든 role 로그인 가능
- JWT는 Stateless — AccessToken에는 서버 세션 저장 없음
- AccessToken 페이로드: userId, role (최소 정보 원칙)
- AccessToken 유효기간: 30분
- RefreshToken 유효기간: 14일 (DB 저장, 무효화 가능)
- 로그인 시 기존 RefreshToken 교체 (중복 세션 방지)

### 검증 규칙

| 필드 | 규칙 |
|------|------|
| provider | 필수, `GOOGLE` 또는 `KAKAO` |
| code | 필수, 빈 문자열 불가 |

---

## UC-3. 로그아웃

### 개요

로그인된 사용자가 인증 상태를 종료하고 RefreshToken을 무효화한다.

### 액터

- 로그인된 사용자

### 사전조건

- 유효한 AccessToken 보유

### 사후조건

- DB에서 해당 사용자의 RefreshToken 삭제
- 프론트엔드에서 localStorage의 토큰 삭제
- 초기 화면(홈)으로 이동

### API 명세

```
POST /api/auth/logout
Authorization: Bearer {accessToken}

성공 응답: 204 No Content (본문 없음)
```

### 기본 흐름

```
1. 사용자 → [POST /api/auth/logout] (Authorization: Bearer {accessToken})
2. 서버: AccessToken 검증 → userId 추출
3. 서버: userId에 해당하는 사용자 존재 여부 확인 → 존재함
4. 서버: DB에서 userId에 해당하는 RefreshToken 삭제
5. 서버 → 사용자: 204 No Content
6. 프론트엔드: localStorage에서 토큰 삭제
7. 프론트엔드: 초기 화면으로 이동
```

### 대안 흐름

| ID | 조건 | 에러 코드 | 응답 | 메시지 |
|----|------|-----------|------|--------|
| AF-1 | AccessToken 없음 또는 유효하지 않음 | AUTH_005 | 401 Unauthorized | "인증이 필요합니다." |
| AF-2 | userId에 해당하는 사용자가 존재하지 않음 | AUTH_004 | 401 Unauthorized | "가입되지 않은 사용자입니다. 먼저 회원가입을 해주세요." |

### 비즈니스 규칙

- 서버는 AccessToken을 검증하여 userId를 추출하고, 해당 사용자가 존재하는지 확인한다
- 로그아웃 시 DB에서 RefreshToken을 삭제하여 서버 측 무효화 처리
- 로그아웃 후 기존 RefreshToken으로 토큰 갱신 시도 → 실패 (UC-4 AF-1)

---

## UC-4. 토큰 갱신

### 개요

AccessToken이 만료된 사용자가 RefreshToken으로 새 AccessToken과 RefreshToken을 발급받는다.

### 액터

- 로그인된 사용자 (AccessToken 만료 상태)

### 사전조건

- 유효한 RefreshToken 보유 (DB에 존재, 만료되지 않음)

### 사후조건

- 새 AccessToken, RefreshToken 발급
- 기존 RefreshToken 무효화 (Rotation 전략)

### API 명세

```
POST /api/auth/refresh
Content-Type: application/json

요청 본문:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

성공 응답: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

실패 응답:
→ 401 Unauthorized (RefreshToken 무효/만료/로그아웃됨)
```

### 기본 흐름

```
1. 사용자 → [POST /api/auth/refresh] { refreshToken }
2. 서버: refreshToken DB 조회 → 존재함 + 미만료
3. 서버: userId, role 확인
4. 서버: 기존 RefreshToken의 토큰 값과 만료일시를 갱신 (In-place Rotation)
5. 서버: 새 AccessToken 생성
   - AccessToken: subject=userId, role, 유효기간 30분
6. 서버 → 사용자: 200 OK + { accessToken, refreshToken }
```

### 대안 흐름

| ID | 조건 | 에러 코드 | 응답 | 메시지 |
|----|------|-----------|------|--------|
| AF-1 | RefreshToken이 DB에 없음 (로그아웃됨 또는 위조) | AUTH_006 | 401 Unauthorized | "유효하지 않은 토큰입니다. 다시 로그인해주세요." |
| AF-2 | RefreshToken 만료 | AUTH_006 | 401 Unauthorized | "유효하지 않은 토큰입니다. 다시 로그인해주세요." |

### 비즈니스 규칙

- RefreshToken Rotation: 갱신 시 기존 레코드의 토큰 값과 만료일시를 새 값으로 교체 (In-place Update, 토큰 탈취 감지 목적)
- 만료되거나 DB에 없는 RefreshToken으로 갱신 시도 → 재로그인 유도

---

## 에러 코드 정의

> 상세 응답 표준은 [api-response-standard.md](../backend/api-response-standard.md)를 참고한다.

### 에러 응답 형식

```json
{
  "code": "AUTH_001",
  "message": "이미 사용 중인 닉네임입니다."
}
```

### 인증 관련 에러 코드

| 코드 | HTTP 상태 | 메시지 | 발생 유스케이스 | 처리 주체 |
|------|-----------|--------|----------------|-----------|
| AUTH_001 | 409 | 이미 사용 중인 닉네임입니다. | (추후 닉네임 설정 UC에서 사용 예약) | GlobalExceptionHandler (BusinessException) |
| AUTH_002 | 409 | 이미 가입된 OAuth 계정입니다. | UC-1 | GlobalExceptionHandler (BusinessException) |
| AUTH_003 | 401 | OAuth 인증에 실패했습니다. | UC-1, UC-2 | GlobalExceptionHandler (BusinessException) |
| AUTH_004 | 401 | 가입되지 않은 사용자입니다. 먼저 회원가입을 해주세요. | UC-2 | GlobalExceptionHandler (BusinessException) |
| AUTH_005 | 401 | 인증이 필요합니다. | (JWT AccessToken 인증 실패) | JwtAuthenticationFilter |
| AUTH_006 | 401 | 유효하지 않은 토큰입니다. 다시 로그인해주세요. | UC-4 | GlobalExceptionHandler (BusinessException) |
| COMMON_001 | 400 | (첫 번째 필드 에러 메시지) | UC-1, UC-2, UC-4 | GlobalExceptionHandler (MethodArgumentNotValidException) |
| COMMON_002 | 500 | 서버 오류가 발생했습니다. | (미처리 예외 폴백) | GlobalExceptionHandler (Exception) |

---

## 기술 구현 방향

### 인증 아키텍처

```
┌─────────────┐     인가 코드      ┌──────────────┐    코드 교환     ┌──────────────┐
│  프론트엔드   │ ───────────────→ │   백엔드 API   │ ──────────────→ │ Google/Kakao │
│  (React)     │                  │  (Spring Boot) │ ←────────────── │   OAuth API  │
│              │ ←─────────────── │               │   사용자 정보     │              │
│              │  AccessToken +   │               │                 │              │
│              │  RefreshToken    └──────────────┘                 └──────────────┘
└─────────────┘
```

- **OAuth 흐름**: 프론트엔드가 OAuth 동의 화면 → 인가 코드 획득 → 백엔드에 전달 → 백엔드가 코드 교환 및 사용자 정보 조회
- **인증 방식**: Stateless JWT (AccessToken) + DB 저장 RefreshToken
- **토큰 저장**: 프론트엔드 localStorage
- **토큰 전송**: `Authorization: Bearer {accessToken}` 헤더

### JWT 토큰 관리 정책

| 구분 | AccessToken | RefreshToken |
|------|-------------|--------------|
| 유효기간 | 30분 | 14일 |
| 저장 위치 | 프론트엔드 localStorage | 프론트엔드 localStorage + DB |
| 페이로드 | userId, role | - |
| 서명 알고리즘 | HMAC-SHA256 | HMAC-SHA256 |
| 무효화 | 불가 (Stateless) | DB 삭제로 즉시 무효화 |

**갱신 정책 (RefreshToken Rotation)**:
1. AccessToken 만료 시 → `POST /api/auth/refresh` 호출
2. 서버: 기존 RefreshToken 레코드의 토큰 값/만료일시 갱신 + 새 AccessToken 발급
3. Rotation으로 탈취된 RefreshToken 재사용 차단
4. RefreshToken도 만료 시 → 재로그인 필요

### 추가 의존성

| 라이브러리 | 용도 |
|-----------|------|
| jjwt (io.jsonwebtoken) | JWT 생성/검증 |
| spring-boot-starter-webflux | WebClient (OAuth API 호출용 HTTP 클라이언트) |
| spring-boot-starter-validation | 요청 DTO 검증 (@Valid, @Pattern 등) |

### 패키지 구조

```
debatechat.backend/
├── common/
│   ├── annotation/          @Implement (세부 구현 클래스 어노테이션)
│   ├── dto/response/        ErrorResponse
│   ├── exception/           ErrorCode, BusinessException, GlobalExceptionHandler
│   └── security/            JwtAuthenticationFilter, JwtAuthenticationToken, AuthUser, @CurrentUser
├── config/                  SecurityConfig, WebConfig(CORS), WebClientConfig
├── presentation/auth/
│   ├── controller/          AuthController
│   └── dto/                 SignupRequest, LoginRequest, TokenRefreshRequest,
│                            LoginResponse, TokenRefreshResponse, UserResponse
├── domain/
│   ├── user/
│   │   ├── entity/          User, OAuthProvider(enum), DebateGrade(enum), UserRole(enum)
│   │   └── port/outbound/   UserRepository
│   └── auth/
│       ├── entity/          RefreshToken, JwtProperties, OAuthUserInfo
│       ├── port/
│       │   ├── inbound/     AuthUsecase
│       │   └── outbound/    RefreshTokenRepository, OAuthClient
│       └── service/
│           ├── AuthService (implements AuthUsecase)
│           └── implement/   JwtHandler, RefreshTokenWriter, OAuthClientFactory
└── infra/api/oauth/         GoogleOAuthClient, KakaoOAuthClient, OAuthProperties
```

### Security 설정

| 엔드포인트 | 인증 | 허용 role |
|-----------|------|----------|
| `POST /api/auth/signup` | 불필요 (permitAll) | - |
| `POST /api/auth/login` | 불필요 (permitAll) | - |
| `POST /api/auth/logout` | 필요 (authenticated) | DRAFT, USER, ADMIN |
| `POST /api/auth/refresh` | 불필요 (permitAll) | - |

- CSRF 비활성화 (Stateless API)
- 세션 정책: STATELESS
- CORS: `http://localhost:5173` (Vite 개발 서버)

### 구현 순서

| 단계 | 작업 |
|------|------|
| 1 | 의존성 추가 (build.gradle.kts) |
| 2 | 도메인 계층 — enum(OAuthProvider, DebateGrade, UserRole), User 엔티티, RefreshToken 엔티티, 각 Repository |
| 3 | 설정 — JwtProperties, OAuthProperties, application-local.yml, test application.yml |
| 4 | 서비스 계층 — JwtHandler, OAuth 클라이언트(Google/Kakao), OAuthClientFactory, RefreshTokenWriter, AuthService |
| 5 | DTO — request(Signup/Login/TokenRefresh), response(User/Login/TokenRefresh/Error) |
| 6 | 예외 처리 — BusinessException(`throw new BusinessException(ErrorCode.XXX)`), GlobalExceptionHandler |
| 7 | Security — JwtAuthenticationFilter, JwtAuthenticationToken, SecurityConfig 재작성, WebConfig |
| 8 | 컨트롤러 — AuthController |
| 9 | 테스트 작성 + `./gradlew test` 전체 통과 확인 |

---

## 테스트 검증 케이스

### 테스트 원칙

- 각 유스케이스의 **기본 흐름(Happy Path)** 과 **모든 대안 흐름(AF)** 을 테스트한다.
- 대안 흐름의 조건, 에러 코드, HTTP 상태, 메시지는 각 UC의 대안 흐름 테이블을 기준으로 검증한다 (여기서 중복 정의하지 않음).
- 코드의 단위(하나의 기능을 담당하는 단위)를 정의하고 단위 테스트를 진행한다.

### 테스트 단위 정의

| 테스트 단위 | 대상 클래스 | 테스트 범위 |
|------------|-----------|------------|
| JWT 토큰 생성/검증 | JwtHandler | AccessToken 생성, 페이로드(userId, role) 검증, 만료 토큰 거부, 위조 토큰 거부 |
| OAuth 코드 교환 | GoogleOAuthClient, KakaoOAuthClient | 인가 코드 → 액세스 토큰 교환, 사용자 정보(oauthId) 조회, 무효 코드 시 예외 발생 |
| 회원가입 비즈니스 로직 | AuthService#signup | UC-1 기본 흐름 + 모든 대안 흐름 (AF-1~AF-4) |
| 로그인 비즈니스 로직 | AuthService#login | UC-2 기본 흐름 + 모든 대안 흐름 (AF-1~AF-4), RefreshToken 교체 확인 |
| 로그아웃 비즈니스 로직 | AuthService#logout | UC-3 기본 흐름 + 대안 흐름 (AF-1), DB RefreshToken 삭제 확인 |
| 토큰 갱신 비즈니스 로직 | AuthService#refresh | UC-4 기본 흐름 + 모든 대안 흐름 (AF-1~AF-2), Rotation 후 기존 토큰 재사용 차단 확인 |
| API 통합 테스트 | AuthController | 각 엔드포인트의 HTTP 요청/응답 검증, 입력값 검증(@Valid) 동작 확인, Security 인증 필터 동작 확인 |
