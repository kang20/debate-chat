---
name: project-manager
description: GitHub Issue/PR, 로컬 git 상태, my-TODO 프로젝트·태스크를 통합 조회·관리하고 자동 동기화합니다. commit·PR·직접 호출 시마다 태스크를 검토·갱신합니다.
when_to_use: 프로젝트 진행상황을 확인하거나, 이슈/PR 현황을 보거나, 태스크를 관리하거나, commit/PR 후 태스크 동기화가 필요할 때
allowed-tools:
  - Bash(cd * && node scripts/project-manager.js *)
  - Bash(cd /c/Spring_Study/todo && node_modules/electron/dist/electron.exe --no-sandbox --disable-gpu scripts/project-cli.js *)
  - Bash(git *)
  - Read
  - Glob
  - AskUserQuestion
---

# 프로젝트 매니저

GitHub Issue/PR, 로컬 git 상태, my-TODO 프로젝트·태스크를 통합 관리합니다.

## 구조

```
GitHub (debate-chat)
├── Issues (🐛)
└── PRs (📬)

로컬 Git (debate-chat)
├── 현재 브랜치
├── 미커밋 변경사항
└── 마지막 커밋

my-TODO
├── 프로젝트 (카테고리)
│   └── 태스크 (개별 작업: 대기→진행중→완료/취소)
```

## 기능

### 조회
- **현황 대시보드** - 📊 git 상태 + GitHub Issue/PR + my-TODO 프로젝트·태스크
- **로컬 브랜치** - 현재 브랜치, 미커밋 변경사항, 마지막 커밋
- **GitHub Issues** - 열린/종료된 이슈 목록 (API 스크래핑)
- **GitHub PRs** - 열린/병합된 PR 목록 (API 스크래핑)
- **프로젝트 목록** - my-TODO의 전체 프로젝트 (태스크 카운트 포함)
- **프로젝트 상세** - 특정 프로젝트의 태스크 목록

### 프로젝트 관리
- **생성** - 새 프로젝트 생성 (색상, 태그 지정 가능)
- **수정** - 프로젝트 제목, 설명, 색상, 태그 업데이트
- **삭제** - 프로젝트 및 하위 모든 태스크 삭제
- **검색** - 키워드로 프로젝트 검색

### 태스크 관리
- **생성** - 프로젝트 내 새 태스크 생성
- **수정** - 상태(대기/진행중/완료/취소), 우선순위, 진행률, 마감일, 태그 업데이트
- **삭제** - 개별 태스크 삭제
- **현황** - 프로젝트의 태스크 통계 조회

## 사용 예시

### 현황 확인
- "프로젝트 현황 보여줘" → 전체 대시보드
- "열린 이슈 몇 개야?" → GitHub Issues 조회
- "진행중인 PR 있어?" → GitHub PRs 조회
- "현재 작업 상태는?" → 로컬 브랜치 상태
- "내 프로젝트/태스크 목록 보여줘" → my-TODO 조회

### 프로젝트 관리
- "새 프로젝트 추가해줘: React 마이그레이션" → 프로젝트 생성
- "프로젝트 색상을 파란색으로 바꿔줘" → 프로젝트 수정
- "완료된 프로젝트 삭제해줘 (ID: ...)" → 프로젝트 삭제
- "backend 관련 프로젝트 찾아줘" → 프로젝트 검색

### 태스크 관리
- "이 프로젝트에 새 태스크 추가: API 엔드포인트 구현" → 태스크 생성
- "이 태스크 진행률 75%로 업데이트" → 태스크 수정
- "이 태스크 완료로 변경해줘" → 태스크 상태 변경
- "프로젝트 태스크 통계 보여줘" → 태스크 통계

## 자동 동기화 (✨ 핵심 기능)

이 skill이 호출되면 **항상 동기화 검토 절차를 먼저 수행**한다. 다음 트리거 시점에 호출된다:

| 트리거 | 시점 | 호출 위치 |
|--------|------|----------|
| **직접 호출** | 사용자가 skill을 명시적으로 호출 | `/project-manager` |
| **commit 후** | 커밋 완료 직후 | `commit-and-push` skill 종료 시 |
| **PR 생성 후** | PR 생성 완료 직후 | `create-pr` skill 종료 시 |

### 동기화 검토 절차

#### Step 1: 현재 상태 수집 (병렬)
1. GitHub Issues/PRs 조회 (`node scripts/project-manager.js issues`, `prs`)
2. 로컬 git 상태 조회 (현재 브랜치, 최근 커밋)
3. my-TODO 태스크 목록 조회 (`project-cli.js task list <프로젝트ID>`)

#### Step 2: 상태 매칭 및 변경 후보 도출

**자동 매칭 규칙:**

| 상황 | 동작 |
|------|------|
| 🟢 PR이 **MERGED** 됨 + 매칭되는 진행중 태스크 존재 | 태스크를 `completed`로 변경 제안 |
| ✅ Issue가 **CLOSED** 됨 + 매칭되는 태스크 존재 | 태스크를 `completed`로 변경 제안 |
| 🟢 PR이 **OPEN** + 매칭되는 대기 태스크 존재 | 태스크를 `in_progress`(진행률 70%)로 변경 제안 |
| 🔴 새로운 **OPEN Issue** + 매칭되는 태스크 없음 | 새 태스크 추가 제안 |
| 현재 브랜치명에 이슈 번호 포함 (예: `feat/5-auth`) | 해당 이슈와 매칭되는 태스크를 진행중으로 표시 |
| 최근 커밋 메시지에 키워드 매칭 (auth, chat, vote 등) | 관련 태스크의 진행률 업데이트 제안 |

