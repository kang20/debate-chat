# [Feature] WebSocket 기반 실시간 채팅 메시지 (Discord/Slack 스타일)

## 배경 / 동기

토론방 안에서 사용자들이 **실시간으로 의견을 주고받는 흐름**이 서비스의 즉시성과 몰입도를 결정합니다. Discord/Slack에서 채널 안의 메시지 스트림이 핵심이듯, `debate-chat`에서도 토론방의 1차 인터랙션은 채팅이어야 합니다. (논거 트리는 별도 이슈 #04에서 다룸 — 이쪽은 "흐르는 대화" 스트림.)

## 요구사항 (User Stories)

- 토론방 참여자로서, 메시지를 **실시간**으로 보내고 받을 수 있어야 한다.
- 사용자로서, 내가 입장(PRO/CON/NEUTRAL)한 게 메시지에 **표시**되어야 한다.
- 사용자로서, 토론방에 들어가면 **최근 메시지 N개**를 즉시 보고 위로 스크롤하면 더 불러올 수 있어야 한다 (페이지네이션).
- 사용자로서, 내가 보낸 메시지를 **수정/삭제**할 수 있어야 한다 (작성자 본인만).
- 사용자로서, **누가 지금 타이핑 중인지** 알고 싶다 (typing indicator) — 선택 사항.

## 수용 기준 (Acceptance Criteria)

- [ ] `Message` 엔티티: `id`, `roomId`, `authorId`, `content`, `sideAtSend`(PRO/CON/NEUTRAL, 발신 시점 스냅샷), `createdAt`, `editedAt`, `deleted`(soft delete)
- [ ] STOMP over WebSocket 엔드포인트 `/ws` 등록
- [ ] 구독 채널: `/topic/rooms/{roomId}` — 새 메시지 / 수정 / 삭제 이벤트 브로드캐스트
- [ ] 발신 채널: `/app/rooms/{roomId}/send` — 메시지 발신
- [ ] 인증: WebSocket 핸드셰이크에서 JWT 검증, 비참여자는 발신 불가
- [ ] REST `GET /api/rooms/{id}/messages?cursor=...&size=50` — 커서 기반 페이지네이션
- [ ] REST `PATCH /api/messages/{id}` — 작성자 본인만 30분 내 수정 (정책은 협의)
- [ ] REST `DELETE /api/messages/{id}` — 작성자 또는 방장 (소프트 삭제: `[삭제된 메시지]`로 표시)
- [ ] 통합 테스트: 두 사용자 동시 접속 → A가 발신 → B의 구독 콜백에서 수신 검증

## 기술 노트

- Spring WebSocket + STOMP (별도 의존성 추가 필요: `spring-boot-starter-websocket`).
- 1차 구현은 **단일 노드 in-memory 브로커**, 추후 Redis/Kafka pub-sub으로 수평 확장 가능.
- 메시지 본문은 길이 제한(예: 4000자) 및 trim, 빈 메시지 거부.
- typing indicator는 별도 channel `/topic/rooms/{id}/typing`로 분리, 메시지 저장 X.
- `sideAtSend` 스냅샷은 사용자가 입장을 바꿔도 과거 메시지의 입장 표시가 유지되도록 함.

## 의존 관계

- 선행: #01 (Auth), #02 (Debate Room & Participant)

## 우선순위

P0 — "채팅" 절반의 핵심.
