# [Feature] 토론방(Debate Room) 도메인 — 생성 · 조회 · 입장 · 태그

## 배경 / 동기

서비스의 핵심 단위는 "토론방"입니다. Reddit의 *post*, Kialo의 *discussion*, Discord의 *channel*을 합친 형태이며, 다음 요건을 동시에 만족해야 합니다.

- 하나의 **명확한 주제(topic)** 를 가짐 — *Kialo 스타일*
- 사용자는 **찬성 / 반대 / 중립** 중 한 입장을 선택해서 참여 — *Kialo 스타일*
- 입장과 무관하게 **실시간 채팅**이 흘러감 — *Discord/Slack 스타일*
- **태그 / 카테고리**로 발견 가능 — *Reddit 스타일*

이 도메인이 잡혀야 후속 기능(메시지, 논거 트리, 투표)이 모두 "어느 토론방에 붙는지" 라는 컨텍스트를 가질 수 있습니다.

## 요구사항 (User Stories)

- 사용자로서, 주제·설명·태그·공개여부를 정해 **토론방을 만들고** 싶다.
- 사용자로서, 토론방에 **찬성/반대/중립** 중 하나로 **입장(join)** 하고 싶다.
- 사용자로서, 태그·키워드로 **토론방 목록을 검색·필터**하고 싶다.
- 사용자로서, 내가 만든/참여 중인 토론방을 **모아 볼 수** 있어야 한다.
- 방장으로서, 토론방을 **종료(close)** 하거나 설정을 수정할 수 있어야 한다.

## 수용 기준 (Acceptance Criteria)

- [ ] `DebateRoom` 엔티티: `id`, `title`, `description`, `ownerId`, `visibility`(PUBLIC/PRIVATE), `status`(OPEN/CLOSED), `createdAt`, `closedAt`
- [ ] `Tag` 엔티티 + `DebateRoomTag` 매핑 테이블 (N:M)
- [ ] `RoomParticipant` 엔티티: `roomId`, `userId`, `side`(PRO/CON/NEUTRAL), `joinedAt` — `(roomId, userId)` unique
- [ ] `POST /api/rooms` — 토론방 생성
- [ ] `GET /api/rooms` — 페이지네이션 + `tag`, `q`(키워드), `status` 필터
- [ ] `GET /api/rooms/{id}` — 상세 (참여자 수 / 입장별 카운트 포함)
- [ ] `PATCH /api/rooms/{id}` — 방장만 가능 (제목/설명/태그/공개여부)
- [ ] `POST /api/rooms/{id}/participants` — `{ side: "PRO" | "CON" | "NEUTRAL" }`
- [ ] `DELETE /api/rooms/{id}/participants/me` — 입장 철회
- [ ] `POST /api/rooms/{id}/close` — 방장 권한
- [ ] 통합 테스트: 생성 → 두 사용자 PRO/CON 입장 → 카운트 검증

## 기술 노트

- `visibility = PRIVATE`는 초대 또는 링크 기반 접근 — 1차 구현은 단순화하고 별도 이슈로 확장 가능.
- 방장 변경, 참여자 강퇴는 **모더레이션 이슈**로 분리.
- 검색은 1차로 LIKE 기반 → 후속 이슈에서 풀텍스트/Elasticsearch 검토.
- `Tag`는 lower-case 정규화로 중복 방지.

## 의존 관계

- 선행: #01 (Auth & User)

## 우선순위

P0 — 도메인 핵심.
