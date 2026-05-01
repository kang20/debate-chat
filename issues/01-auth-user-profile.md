# [Feature] 회원가입 · 로그인 · 프로필 도메인 (Auth & User Profile)

## 배경 / 동기

`debate-chat`은 토론과 실시간 채팅이 결합된 서비스이므로, 모든 활동(토론 참여, 발언, 논거 추가, 투표 등)은 **사용자 식별**이 전제되어야 합니다. 현재 저장소에는 `SecurityConfig`만 존재하고 사용자 도메인(엔티티, 가입, 로그인, 프로필)이 비어 있어, 후속 기능(토론방, 메시지, 논거 트리)을 만들기 전에 가장 먼저 자리잡아야 합니다.

참고 제품:

- **Discord / Slack** — 닉네임 + 아바타 + 상태 표시(presence)가 채팅 UX의 기본
- **Reddit** — username + karma처럼, 사용자 프로필이 신뢰도(추후 확장)의 근거가 됨

## 요구사항 (User Stories)

- 사용자로서, 이메일과 비밀번호로 **회원가입**하고 싶다.
- 사용자로서, 가입한 계정으로 **로그인 / 로그아웃** 하고 싶다.
- 사용자로서, 닉네임, 자기소개(bio), 아바타 URL을 가진 **프로필**을 가지고 싶다.
- 사용자로서, 다른 사용자의 **공개 프로필**을 조회할 수 있어야 한다.
- 시스템 관점에서, 인증된 사용자만 토론/메시지 API에 접근할 수 있어야 한다.

## 수용 기준 (Acceptance Criteria)

- [ ] `User` 엔티티: `id`, `email`(unique), `passwordHash`, `nickname`(unique), `bio`, `avatarUrl`, `createdAt`, `updatedAt`
- [ ] `POST /api/auth/signup` — 이메일/비밀번호/닉네임으로 가입, 비밀번호는 BCrypt로 해시
- [ ] `POST /api/auth/login` — 성공 시 JWT(access + refresh) 또는 세션 발급
- [ ] `POST /api/auth/logout`
- [ ] `GET /api/users/me` — 현재 인증된 사용자 정보
- [ ] `GET /api/users/{id}` — 공개 프로필 조회 (이메일/해시 제외)
- [ ] `PATCH /api/users/me` — 닉네임 / bio / avatarUrl 수정
- [ ] `SecurityConfig` 갱신: `/api/auth/**`는 `permitAll`, 그 외 `/api/**`는 인증 필요
- [ ] 통합 테스트: 가입 → 로그인 → `/api/users/me` 200 OK 시나리오

## 기술 노트

- 인증 방식 결정 필요: **JWT(stateless) vs Session(서버 저장)**. WebSocket 채팅까지 고려하면 JWT가 확장성에서 유리.
- `spring-boot-starter-security`는 이미 의존성에 있음.
- `BCryptPasswordEncoder` 빈 등록.
- 입력 검증을 위해 `spring-boot-starter-validation` 추가 검토.

## 예상 작업 단위

1. `User` 엔티티 + JPA 리포지토리
2. `AuthService` (signup / login / token 발급)
3. JWT 필터 (또는 세션 설정)
4. `UserController` (`/me`, `/{id}`, `PATCH /me`)
5. 보안 설정 갱신 + 테스트

## 우선순위

P0 — 다른 모든 기능의 전제조건.
