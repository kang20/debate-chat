# [Feature] 알림 시스템 + 멘션(@) — 새 메시지 · 답글 · 논거 활동

## 배경 / 동기

Discord/Slack에서 **멘션(@user)** 과 **알림 인박스**가 없으면 협업이 안 되듯, 토론 플랫폼에서도 "내가 들어간 토론에 새 글이 달렸는지", "내 논거에 누가 반박했는지", "누가 나를 언급했는지"를 즉시 알 수 있어야 사용자가 다시 돌아옵니다. 별도 이슈로 분리한 이유는 **메시지 / 토론방 / 논거 트리**가 모두 알림의 source가 되어 횡단 관심사이기 때문입니다.

## 요구사항 (User Stories)

- 사용자로서, 채팅 메시지에 `@닉네임` 으로 다른 사용자를 **멘션**할 수 있어야 한다.
- 사용자로서, 내가 멘션되거나 / 내 논거에 답글이 달리거나 / 내가 참여한 토론방에서 새 활동이 있으면 **알림**을 받고 싶다.
- 사용자로서, 알림 목록을 **읽음 / 안읽음** 상태로 관리할 수 있어야 한다.
- 사용자로서, **알림 종류별로 on/off** (멘션만 받기, 모든 새 메시지는 끄기 등) 설정하고 싶다.
- 사용자로서, 접속해 있을 때는 알림이 **실시간 푸시**로 와야 한다.

## 수용 기준 (Acceptance Criteria)

- [ ] `Notification` 엔티티: `id`, `userId`(수신자), `type`(MENTION / REPLY / NEW_MESSAGE / ARGUMENT_REPLY / VOTE / ROOM_CLOSED), `payload`(JSON: roomId, messageId, argumentId, actorId 등), `readAt`(nullable), `createdAt`
- [ ] `NotificationPreference` 엔티티: `userId`, `type`, `enabled` — 사용자별 종류별 on/off
- [ ] 멘션 파서: 메시지 본문에서 `@닉네임` 토큰을 추출, 실제 존재하는 사용자에 한해 멘션 알림 생성 (대소문자 무시 + 한글 닉네임 지원)
- [ ] 메시지 발신 시 (이슈 #03 훅) — 토론방 참여자 중 알림 설정 켠 사용자에게 `NEW_MESSAGE` 또는 `MENTION` 생성
- [ ] 논거 추가 / 투표 시 (이슈 #04 훅) — 부모 논거 작성자에게 `ARGUMENT_REPLY` / `VOTE` 생성
- [ ] `GET /api/notifications?unreadOnly=true&cursor=...` — 페이지네이션
- [ ] `POST /api/notifications/{id}/read`
- [ ] `POST /api/notifications/read-all`
- [ ] `GET /api/notifications/preferences` / `PUT /api/notifications/preferences`
- [ ] 실시간 푸시: 사용자별 STOMP 큐 `/user/queue/notifications`에 새 알림 푸시
- [ ] 통합 테스트: A가 메시지에 `@B`를 포함해 발송 → B의 인박스에 MENTION 1건 / 다른 사용자에겐 NEW_MESSAGE만 (또는 설정에 따라 없음) 검증

## 기술 노트

- 알림 생성은 **이벤트 기반**: `MessageCreatedEvent`, `ArgumentCreatedEvent`, `VoteCastEvent` → `NotificationService`가 구독해 fan-out.
  - 동기 구현으로 시작, 트래픽 늘면 비동기(`@Async` / 메시지 큐)로 분리.
- 멘션 토큰 파싱은 한국어 닉네임 허용 — 정규식: `@([\\p{L}\\p{N}_]{2,20})` 정도, 닉네임 정책과 일치시킬 것.
- `payload`는 JSON 컬럼(MySQL `JSON` 타입) 또는 `@Convert`로 직렬화. 클라이언트 라우팅에 충분한 ID들만 담는다.
- "내가 모든 토론방의 모든 메시지로 알림 폭격당함" 방지: `NEW_MESSAGE` 기본값은 **off**, MENTION / REPLY 만 default on.

## 의존 관계

- 선행: #01 (User), #02 (Room/Participant), #03 (Message), #04 (Argument)

## 우선순위

P1 — MVP 마무리 단계의 retention 기능. #01–#04 가 구색을 갖춘 뒤 바로 붙이는 것을 권장.
