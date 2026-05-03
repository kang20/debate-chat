---
name: update-frontend-docs
description: 프론트엔드 UI/디자인 변경 후 docs/frontend/ 문서를 최신화합니다. 화면 수정, 디자인 변경, 컴포넌트 추가/수정 시 사용합니다.
when_to_use: 프론트엔드 화면이나 디자인이 변경되었을 때, 사용자가 문서 최신화를 요청할 때
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash(git diff *)
  - Bash(git log *)
---

# 프론트엔드 문서 최신화

프론트엔드 UI/디자인 변경 사항을 분석하고 `docs/frontend/` 문서를 최신 코드에 맞게 업데이트합니다.

## 대상 문서

| 파일 | 역할 | 업데이트 기준 |
|------|------|--------------|
| `docs/frontend/design-system.md` | 색상, 타이포그래피, 공통 UI 컴포넌트 | `index.css`, `components/ui/` 변경 시 |
| `docs/frontend/screens.md` | 화면별 UI 스펙 (레이아웃, 인터랙션) | `pages/`, `components/`, `layouts/` 변경 시 |
| `docs/frontend/tech-stack.md` | 기술 스택, 프로젝트 구조 | `package.json`, 디렉토리 구조 변경 시 |

## 실행 절차

### 1단계: 변경 범위 파악

```
git diff --stat HEAD frontend/src/
```

변경된 파일 목록을 확인하고, 아래 기준으로 업데이트 대상 문서를 결정한다:

- `index.css`, `components/ui/*` 변경 → `design-system.md`
- `pages/*`, `layouts/*`, `components/Header.tsx` 변경 → `screens.md`
- `package.json`, 새 디렉토리 추가 → `tech-stack.md`

### 2단계: 변경된 소스 코드 읽기

변경된 파일들의 **현재 코드**를 읽어 실제 구현 상태를 파악한다.
- 컴포넌트의 props, 레이아웃 구조, 스타일 클래스, 조건부 렌더링 등을 확인
- 새로 추가된 컴포넌트가 있으면 역할과 위치를 파악

### 3단계: 기존 문서 읽기

업데이트 대상 문서의 현재 내용을 읽어 어떤 부분이 변경/추가/삭제되어야 하는지 비교한다.

### 4단계: 문서 업데이트

기존 문서를 Edit 도구로 수정한다. 다음 원칙을 따른다:

- **있는 내용 수정**: 코드와 달라진 부분만 정확히 수정
- **새 내용 추가**: 새 컴포넌트/화면은 기존 문서 구조에 맞게 섹션 추가
- **삭제된 내용 제거**: 코드에서 사라진 컴포넌트/화면은 문서에서도 제거
- **구조 유지**: 기존 문서의 마크다운 헤딩 레벨, 테이블 포맷, 리스트 스타일을 따른다

### 5단계: 결과 요약

사용자에게 어떤 문서의 어떤 섹션이 변경되었는지 간결하게 보고한다.

## 문서 작성 스타일

- 한글로 작성
- UI 요소는 구체적으로 기술 (아이콘명, Tailwind 클래스, 색상 코드 등)
- 컴포넌트명은 백틱으로 감싸기 (`Button`, `Modal` 등)
- 조건부 UI는 "**조건**: 결과" 형태로 기술
- 반응형 차이는 "(데스크톱만)", "(모바일)" 등으로 표기
