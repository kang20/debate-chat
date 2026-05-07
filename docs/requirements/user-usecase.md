# 사용자 기능 유스케이스 명세 (v3)

> **범위**: 닉네임 설정(DRAFT→USER), 닉네임 수정, 내 프로필 조회, 사용자 공개 프로필 조회
>
> **전제**: 인증(회원가입/로그인/로그아웃/토큰 갱신)은 [auth-usecase.md](./auth-usecase.md) 참조

---

## 1. 도메인 모델

### User 닉네임 제약

| 필드 | 타입 | 제약조건 |
|------|------|----------|
| nickname | String(20) | UNIQUE, NULLABLE (DRAFT 상태에서는 null) |
| role | enum(ADMIN, USER, DRAFT) | 닉네임 설정 완료 시 DRAFT → USER 전환 |

### 닉네임 검증 규칙

| 항목 | 규칙 |
|------|------|
| 길이 | 2자 이상 20자 이하 |
| 허용 문자 | 한글, 영문자(대·소문자), 숫자 |
| 금지 문자 | 특수문자, 공백 |
| 고유성 | 서비스 전체에서 중복 불가 |
| 정규식 | `^[가-힣a-zA-Z0-9]{2,20}$` |

### 응답 타입 정의

**UserResponse** — 인증된 본인 전용 응답

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | 사용자 고유 ID |
| provider | String | OAuth 제공자 (GOOGLE \| KAKAO) |
| nickname | String \| null | 닉네임 (DRAFT이면 null) |
| role | String | 역할 (ADMIN \| USER \| DRAFT) |
| debateGrade | String | 토론 등급 (BRONZE \| SILVER \| GOLD) |
| createdAt | LocalDateTime | 가입 일시 |

**PublicUserResponse** — 공개 프로필 응답 (provider·role 비노출)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | 사용자 고유 ID |
| nickname | String | 닉네임 |
| debateGrade | String | 토론 등급 (BRONZE \| SILVER \| GOLD) |
| createdAt | LocalDateTime | 가입 일시 |

---

## UC-5. 닉네임 설정 (DRAFT → USER 전환)

**액터**: DRAFT 역할의 로그인된 사용자

```
POST /api/users/me/nickname
Authorization: Bearer {accessToken}   (role=DRAFT 필요)
{ "nickname": "토론왕" }

200 OK →
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "1",
    "provider": "GOOGLE",
    "nickname": "토론왕",
    "role": "USER",
    "debateGrade": "BRONZE",
    "createdAt": "2026-05-07T12:00:00"
  }
}
401    → 미인증
403    → 이미 USER/ADMIN (USER_001)
409    → 닉네임 중복 (AUTH_001)
400    → 형식 위반 / 필드 누락 (COMMON_001)
```

| ID | 조건 | 에러 코드 | 상태 |
|----|------|-----------|------|
| AF-1 | role이 USER 또는 ADMIN | USER_001 | 403 |
| AF-2 | 닉네임 중복 | AUTH_001 | 409 |
| AF-3 | 형식 위반 | COMMON_001 | 400 |
| AF-4 | 필드 누락·빈 문자열 | COMMON_001 | 400 |
| AF-5 | 토큰 없음·유효하지 않음 | AUTH_005 | 401 |

**비즈니스 규칙**
- DRAFT 상태만 사용 가능. 설정 완료 시 role=USER로 전환하며 새 AccessToken 발급.

---

## UC-6. 내 프로필 조회

**액터**: 로그인된 사용자 (DRAFT, USER, ADMIN)

```
GET /api/users/me
Authorization: Bearer {accessToken}

200 OK →
{
  "id": "1",
  "provider": "GOOGLE",
  "nickname": "토론왕",      /* DRAFT이면 null */
  "role": "USER",
  "debateGrade": "BRONZE",
  "createdAt": "2026-05-07T12:00:00"
}
401    → 미인증 (AUTH_005)
```

| ID | 조건 | 에러 코드 | 상태 |
|----|------|-----------|------|
| AF-1 | 토큰 없음·유효하지 않음 | AUTH_005 | 401 |

**비즈니스 규칙**
- DRAFT 사용자도 조회 가능. `provider` 정보 포함.

---

## UC-7. 닉네임 수정

**액터**: USER 또는 ADMIN 역할의 로그인된 사용자

```
PATCH /api/users/me/nickname
Authorization: Bearer {accessToken}   (role=USER or ADMIN 필요)
{ "nickname": "새닉네임" }

200 OK →
{
  "id": "1",
  "provider": "GOOGLE",
  "nickname": "새닉네임",
  "role": "USER",
  "debateGrade": "BRONZE",
  "createdAt": "2026-05-07T12:00:00"
}
401    → 미인증
403    → DRAFT 역할 (USER_002)
409    → 중복 닉네임 (AUTH_001 / USER_003)
400    → 형식 위반 / 필드 누락 (COMMON_001)
```

| ID | 조건 | 에러 코드 | 상태 |
|----|------|-----------|------|
| AF-1 | role이 DRAFT | USER_002 | 403 |
| AF-2 | 현재 본인 닉네임과 동일 | USER_003 | 409 |
| AF-3 | 다른 사용자 닉네임과 중복 | AUTH_001 | 409 |
| AF-4 | 형식 위반 | COMMON_001 | 400 |
| AF-5 | 필드 누락·빈 문자열 | COMMON_001 | 400 |
| AF-6 | 토큰 없음·유효하지 않음 | AUTH_005 | 401 |

**비즈니스 규칙**
- AccessToken 페이로드에 닉네임 미포함 → 변경 시 재발급 불필요.
- 현재 닉네임과 동일 입력 시 에러 반환.

---

## UC-8. 사용자 공개 프로필 조회

**액터**: 모든 사용자 (비로그인 포함)

```
GET /api/users/{userId}

200 OK →
{
  "id": "1",
  "nickname": "토론왕",
  "debateGrade": "BRONZE",
  "createdAt": "2026-05-07T12:00:00"
}
404    → 존재하지 않는 사용자 또는 DRAFT 상태 (USER_004)
```

| ID | 조건 | 에러 코드 | 상태 |
|----|------|-----------|------|
| AF-1 | userId 미존재 | USER_004 | 404 |
| AF-2 | 대상이 DRAFT 상태 | USER_004 | 404 |

**비즈니스 규칙**
- 인증 불필요 (permitAll). DRAFT 사용자는 공개 프로필 미노출.
- `provider`, `role` 비공개.

---

## 에러 코드

| 코드 | HTTP | 메시지 | UC |
|------|------|--------|----|
| AUTH_001 | 409 | 이미 사용 중인 닉네임입니다. | UC-5, UC-7 |
| AUTH_005 | 401 | 인증이 필요합니다. | UC-5, UC-6, UC-7 |
| USER_001 | 403 | 이미 닉네임이 설정된 사용자입니다. | UC-5 |
| USER_002 | 403 | 닉네임을 먼저 설정해주세요. | UC-7 |
| USER_003 | 409 | 현재 사용 중인 닉네임과 동일합니다. | UC-7 |
| USER_004 | 404 | 존재하지 않는 사용자입니다. | UC-8 |
| COMMON_001 | 400 | (필드 에러 메시지) | UC-5, UC-7 |
