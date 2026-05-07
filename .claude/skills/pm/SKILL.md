---
name: pm
description: 프로젝트 전반을 총괄하는 PM 스킬. 문서 검색/Q&A, 비즈니스 요구사항 관리, 유스케이스 문서 작성, GitHub 이슈/PR 관리, my-TODO 태스크 관리, 자동 동기화를 통합 제공합니다.
when_to_use: 프로젝트 현황 확인, 문서 질문, 요구사항 분석, 유스케이스 작성, 이슈/PR 조회·생성, 태스크 관리, commit/PR 후 동기화가 필요할 때
argument-hint: "[status|doc|usecase|issue|task|sync] [세부 인자]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - TodoWrite
  - Bash(git *)
  - Bash(gh issue *)
  - Bash(gh pr *)
  - Bash(gh repo *)
  - Bash(cd * && node scripts/project-manager.js *)
  - Bash(cd /c/Spring_Study/todo && node_modules/electron/dist/electron.exe --no-sandbox --disable-gpu scripts/project-cli.js *)
---

# PM — 포괄적 프로젝트 매니저

GitHub Issue/PR · 문서 · 비즈니스 요구사항 · 유스케이스 · my-TODO 태스크를 하나의 스킬로 통합 관리한다.

---

## 호출 패턴

```
/pm                     # 대시보드 + 자동 동기화
/pm status              # 프로젝트 현황 대시보드
/pm doc [질문]          # 문서 검색 및 Q&A
/pm req                 # 비즈니스 요구사항 조회
/pm usecase [도메인]    # 유스케이스 문서 작성
/pm issue               # GitHub 이슈 조회/관리
/pm pr                  # GitHub PR 조회/관리
/pm task                # my-TODO 태스크 조회/관리
/pm sync                # GitHub ↔ my-TODO 수동 동기화
```

인자 없이 호출 시 → 사용자 의도를 파악하여 적절한 모드 실행

---

## 모드별 실행 절차

---

### 📊 [status] 대시보드

다음을 병렬로 수집 후 통합 보고한다.

```bash
# 1. GitHub 현황
gh issue list --repo kang20/debate-chat
gh pr list --repo kang20/debate-chat

# 2. 로컬 git 상태
git branch --show-current
git status --short
git log --oneline -3

# 3. my-TODO 현황
node scripts/project-manager.js tasks
```

**출력 형식:**

```
📊 프로젝트 대시보드 — {날짜}

🔀 Git
  브랜치: {현재 브랜치}
  미커밋: {변경 파일 수}개
  최근 커밋: {메시지}

🐛 GitHub Issues ({열린 수}개)
  #{번호} {제목} — {날짜}
  ...

📬 GitHub PRs ({열린 수}개)
  #{번호} {제목} [{상태}] — {날짜}
  ...

📋 my-TODO
  진행중: N개 | 대기: N개 | 완료: N개
  [{우선순위}] {태스크명} — {진행률}% (세부태스크: N/M 완료)
    ○ {미완료 세부태스크}
    ✓ {완료 세부태스크}
  ...
```

---

### 📖 [doc] 문서 검색 & Q&A

사용자 질문을 받아 `docs/` 전체를 탐색하여 답변한다.

#### 실행 절차

1. 질문에서 키워드 추출 (도메인, 기능, 에러 코드, UC 번호 등)
2. `docs/` 하위 파일 목록 조회 (Glob)
3. 관련 문서를 Read로 읽어 답변 구성
4. 출처 파일명과 섹션을 명시하여 답변

#### 탐색 우선순위

| 질문 유형 | 우선 탐색 문서 |
|----------|--------------|
| 요구사항 관련 | `docs/requirements/business-requirements.md` |
| 유스케이스, API, 에러 코드 | `docs/requirements/*-usecase.md` |
| 아키텍처, 테스트 | `docs/backend/` |
| 화면, UI | `docs/frontend/` |
| 전체 탐색 | `docs/**/*.md` |

**답변 형식:**

```
📖 {질문 요약}

{답변 내용}

출처: docs/requirements/{파일명} — {섹션명}
```

---

### 📋 [req] 비즈니스 요구사항 조회

`docs/requirements/business-requirements.md`를 읽어 요약 제공.

