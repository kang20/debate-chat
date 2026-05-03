---
name: create-pr
description: PR을 템플릿에 맞춰 생성합니다. PR 생성, pull request 만들기 요청 시 사용합니다.
disable-model-invocation: true
argument-hint: [base-branch]
arguments:
  - base
allowed-tools:
  - Bash(gh pr *)
  - Bash(gh api *)
  - Bash(git status *)
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(git branch *)
  - Bash(git push *)
---

# PR 생성

현재 브랜치의 변경 사항을 분석하고 템플릿에 맞춰 PR을 생성합니다.

## 절차

1. `git branch --show-current`로 현재 브랜치를 확인한다
2. base 브랜치를 결정한다 (인수가 없으면 `main` 사용)
3. `git log --oneline <base>..HEAD`로 PR에 포함될 커밋을 확인한다
4. `git diff <base>...HEAD`로 전체 변경 내용을 분석한다
5. 리모트에 push되지 않은 커밋이 있으면 `git push -u origin <현재브랜치>`로 push한다
6. 아래 PR 템플릿에 따라 title과 body를 작성한다
7. 사용자에게 title과 body를 보여주고 확인을 받는다
8. `gh pr create`로 PR을 생성한다
9. 생성된 PR URL을 출력한다

## PR 제목 규칙

```
<type>: <subject>
```

- commit 컨벤션과 동일한 type 사용 (feat, fix, docs, refactor, test, chore)
- 한글로 작성, 마침표 없음, 70자 이내
- PR에 포함된 커밋들의 변경 사항을 종합하여 작성

## PR 본문 템플릿

```markdown
## 개요
<!-- 이 PR이 해결하는 문제 또는 추가하는 기능을 간단히 설명 -->

## 변경 사항
<!-- 주요 변경 내용을 bullet point로 정리 -->
-
-
-

## 변경 파일
<!-- 핵심 변경 파일과 역할을 간단히 설명 -->
| 파일 | 변경 내용 |
|---|---|
| | |

## 테스트
<!-- 테스트 방법 또는 테스트 결과 -->
- [ ] 전체 테스트 통과 (`./gradlew test`)
- [ ] 로컬 환경 실행 확인

## 참고 사항
<!-- 리뷰어가 알아야 할 추가 정보, 스크린샷 등 -->

## 체크리스트
- [ ] 커밋 컨벤션을 준수했는가
- [ ] 불필요한 파일이 포함되지 않았는가
- [ ] 테스트가 추가/수정되었는가
```

## 본문 작성 규칙

1. **개요**: PR의 목적을 1~2문장으로 요약한다
2. **변경 사항**: 커밋 히스토리를 분석하여 주요 변경을 bullet point로 정리한다
3. **변경 파일**: 핵심 파일만 선별하여 표로 작성한다 (gradlew, wrapper 등 보일러플레이트 제외)
4. **테스트**: 실제 테스트 통과 여부를 기반으로 체크한다
5. **참고 사항**: 리뷰어가 알아야 할 컨텍스트를 추가한다
6. **체크리스트**: 해당 항목을 실제 확인 후 체크한다

## gh pr create 실행

```bash
gh pr create \
  --base <base-branch> \
  --title "<title>" \
  --body "$(cat <<'EOF'
<body>
EOF
)"
```

## 주의사항

- PR 생성 전 반드시 사용자에게 title과 body를 보여주고 확인을 받는다
- `--draft` 옵션은 사용자가 요청한 경우에만 추가한다
- push 되지 않은 커밋이 있으면 PR 생성 전에 push한다
- base 브랜치가 명시되지 않으면 `main`을 기본으로 사용한다