**매칭 기준:**
- **태그 기반 매칭** - Issue 라벨/PR 제목 ↔ 태스크 태그
- **키워드 기반 매칭** - Issue/PR 제목 ↔ 태스크 제목/설명
- **이슈 번호 기반** - 브랜치명/PR 본문의 이슈 번호 ↔ 태스크 설명의 `Issue #N`

#### Step 3: 변경사항 요약 및 사용자 확인

매칭 결과를 다음 형식으로 보고:

```
🔄 태스크 동기화 검토 결과

✅ 자동 갱신 후보 (N개)
  • [태스크명] - 변경: 진행중 70% → 완료 (PR #6 머지됨)
  • [태스크명] - 변경: 대기 → 진행중 70% (PR #7 OPEN)

➕ 신규 태스크 제안 (N개)
  • [신규 이슈 #8] - "토론방 삭제 기능"

⚠️ 검토 필요 (N개)
  • [태스크명] - 매칭 모호함 (수동 확인 필요)
```

**사용자 승인 방식:**
- 변경 1~3개: 직접 적용 후 결과 보고
- 변경 4개 이상 또는 신규 태스크 추가: AskUserQuestion으로 확인 받기
- 삭제 동작은 **반드시 확인 받기**

#### Step 4: 변경 적용

승인된 변경사항을 `project-cli.js task update/create/delete`로 일괄 적용한다.

#### Step 5: 최종 상태 보고

동기화 완료 후 현재 태스크 통계를 출력한다:
```
✓ 동기화 완료
  • 진행중: N개  대기: N개  완료: N개
  • 갱신: N개  신규: N개
```

---

## 실행 절차 (일반 명령)

### 1단계: 사용자 의도 파악

사용자 요청의 종류:
- **자동 동기화**: skill 호출 시 자동 (위의 동기화 절차 수행 후 사용자 의도에 따라 추가 작업)
- **GitHub 조회**: issues/prs
- **로컬 git 조회**: branch 상태
- **프로젝트 조회**: 목록/검색/상세
- **프로젝트 관리**: 생성/수정/삭제
- **태스크 조회**: 목록/통계
- **태스크 관리**: 생성/수정/삭제

### 2단계: 적절한 명령어 실행

**현황 대시보드:**
```bash
node scripts/project-manager.js status
```

**개별 조회:**
```bash
node scripts/project-manager.js branch    # 로컬 git
node scripts/project-manager.js issues    # GitHub Issues
node scripts/project-manager.js prs       # GitHub PRs
node scripts/project-manager.js tasks     # my-TODO 프로젝트
```

**프로젝트 관리:**
```bash
# 프로젝트 목록
project-cli.js list

# 프로젝트 생성
project-cli.js create "제목" --desc "설명" --color "#3b82f6" --tags "tag1,tag2"

# 프로젝트 수정
project-cli.js update <프로젝트ID> title "새 제목"
project-cli.js update <프로젝트ID> color "#10b981"

# 프로젝트 삭제
project-cli.js delete <프로젝트ID>

# 프로젝트 검색
project-cli.js search "키워드"
```

**태스크 관리:**
```bash
# 태스크 목록 (특정 프로젝트)
project-cli.js task list <프로젝트ID>

# 태스크 통계
project-cli.js task stats <프로젝트ID>

# 태스크 생성
project-cli.js task create <프로젝트ID> "제목" --status in_progress --priority high --due 2026-06-30

# 태스크 수정
project-cli.js task update <태스크ID> status completed
project-cli.js task update <태스크ID> progress 75

# 태스크 삭제
project-cli.js task delete <태스크ID>
```

### 3단계: 결과 해석 및 요약

명령어 출력을 분석하여 사용자에게 의미 있는 정보 제공:

**프로젝트 목록 해석**
- `[⏳2 🔄1 ✅0]` 형식으로 태스크 카운트 표시
- 색상과 태그로 프로젝트 카테고리 파악

**태스크 통계 해석**
- 진행중 vs 완료 vs 대기 vs 취소 구분
- 우선순위별 분포 파악
- 마감일 임박 태스크 경고

**GitHub 분석**
- 🔴 (열림) vs ✅ (종료) 이슈 구분
- 🟢 (열림) vs ✨ (병합) vs ❌ (닫힘) PR 구분
- 라벨과 드래프트 상태 파악

## 색상 프리셋

```
#8b5cf6 (보라)    #3b82f6 (파랑)    #10b981 (초록)
#f59e0b (주황)    #ef4444 (빨강)    #ec4899 (분홍)
#06b6d4 (하늘)    #6b7280 (회색)
```

## 상태·우선순위·마감일

**태스크 상태:** `waiting`(대기), `in_progress`(진행중), `completed`(완료), `cancelled`(취소)

**우선순위:** `low`(낮음), `medium`(보통), `high`(높음), `urgent`(긴급)

**마감일:** `YYYY-MM-DD` 형식

## DB 정보

- **경로:** `C:\Users\aorl2\AppData\Roaming\my-TODO\kanban-todo.db`
- **테이블:** projects, project_tasks
- **관계:** project_id (FK, CASCADE 삭제)
