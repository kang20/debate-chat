---
name: skill-create
description: 새로운 Claude Code skill을 생성합니다. skill 만들기, 명령어 추가 요청 시 사용합니다.
disable-model-invocation: true
argument-hint: [skill-name]
arguments:
  - name
---

# Skill 생성기

새로운 skill을 `.claude/skills/$name/SKILL.md` 경로에 생성합니다.

## 절차

1. 사용자에게 skill의 목적과 동작을 질문한다
2. 아래 SKILL.md 규격에 따라 파일을 생성한다
3. 생성 후 사용법을 안내한다

## SKILL.md 규격

### 파일 구조

```
.claude/skills/<skill-name>/
├── SKILL.md           # 주요 지침 (필수)
├── template.md        # Claude가 채울 템플릿 (선택)
├── examples/          # 예제 출력 (선택)
└── scripts/           # 실행 스크립트 (선택)
```

### Frontmatter 필수 형식

```yaml
---
name: skill-name              # 소문자, 숫자, 하이픈만 사용 (최대 64자)
description: skill 설명          # Claude가 자동 호출 시기를 판단하는 데 사용
disable-model-invocation: true # 수동 호출만 원할 때 true
allowed-tools:                 # skill 실행 시 자동 승인할 도구 목록 (선택)
  - Bash(git *)
---
```

### Frontmatter 선택 필드

| 필드 | 설명 |
|---|---|
| `name` | slash command 이름. 생략 시 디렉토리 이름 사용 |
| `description` | skill 설명. 자동 호출 판단에 사용 |
| `when_to_use` | 추가 트리거 조건 설명 |
| `argument-hint` | 자동완성에 표시할 인수 힌트 (예: `[filename]`) |
| `arguments` | 명명된 위치 인수 목록 |
| `disable-model-invocation` | `true`면 `/name`으로만 호출 가능 |
| `user-invocable` | `false`면 Claude만 호출 가능 (메뉴에서 숨김) |
| `allowed-tools` | 자동 승인할 도구 목록 |
| `context` | `fork`면 subagent에서 실행 |
| `agent` | `context: fork` 시 사용할 에이전트 유형 |
| `model` | 사용할 모델 |
| `effort` | 노력 수준 (`low`, `medium`, `high`, `max`) |
| `paths` | 활성화 조건 glob 패턴 |

### 콘텐츠 작성 규칙

1. **명확한 절차**: 단계별로 실행할 작업을 명시한다
2. **한글 작성**: description과 콘텐츠 모두 한글로 작성한다
3. **구체적 설명**: description에 "언제 사용할지" 키워드를 포함한다
4. **인수 활용**: 동적 값이 필요하면 `$ARGUMENTS`, `$0`, `$1` 또는 명명된 인수를 사용한다
5. **동적 컨텍스트**: 실행 시 데이터가 필요하면 `` !`command` `` 구문을 사용한다

### Skill 유형별 가이드

**참조 콘텐츠** (코딩 규칙, 스타일 가이드 등):
- `disable-model-invocation: false` (기본값) — Claude가 관련 시 자동 로드
- `user-invocable: false`로 설정 가능

**작업 콘텐츠** (배포, 커밋 등 특정 작업):
- `disable-model-invocation: true` — 사용자가 직접 호출
- `allowed-tools`로 필요한 도구 사전 승인

## 생성 후 안내

skill 생성이 완료되면 다음을 안내한다:

1. `/<skill-name>`으로 직접 호출 가능
2. `disable-model-invocation`이 `false`면 대화 중 자동 호출 가능
3. 인수가 있으면 사용 예시를 보여준다