- 인자 없으면 전체 섹션 목록 + 요약
- 특정 섹션 지정 시 해당 섹션 상세 출력
- 유스케이스 문서 작성 여부도 함께 표시

---

### ✍️ [usecase] 유스케이스 문서 작성

비즈니스 요구사항 + GitHub 현황 + my-TODO를 종합하여 `docs/requirements/`에 유스케이스 문서를 작성한다.

#### Step 1: 컨텍스트 수집 (병렬)

```bash
# GitHub 현황
gh issue list --repo kang20/debate-chat
gh pr list --repo kang20/debate-chat

# git 상태
git branch --show-current
git log --oneline -5
```

동시에 Read로:
- `docs/requirements/business-requirements.md`
- `docs/requirements/*.md` (기존 UC 번호 파악)

#### Step 2: 도메인 결정

인자가 있으면 비즈니스 요구사항 섹션과 매핑.
인자가 없으면 아래 기준으로 우선순위 계산 후 AskUserQuestion 제시:

| 우선순위 | 기준 |
|---------|------|
| 높음 | 열린 GitHub 이슈와 매칭되는 도메인 |
| 높음 | 현재 브랜치명 키워드 매칭 |
| 중간 | my-TODO 진행중 태스크 연관 도메인 |
| 낮음 | 요구사항에 있으나 아직 미문서화 도메인 |

#### Step 3: UC 번호 결정

기존 문서의 모든 UC 번호를 스캔 → 최댓값 + 1 부터 시작

#### Step 4: 문서 작성 (간결 포맷)

아래 표준 포맷을 엄격히 준수한다.

````markdown
# {도메인} 유스케이스 명세 (v1)

> **범위**: {UC 목록}
> **전제**: {선행 문서 참조}

---

## 1. 도메인 모델

### {엔티티} 제약

| 필드 | 타입 | 제약조건 |
|------|------|----------|
| ...  | ...  | ...      |

### 검증 규칙 (필요 시)

| 항목 | 규칙 |
|------|------|
| ...  | ...  |

### 응답 타입 정의

**{ResponseType}** — {용도 설명}

| 필드 | 타입 | 설명 |
|------|------|------|
| id   | String | 고유 ID |
| ...  | ...  | ...  |

(비공개 필드가 있는 공개 응답 타입은 비공개 항목을 명시)

---

## UC-N. {유스케이스명}

**액터**: {액터 설명}

```
METHOD /api/{path}
Authorization: Bearer {accessToken}   ({role} 필요, 없으면 생략)
{ "field": "value" }                  (요청 본문, 없으면 생략)

200 OK →
{
  "field1": "value1",
  "field2": "value2"   /* 조건부 필드는 주석으로 설명 */
}
4xx    → {에러 설명} ({에러 코드})
```

| ID | 조건 | 에러 코드 | 상태 |
|----|------|-----------|------|
| AF-1 | {조건} | {코드} | {HTTP} |

**비즈니스 규칙**
- {규칙 1}
- {규칙 2}

---

## 에러 코드

| 코드 | HTTP | 메시지 | UC |
|------|------|--------|----|
| {코드} | {상태} | {메시지} | {UC 목록} |
````

#### 작성 원칙

- **기본 흐름(Happy Path) 서술 생략** — API 명세로 대체
- **기술 구현 방향 섹션 생략** — 코드에서 직접 관리
- **테스트 케이스 섹션 생략** — 대안 흐름 테이블로 대체
- **응답 JSON 예시 필수** — `200 OK →` 뒤에 실제 필드 목록을 JSON 블록으로 명시. 요청 없는 필드는 생략 가능
- **응답 타입 정의 테이블 필수** — 도메인 모델 섹션에 응답 타입별 필드·타입·설명 테이블 작성. 공개/비공개 구분 명시
- **응답 필드 선정 기준**: 요구사항에 명시된 항목만 포함. 내부 추적용 필드(`updatedAt` 등)는 요구사항 근거 없으면 제외
- UC 간 중복 에러 코드는 에러 코드 테이블에 한 번만 정의
- 도메인 모델은 필요한 제약조건만 간결하게 기술

#### Step 5: 파일 저장

```
docs/requirements/{도메인}-usecase.md
```

이미 파일이 존재하면 AskUserQuestion으로 덮어쓸지 확인.

