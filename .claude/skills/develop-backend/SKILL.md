---
name: develop-backend
description: docs/requirements/ 의 요구사항 문서를 기반으로 백엔드 기능을 개발합니다. 아키텍처·테스트 컨벤션을 자동으로 참조합니다.
when_to_use: 사용자가 요구사항 문서를 지정하며 백엔드 기능 개발을 요청할 때
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash(cd backend && ./gradlew *)
  - Bash(mkdir *)
  - Bash(ls *)
  - Task
  - EnterPlanMode
  - AskUserQuestion
  - TodoWrite
---

# 백엔드 기능 개발

요구사항 문서(`docs/requirements/`)를 기반으로 백엔드 기능을 구현합니다.

## 입력

사용자가 요구사항 문서 파일명을 지정한다. 예:

```
/develop-backend auth-usecase.md
/develop-backend chat-usecase.md
```

인자가 없으면 `docs/requirements/` 내 파일 목록을 보여주고 선택을 요청한다.

## 참조 문서

매 실행 시 아래 문서를 **반드시 읽는다**:

| 문서 | 경로 |
|------|------|
| 아키텍처 컨벤션 | `docs/backend/architecture.md` |
| 테스트 컨벤션 | `docs/backend/testing.md` |
| API 응답 표준 | `docs/backend/api-response-standard.md` |
| 요구사항 | `docs/requirements/{지정 파일}` |

## 실행 절차

### 1단계: 문서 읽기 및 분석

참조 문서를 모두 읽고 구현 범위를 파악한다 (도메인 모델, 유스케이스, 에러 코드, 테스트 케이스).

### 2단계: 기존 코드 탐색

관련 코드를 탐색하여 이미 구현된 부분과 새로 구현할 부분을 구분한다.

### 3단계: 구현 계획 수립

EnterPlanMode로 진입하여 구현 계획을 세운다:

- 생성/수정할 파일 목록
- 구현 순서
- 테스트 전략

사용자 승인 후 구현을 진행한다.

### 4단계: 프로덕션 코드 구현

`architecture.md`의 계층별 역할, 의존성 규칙, 구현 패턴과 `api-response-standard.md`의 응답 형식, ErrorCode 체계를 따른다.

### 5단계: 테스트 코드 구현

`testing.md`의 테스트 전략, 유형별 구현 방식, Fixture 패턴을 따른다.

### 6단계: 검증

```bash
cd backend && ./gradlew test
```

전체 테스트를 실행하여 모든 테스트가 통과하는지 확인한다.

### 7단계: 결과 보고

- 생성/수정된 파일 목록
- 구현된 유스케이스 요약
- 테스트 커버리지 요약
- 미구현 항목 (요구사항 문서에서 "추후 개발"로 표시된 항목)

## 주의사항

- "추후 개발"로 표시된 기능은 구현하지 않는다
- 기존 코드가 있으면 수정만 한다 (중복 생성 금지)
- 아키텍처 규칙을 위반하지 않는다 (ArchitectureTest 통과 필수)
- 테스트는 전체 테스트(`./gradlew test`)로 검증한다
