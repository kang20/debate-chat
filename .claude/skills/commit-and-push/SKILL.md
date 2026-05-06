---
name: commit-and-push
description: 변경 사항을 커밋하고 원격 저장소에 푸시합니다. 커밋 후 push, 저장 후 올리기 요청 시 사용합니다.
disable-model-invocation: true
allowed-tools:
  - Bash(git status *)
  - Bash(git diff *)
  - Bash(git add *)
  - Bash(git commit *)
  - Bash(git log *)
  - Bash(git branch *)
  - Bash(git push *)
---

커밋 규칙은 [commit skill](./../commit/skill.md)을 따른다.

## 절차

1. commit skill의 절차를 그대로 수행하여 커밋을 생성한다
2. 커밋 성공 후 `git push` 한다
   - 현재 브랜치에 upstream이 설정되어 있으면: `git push`
   - upstream이 없으면: `git push -u origin <브랜치명>`
3. 푸시 결과를 출력한다
4. **태스크 동기화**: 푸시 성공 후 `project-manager` skill을 호출하여 my-TODO 태스크를 최신화한다
   - 푸시한 커밋 메시지·해시를 컨텍스트로 전달
   - project-manager가 자동 동기화 절차를 수행하도록 한다

## 주의사항

- 커밋이 실패하면 푸시하지 않는다
- `main`, `develop` 브랜치에는 커밋 및 푸시를 하지 않는다
- force push(`--force`, `-f`)는 절대 사용하지 않는다
- 태스크 동기화 단계가 실패해도 커밋·푸시는 유지한다 (경고만 출력)