#### Step 6: GitHub 이슈 연동 (이슈 본문 = 유스케이스 문서)

**유스케이스 문서는 GitHub 이슈 본문에 직접 작성·관리한다.**
댓글에 문서를 올리지 않는다. 댓글은 논의·피드백 기록 전용이다.

매칭 이슈가 없으면 → 이슈 본문에 전체 문서를 담아 신규 생성:

```bash
gh issue create --repo kang20/debate-chat \
  --title "{도메인} 유스케이스" \
  --body "{전체 유스케이스 문서 (v1)}"
```

매칭 이슈가 이미 있으면 → 이슈 본문을 전체 문서로 업데이트:

```bash
gh issue edit {번호} --repo kang20/debate-chat \
  --body "{전체 유스케이스 문서}"
```

#### Step 7: my-TODO 태스크 연동

매칭 태스크 → `in_progress`로 갱신
매칭 태스크 없음 → 신규 태스크 생성 제안

#### Step 8: 완료 보고

```
✅ 유스케이스 문서 작성 완료

📄 파일: docs/requirements/{파일명}
📌 UC 번호: UC-N ~ UC-M
🐛 GitHub 이슈: #{번호} ("{제목}") — 이슈 본문에 문서 작성됨
📋 my-TODO 태스크: {태스크명}

작성된 유스케이스:
  • UC-N. {유스케이스명} — METHOD /api/{path}
  ...

다음 단계: /develop-backend {파일명}
```

---

### 🔁 [usecase-feedback] 피드백 반영 워크플로우

사용자가 유스케이스 이슈에 피드백 댓글을 달았을 때 실행한다.

#### Step 1: 피드백 수집

```bash
gh issue view {번호} --repo kang20/debate-chat --comments
```

#### Step 2: 피드백 분석

- 관련 `docs/requirements/business-requirements.md` 섹션 대조
- 필요 시 구현 코드(DTO, Entity)도 확인하여 실제 필드 파악

#### Step 3: 이슈에 분석 답변 댓글 작성

피드백 항목별로 근거와 결론을 정리한 댓글을 작성한다.

```bash
gh issue comment {번호} --repo kang20/debate-chat --body "$(cat <<'EOF'
**{피드백 버전} 검토 결과**

| 항목 | 결론 | 근거 |
|------|------|------|
| {항목} | **유지 / 제거 / 수정** | {요구사항·코드 근거} |
...

→ v{N+1}에서 {변경 요약}
EOF
)"
```

결정이 필요한 사항은 AskUserQuestion으로 사용자에게 확인한다.

#### Step 4: 이슈 본문 버전업

확정된 변경사항을 반영하여 이슈 본문을 직접 수정한다. 제목에 버전 표시.

```bash
gh issue edit {번호} --repo kang20/debate-chat \
  --body "{전체 문서 — 버전업된 내용 반영 (vN)}"
```

> 새 댓글로 문서 전체를 올리지 않는다. 이슈 본문이 항상 최신 문서다.

#### Step 5: 로컬 파일 동기화

이슈 본문과 동일한 내용으로 `docs/requirements/{도메인}-usecase.md`를 업데이트한다.

---

### 🐛 [issue] GitHub 이슈 관리

```bash
# 목록 조회
gh issue list --repo kang20/debate-chat

# 상세 조회
gh issue view {번호} --repo kang20/debate-chat

# 이슈 생성
gh issue create --repo kang20/debate-chat \
  --title "{제목}" \
  --body "{내용}"

# 이슈 수정
gh issue edit {번호} --repo kang20/debate-chat \
  --title "{새 제목}" \
  --body "{새 내용}"

# 이슈 닫기
gh issue close {번호} --repo kang20/debate-chat

# 코멘트 추가
gh issue comment {번호} --repo kang20/debate-chat --body "{내용}"
```

**이슈 본문 작성 시**: 현재 프로젝트 컨텍스트(요구사항, 유스케이스)를 참조하여 작성한다.

---

### 📬 [pr] GitHub PR 관리

```bash
# 목록 조회
gh pr list --repo kang20/debate-chat

# 상세 조회
gh pr view {번호} --repo kang20/debate-chat

# PR 생성
gh pr create --repo kang20/debate-chat \
  --base main \
  --title "{제목}" \
  --body "{내용}"

# 코멘트 추가
gh pr comment {번호} --repo kang20/debate-chat --body "{내용}"
```

