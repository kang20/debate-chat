# [Feature] Kialo 스타일 논거 트리 + 찬반 투표 (Argument Tree & Voting)

## 배경 / 동기

채팅(이슈 #03)이 "흐르는 대화"라면, 이 기능은 토론을 **구조화된 형태로 정리**하는 영역입니다. **Kialo**의 가장 큰 차별점이며, 단순한 채팅 앱과 `debate-chat`을 구분 짓는 **핵심 기능**입니다.

- 토론방의 주제를 루트(root)로 하여,
- 각 논거(argument)는 부모 논거에 대해 **PRO(지지)** 또는 **CON(반박)** 으로 연결되고,
- 사용자들은 각 논거에 대해 **얼마나 동의/비동의** 하는지 투표(또는 점수)할 수 있어야 합니다.

채팅 메시지 중 "이건 정식 논거다" 싶은 것을 **트리에 승격(promote)** 하는 흐름까지 가능하면 채팅과 토론이 자연스럽게 연결됩니다.

## 요구사항 (User Stories)

- 사용자로서, 토론방의 주제 또는 기존 논거에 **PRO/CON 자식 논거**를 추가할 수 있어야 한다.
- 사용자로서, 논거 트리를 **시각적으로 펼치고 접으며** 탐색하고 싶다 (API는 트리 구조를 반환).
- 사용자로서, 각 논거에 **동의/비동의 투표**를 한 번씩 할 수 있어야 한다 (수정 가능).
- 사용자로서, 논거의 **집계 점수**(찬성률, 가중치)를 보고 싶다.
- 방장/작성자로서, 논거를 **수정/삭제**할 수 있어야 한다 (자식이 있을 때 정책 협의).
- 사용자로서, 채팅 메시지를 **선택해서 논거로 승격**할 수 있어야 한다 (선택사항, v1에서는 단순 "출처 메시지 ID"만 보존).

## 수용 기준 (Acceptance Criteria)

- [ ] `Argument` 엔티티: `id`, `roomId`, `parentId`(nullable, null이면 root에 직접 연결), `stance`(PRO/CON), `authorId`, `content`, `sourceMessageId`(nullable), `createdAt`, `updatedAt`, `deleted`
- [ ] `ArgumentVote` 엔티티: `argumentId`, `userId`, `value`(AGREE/DISAGREE), `votedAt` — `(argumentId, userId)` unique
- [ ] `POST /api/rooms/{roomId}/arguments` — `{ parentId?, stance, content, sourceMessageId? }`
- [ ] `GET /api/rooms/{roomId}/arguments` — 트리 형태로 반환 (집계 점수 포함, 깊이 제한 파라미터 지원)
- [ ] `GET /api/arguments/{id}` — 단일 노드 + 직속 자식
- [ ] `PATCH /api/arguments/{id}` — 작성자 본인만
- [ ] `DELETE /api/arguments/{id}` — soft delete, 자식이 있는 경우 컨텐츠를 `[삭제됨]`으로 표시하되 트리 구조는 유지
- [ ] `POST /api/arguments/{id}/votes` — `{ value: "AGREE" | "DISAGREE" }`, 동일 사용자 재호출 시 갱신
- [ ] `DELETE /api/arguments/{id}/votes/me` — 투표 철회
- [ ] 집계: 자식 노드 점수까지 가중치를 적용하는 **베이지안/가중평균** 알고리즘은 1차에서는 단순 비율(찬성/총투표)로 시작하고 별도 이슈에서 정교화
- [ ] 순환 참조 방지(부모 체인에 자기 자신이 들어가지 않게)
- [ ] 통합 테스트: root 추가 → PRO 자식 추가 → CON 손자 추가 → 트리 GET 으로 깊이 2까지 검증

## 기술 노트

- 트리 조회 시 N+1 회피: 한 토론방의 모든 노드를 한 번에 SELECT 후 메모리에서 부모-자식 매핑.
- 깊이가 깊어지는 경우를 대비해 **`depth` 컬럼**을 비정규화로 저장하면 깊이 제한 쿼리가 단순해짐.
- `sourceMessageId`로 채팅과의 연결 보존 → 후속 이슈에서 "메시지에서 논거로 승격" UX 구현 가능.

## 의존 관계

- 선행: #01 (Auth), #02 (Debate Room)
- 연관: #03 (Realtime Chat — `sourceMessageId` 연결)

## 우선순위

P1 — Kialo 차별점이지만 채팅(P0)이 먼저 기반을 잡은 후 진행.
