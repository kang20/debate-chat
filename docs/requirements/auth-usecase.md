# 인증 기능 유스케이스 명세

> 비즈니스 요구사항(섹션 1. 사용자 및 인증)을 기반으로, 회원가입/로그인/로그아웃 기능의 흐름, 제한사항, 검증 규칙, 비즈니스 규칙을 정의한다.
>
> **범위**: 회원가입, 로그인, 로그아웃 (프로필 조회/수정, 사용자 공개 조회는 추후 개발)

---

## 목차

1. [도메인 모델](#1-도메인-모델)
2. [UC-1. OAuth 회원가입](#uc-1-oauth-회원가입)
3. [UC-2. OAuth 로그인](#uc-2-oauth-로그인)
4. [UC-3. 로그아웃](#uc-3-로그아웃)
5. [에러 코드 정의](#에러-코드-정의)
6. [기술 구현 방향](#기술-구현-방향)

---

## 1. 도메인 모델

### 1.1 User 엔티티

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, AUTO_INCREMENT | 내부 식별자 (API 응답 시 String 변환) |
| provider | enum(GOOGLE, KAKAO) | NOT NULL | OAuth 제공자 |
| oauthId | String(255) | NOT NULL | OAuth 제공자의 고유 사용자 ID |
| nickname | String(20) | NOT NULL, UNIQUE | 서비스 내 표시 이름 |
| avatarUrl | String(512) | 기본값 "" | 프로필 이미지 URL |
| debateGrade | enum(BRONZE, SILVER, GOLD) | NOT NULL, 기본값 BRONZE | 토론 등급 |
| createdAt | Instant | NOT NULL, 자동 생성 | 가입일시 |
| updatedAt | Instant | NOT NULL, 자동 갱신 | 최종 수정일시 |

**복합 유니크 제약**: `(provider, oauthId)` — 동일 OAuth 계정 중복 가입 방지

### 1.2 API 응답 모델 (UserResponse)

```json
{
  "id": "1",
  "provider": "GOOGLE",
  "nickname": "김토론",
  "avatarUrl": "https://...",
  "debateGrade": "BRONZE",
  "createdAt": "2026-05-03T12:00:00Z",
  "updatedAt": "2026-05-03T12:00:00Z"
}
```

- `id`는 Long이지만 API에서는 **String으로 직렬화**한다 (프론트엔드 호환).
- 시간은 **ISO-8601** 형식이다.

---

## UC-1. OAuth 회원가입

### 개요

사용자가 Google 또는 Kakao OAuth 인증 후 닉네임을 입력하여 신규 계정을 생성한다.

### 액터

- 비로그인 사용자

### 사전조건

- 사용자가 Google 또는 Kakao OAuth 동의 화면을 거쳐 **인가 코드(authorization code)** 를 보유한 상태

### 사후조건

- 사용자 레코드가 DB에 생성됨
- 로그인 화면으로 이동 (자동 로그인 **안 함**)

### API 명세

```
POST /api/auth/signup
Content-Type: application/json

요청 본문:
{
  "provider": "GOOGLE" | "KAKAO",
  "code": "oauth-authorization-code",
  "nickname": "김토론"
}

성공 응답: 201 Created
→ UserResponse

실패 응답:
→ 409 Conflict (닉네임 중복 또는 OAuth 계정 중복)
→ 401 Unauthorized (OAuth 인가 코드 무효)
→ 400 Bad Request (입력값 검증 실패)
```

### 기본 흐름 (Happy Path)

```
1. 사용자 → [POST /api/auth/signup] { provider, code, nickname }
2. 서버: 입력값 검증 (provider, code, nickname 형식)
3. 서버 → OAuth 제공자: 인가 코드로 액세스 토큰 교환
4. 서버 → OAuth 제공자: 액세스 토큰으로 사용자 정보 조회 (oauthId, profileImage)
5. 서버: (provider + oauthId) 조합으로 기존 가입 여부 확인 → 없음
6. 서버: nickname 고유성 확인 → 사용 가능
7. 서버: User 엔티티 생성
   - provider, oauthId ← OAuth 응답
   - nickname ← 요청 본문
   - avatarUrl ← OAuth profileImage (없으면 "")
   - debateGrade ← BRONZE (기본값)
   - createdAt, updatedAt ← 현재 시각
8. 서버: DB 저장
9. 서버 → 사용자: 201 Created + UserResponse
```

### 대안 흐름

| ID | 조건 | 응답 | 메시지 |
|----|------|------|--------|
| AF-1 | 닉네임이 이미 사용 중 | 409 Conflict | "이미 사용 중인 닉네임입니다." |
| AF-2 | 동일 OAuth 계정(provider + oauthId)으로 이미 가입됨 | 409 Conflict | "이미 가입된 OAuth 계정입니다." |
| AF-3 | OAuth 인가 코드가 무효/만료 | 401 Unauthorized | "OAuth 인증에 실패했습니다." |
| AF-4 | provider 값이 GOOGLE/KAKAO가 아님 | 400 Bad Request | "provider는 GOOGLE 또는 KAKAO만 허용됩니다." |
| AF-5 | code 누락 또는 빈 문자열 | 400 Bad Request | "OAuth 인증 코드는 필수입니다." |
| AF-6 | nickname 형식 불일치 | 400 Bad Request | "닉네임은 2~20자 한글/영문/숫자만 허용됩니다." |

### 비즈니스 규칙

- 하나의 OAuth 계정(provider + oauthId)으로 한 번만 가입 가능
- 닉네임은 시스템 전체에서 고유해야 함
- 가입 완료 후 자동 로그인하지 않음 — 별도 로그인 필요
- 신규 사용자의 토론 등급은 BRONZE로 시작
- 아바타 이미지는 OAuth 제공자의 프로필 이미지를 기본값으로 사용

### 검증 규칙

| 필드 | 규칙 | 비고 |
|------|------|------|
| provider | 필수, `GOOGLE` 또는 `KAKAO`만 허용 | enum 매핑 |
| code | 필수, 빈 문자열 불가 | OAuth 인가 코드 |
| nickname | 필수, 정규식 `^[가-힣a-zA-Z0-9]{2,20}$` | 한글/영문/숫자만, 2~20자 |

---

## UC-2. OAuth 로그인

### 개요

가입이 완료된 사용자가 OAuth 인증 후 JWT 토큰을 발급받아 인증된 상태로 전환한다.

### 액터

- 가입 완료된 비로그인 사용자

### 사전조건

- UC-1을 통해 회원가입이 완료된 OAuth 계정 보유
- OAuth 동의 화면을 거쳐 인가 코드를 보유한 상태

### 사후조건

- JWT 토큰 발급됨
- 프론트엔드에서 localStorage에 토큰 저장
- 헤더에 닉네임 + 아바타 표시

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
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ...UserResponse }
}

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
6. 서버: JWT 토큰 생성
   - subject: userId
   - 유효기간: 24시간
   - 서명: HMAC-SHA256
7. 서버 → 사용자: 200 OK + { token, user }
```

### 대안 흐름

| ID | 조건 | 응답 | 메시지 |
|----|------|------|--------|
| AF-1 | (provider + oauthId)에 해당하는 사용자가 없음 (미가입) | 401 Unauthorized | "가입되지 않은 사용자입니다. 먼저 회원가입을 해주세요." |
| AF-2 | OAuth 인가 코드가 무효/만료 | 401 Unauthorized | "OAuth 인증에 실패했습니다." |
| AF-3 | provider 값이 유효하지 않음 | 400 Bad Request | "provider는 GOOGLE 또는 KAKAO만 허용됩니다." |
| AF-4 | code 누락 또는 빈 문자열 | 400 Bad Request | "OAuth 인증 코드는 필수입니다." |

### 비즈니스 규칙

- 가입된 사용자만 로그인 가능 — 미가입 시 회원가입 유도
- JWT는 Stateless — 서버 측 세션 저장 없음
- 토큰에는 userId만 포함 (최소 정보 원칙)
- 토큰 유효기간은 24시간

### 검증 규칙

| 필드 | 규칙 |
|------|------|
| provider | 필수, `GOOGLE` 또는 `KAKAO` |
| code | 필수, 빈 문자열 불가 |

---

## UC-3. 로그아웃

### 개요

로그인된 사용자가 인증 상태를 종료한다.

### 액터

- 로그인된 사용자

### 사전조건

- 유효한 JWT 토큰 보유

### 사후조건

- 프론트엔드에서 localStorage의 토큰 삭제
- 초기 화면(홈)으로 이동

### API 명세

```
POST /api/auth/logout

성공 응답: 204 No Content (본문 없음)
```

### 기본 흐름

```
1. 사용자 → [POST /api/auth/logout]
2. 서버: 204 No Content 반환
3. 프론트엔드: localStorage에서 토큰 삭제
4. 프론트엔드: 초기 화면으로 이동
```

### 비즈니스 규칙

- Stateless JWT이므로 서버 측 토큰 무효화 처리 없음
- 토큰 폐기 책임은 프론트엔드에 있음
- 향후 토큰 블랙리스트가 필요하면 이 엔드포인트에서 처리

### 제한사항

- 서버는 토큰 유효성을 검증하지 않고 항상 204를 반환한다.
- 이미 만료된 토큰으로 로그아웃해도 정상 처리된다.

---

## 에러 코드 정의

> 상세 응답 표준은 [api-response-standard.md](./api-response-standard.md)를 참고한다.

### 에러 응답 형식

```json
{
  "code": "AUTH_001",
  "message": "이미 사용 중인 닉네임입니다."
}
```

### 인증 관련 에러 코드

| 코드 | HTTP 상태 | 메시지 | 발생 유스케이스 |
|------|-----------|--------|----------------|
| AUTH_001 | 409 | 이미 사용 중인 닉네임입니다. | UC-1 |
| AUTH_002 | 409 | 이미 가입된 OAuth 계정입니다. | UC-1 |
| AUTH_003 | 401 | OAuth 인증에 실패했습니다. | UC-1, UC-2 |
| AUTH_004 | 401 | 가입되지 않은 사용자입니다. 먼저 회원가입을 해주세요. | UC-2 |
| AUTH_005 | 401 | 인증이 필요합니다. | (JWT 인증 실패) |
| COMMON_001 | 400 | (필드별 메시지) | UC-1, UC-2 |

---

## 기술 구현 방향

### 인증 아키텍처

```
┌─────────────┐     인가 코드      ┌──────────────┐    코드 교환     ┌──────────────┐
│  프론트엔드   │ ───────────────→ │   백엔드 API   │ ──────────────→ │ Google/Kakao │
│  (React)     │                  │  (Spring Boot) │ ←────────────── │   OAuth API  │
│              │ ←─────────────── │               │   사용자 정보     │              │
│              │   JWT + User     │               │                 │              │
└─────────────┘                  └──────────────┘                 └──────────────┘
```

- **OAuth 흐름**: 프론트엔드가 OAuth 동의 화면 → 인가 코드 획득 → 백엔드에 전달 → 백엔드가 코드 교환 및 사용자 정보 조회
- **인증 방식**: Stateless JWT (서버 세션 없음)
- **토큰 저장**: 프론트엔드 localStorage
- **토큰 전송**: `Authorization: Bearer {token}` 헤더

### 추가 의존성

| 라이브러리 | 용도 |
|-----------|------|
| jjwt (io.jsonwebtoken) | JWT 생성/검증 |
| spring-boot-starter-webflux | WebClient (OAuth API 호출용 HTTP 클라이언트) |
| spring-boot-starter-validation | 요청 DTO 검증 (@Valid, @Pattern 등) |

### 패키지 구조

```
debatechat.backend/
├── config/         SecurityConfig, WebConfig(CORS), JwtProperties, OAuthProperties
├── domain/user/    User(엔티티), OAuthProvider(enum), DebateGrade(enum)
├── repository/     UserRepository
├── service/        AuthService, JwtService
├── service/oauth/  OAuthClient(인터페이스), GoogleOAuthClient, KakaoOAuthClient,
│                   OAuthClientFactory, OAuthUserInfo(record)
├── controller/     AuthController
├── dto/request/    SignupRequest, LoginRequest
├── dto/response/   UserResponse, LoginResponse, ErrorResponse
├── exception/      GlobalExceptionHandler, 커스텀 예외 4종
└── security/       JwtAuthenticationFilter, JwtAuthenticationToken
```

### Security 설정

| 엔드포인트 | 인증 |
|-----------|------|
| `POST /api/auth/signup` | 불필요 (permitAll) |
| `POST /api/auth/login` | 불필요 (permitAll) |
| `POST /api/auth/logout` | 필요 (authenticated) |

- CSRF 비활성화 (Stateless API)
- 세션 정책: STATELESS
- CORS: `http://localhost:5173` (Vite 개발 서버)

### 구현 순서

| 단계 | 작업 |
|------|------|
| 1 | 의존성 추가 (build.gradle.kts) |
| 2 | 도메인 계층 — enum(OAuthProvider, DebateGrade), User 엔티티, UserRepository |
| 3 | 설정 — JwtProperties, OAuthProperties, application-local.yml, test application.yml |
| 4 | 서비스 계층 — JwtService, OAuth 클라이언트(Google/Kakao), AuthService |
| 5 | DTO — request(Signup/Login), response(User/Login/Error) |
| 6 | 예외 처리 — 커스텀 예외 4종, GlobalExceptionHandler |
| 7 | Security — JwtAuthenticationFilter, JwtAuthenticationToken, SecurityConfig 재작성, WebConfig |
| 8 | 컨트롤러 — AuthController |
| 9 | 테스트 작성 + `./gradlew test` 전체 통과 확인 |