---

### ✅ [task] my-TODO 태스크 & 세부태스크 관리

CLI 공통 prefix (이하 `cli`로 축약):
```bash
cd /c/Spring_Study/todo && node_modules/electron/dist/electron.exe \
  --no-sandbox --disable-gpu scripts/project-cli.js
```

#### 프로젝트·태스크

```bash
cli list                                      # 프로젝트 목록 (태스크 카운트 포함)
cli stats                                     # 전체 현황 요약
cli task list <프로젝트ID>                    # 태스크 목록
cli task get <태스크ID>                       # 태스크 상세 (세부태스크 포함)
cli task stats <프로젝트ID>                   # 태스크 현황 통계

# 태스크 생성
cli task create <프로젝트ID> "제목" \
  --status waiting --priority medium \
  --due YYYY-MM-DD \
  --issue "https://github.com/kang20/debate-chat/issues/{번호}" \
  --pr    "https://github.com/kang20/debate-chat/pull/{번호}"

# 태스크 수정 (field: title|description|status|priority|due_date|tags|progress|github_issue_url|github_pr_url)
cli task update <태스크ID> status in_progress
cli task update <태스크ID> progress 75
cli task update <태스크ID> github_issue_url "https://github.com/kang20/debate-chat/issues/{번호}"
cli task update <태스크ID> github_pr_url    "https://github.com/kang20/debate-chat/pull/{번호}"

cli task delete <태스크ID>
```

**태스크 상태:** `waiting` · `in_progress` · `completed` · `cancelled`
**우선순위:** `low` · `medium` · `high` · `urgent`

#### 세부태스크 (체크리스트)

```bash
cli subtask list <태스크ID>           # 세부태스크 목록 (완료 현황 포함)
cli subtask create <태스크ID> "제목"  # 세부태스크 추가
cli subtask complete <세부태스크ID>   # 완료 ↔ 미완료 토글
cli subtask delete <세부태스크ID>     # 세부태스크 삭제
```

#### 일정 관리 워크플로우

세부태스크는 **기능 단위 또는 프로젝트 흐름 단위**로 분해한다.
클래스·메서드·파일 수준의 구현 세부사항은 세부태스크로 만들지 않는다.

**올바른 세부태스크 단위 (기능/흐름):**
```
태스크: "사용자 닉네임/프로필 기능 (Issue #7)"
  ├── ○ 이슈 검토 & 유스케이스 문서 확인
  ├── ○ UC-5 닉네임 설정 기능 개발 (DRAFT→USER 전환)
  ├── ○ UC-6 내 프로필 조회 기능 개발
  ├── ○ UC-7 닉네임 수정 기능 개발
  ├── ○ UC-8 공개 프로필 조회 기능 개발
  └── ○ PR 생성 및 검토
```

**잘못된 세부태스크 단위 (구현 세부사항 → 사용 금지):**
```
  ├── ✗ UserUsecase 인터페이스 정의
  ├── ✗ SetNicknameRequest DTO 작성
  └── ✗ UserService#setNickname 구현
```

**세부태스크 분해 기준:**
| 적합 | 부적합 |
|------|--------|
| 이슈/PR 검토 | 특정 클래스·인터페이스 구현 |
| 유스케이스별 기능 개발 | 메서드 단위 작업 |
| 테스팅 (기능 단위) | DTO·Repository 파일 작성 |
| 문서 작성 | 설정 파일 수정 |
| 코드 리뷰·PR | 특정 패키지 구조 변경 |

- 세부태스크 완료 비율 → 태스크 `progress` 자동 계산 제안
  - 완료 0/5 → 0%, 1/5 → 20%, 3/5 → 60%, 5/5 → 100%
- 모든 세부태스크 완료 시 → 태스크 `status=completed` 전환 제안
- GitHub 이슈/PR 링크를 태스크에 연결하여 코드 ↔ 일정 추적

---

### 🔄 [sync] 자동 동기화

commit 후, PR 생성 후, 또는 `/pm sync` 직접 호출 시 실행된다.

#### Step 1: 현재 상태 수집 (병렬)

