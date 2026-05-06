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
5. 브랜치명에서 이슈 번호를 추출한다 (`feat/3-xxx` → `#3`)
6. `git diff <base>...HEAD --name-only`로 변경된 `.md` 파일 목록을 추출한다
7. 리모트에 push되지 않은 커밋이 있으면 `git push -u origin <현재브랜치>`로 push한다
8. 아래 PR 템플릿에 따라 title과 body를 작성한다
9. 사용자에게 title과 body를 보여주고 확인을 받는다
10. `gh pr create`로 PR을 생성한다
11. 생성된 PR URL을 출력한다
12. **태스크 동기화**: PR 생성 성공 후 `project-manager` skill을 호출하여 my-TODO 태스크를 최신화한다
    - PR 번호·제목·연결된 이슈 번호를 컨텍스트로 전달
    - project-manager가 자동 동기화 절차를 수행하여 진행중 태스크의 진행률을 갱신하도록 한다

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

## 작업 사항
<!-- 이 브랜치에서 수행한 작업을 bullet point로 정리 -->
-
-
-

## 문서
<!-- 브랜치에서 추가/수정된 .md 파일이 있을 때만 이 섹션을 포함한다 -->
- [파일명](경로/파일명.md)

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

<!-- 이슈 번호가 있을 때만 아래 줄을 포함한다 -->
Closes #<이슈번호>
```

## 본문 작성 규칙

1. **개요**: PR의 목적을 1~2문장으로 요약한다
2. **작업 사항**: 커밋 히스토리를 분석하여 이 브랜치에서 수행한 작업을 bullet point로 정리한다. 파일 목록이 아닌 "무엇을 했는지" 관점으로 작성한다
3. **문서**: `git diff <base>...HEAD --name-only`로 변경된 `.md` 파일을 추출하여 GitHub에서 열리는 링크(`[파일명](경로)`)로 나열한다. 변경된 `.md` 파일이 없으면 이 섹션을 생략한다
4. **테스트**: 실제 테스트 통과 여부를 기반으로 체크한다
5. **참고 사항**: 리뷰어가 알아야 할 컨텍스트를 추가한다
6. **체크리스트**: 해당 항목을 실제 확인 후 체크한다
8. **이슈 자동 닫기**: 브랜치명에서 숫자를 추출하여 (`feat/3-xxx` → `3`) 본문 마지막에 `Closes #<번호>`를 추가한다. 이슈 번호가 없으면 이 줄을 생략한다

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