```bash
gh issue list --repo kang20/debate-chat --state all
gh pr list --repo kang20/debate-chat --state all
git branch --show-current
git log --oneline -3
node scripts/project-manager.js tasks
```

#### Step 2: 매칭 및 변경 후보 도출

| 상황 | 동작 |
|------|------|
| PR MERGED + 매칭 태스크 | `completed` 변경 제안 |
| Issue CLOSED + 매칭 태스크 | `completed` 변경 제안 |
| PR OPEN + 매칭 대기 태스크 | `in_progress` (70%) 변경 제안 |
| 새 OPEN Issue + 매칭 태스크 없음 | 신규 태스크 추가 제안 |
| 브랜치명에 이슈 번호 포함 | 매칭 태스크 진행중 표시 제안 |
| 세부태스크 전부 완료 + 태스크 미완료 | `completed` + `progress=100` 변경 제안 |
| 세부태스크 일부 완료 + progress 불일치 | `progress` 재계산 후 갱신 제안 (완료수/전체수 × 100) |

**매칭 기준:** 이슈 번호 · 키워드 · 태그

#### Step 3: 요약 및 적용

```
🔄 동기화 검토

✅ 갱신 후보 (N개)
  • {태스크명} → completed (PR #{번호} 머지됨)

➕ 신규 태스크 제안 (N개)
  • Issue #{번호} "{제목}"

⚠️ 검토 필요 (N개)
  • {태스크명} — 매칭 모호
```

- 변경 1~3개: 바로 적용 후 결과 보고
- 변경 4개 이상 / 신규 추가: AskUserQuestion으로 확인
- 삭제: 반드시 확인

---

## 인자 없이 호출 시

사용자 메시지 또는 대화 컨텍스트에서 의도를 파악한다.

| 키워드 | 실행 모드 |
|--------|---------|
| 현황, 상태, 대시보드 | status |
| 문서, 어디, 어떻게, 뭐야, 뭔지 | doc |
| 요구사항, 비즈니스 | req |
| 유스케이스, usecase, UC, 명세 | usecase |
| 이슈, issue, 버그, 기능 요청 | issue |
| PR, 풀리퀘, 머지 | pr |
| 태스크, 할일, 작업, 세부태스크, 서브태스크, 체크리스트 | task |
| 동기화, sync | sync |

의도가 불명확하면 AskUserQuestion으로 확인한다.

---

## 에러 코드 네이밍 규칙

유스케이스 문서 작성 시 아래 체계를 따른다.

| 접두사 | 도메인 |
|--------|--------|
| `AUTH_` | 인증 (기존: 001~006) |
| `USER_` | 사용자 (기존: 001~004) |
| `ROOM_` | 토론방 |
| `CHAT_` | 채팅 |
| `ARG_` | 논거 |
| `VOTE_` | 투표 |
| `PHASE_` | 토론 단계 |
| `COMMON_` | 공통 (기존: 001~002) |

신규 코드 부여 전 기존 문서 전체에서 중복 여부 확인 필수.

---

## 주의사항

- **요구사항 충실성**: `business-requirements.md` 내용을 임의로 확장하지 않는다.
- **UC 번호 중복 금지**: 기존 문서 전체 스캔 후 이어서 부여한다.
- **에러 코드 중복 금지**: 기존 코드를 덮어쓰지 않는다.
- **파일 덮어쓰기 전 확인**: 같은 이름 파일 존재 시 AskUserQuestion으로 확인한다.
- **삭제 작업 전 반드시 확인**: 이슈 닫기, 태스크 삭제 등은 사용자 승인 후 실행한다.
- **이슈 본문 = 최신 유스케이스 문서**: 문서 전체를 댓글로 올리지 않는다. 버전업은 항상 `gh issue edit`으로 본문 수정.
- **댓글 = 논의 전용**: 피드백 분석 결과, 의논 내용, 결정 근거를 댓글에 기록한다.
- **버전 표시 필수**: 문서 제목에 `(v1)`, `(v2)` 등 버전을 명시하고, 버전업 시 제목과 본문을 함께 수정한다.
- **응답 필드 = 요구사항 기반**: 내부 추적 필드(`updatedAt` 등)는 요구사항 근거 없이 포함하지 않는다.
