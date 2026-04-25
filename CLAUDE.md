# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 다룰 때 참고하는 가이드입니다.

## 프로젝트 개요

`debate-chat`은 토론/채팅 애플리케이션의 Spring Boot 백엔드입니다. 백엔드는 `backend/` 하위 디렉토리에 위치합니다.

- **Spring Boot** 4.0.6
- **Java** 25
- **빌드 도구**: Gradle 9.4.1 (Kotlin DSL — `build.gradle.kts`)
- **루트 패키지**: `debatechat.backend`

## 기술 스택

- **Spring Web MVC** — REST API 계층
- **Spring Security** — 인증/인가
- **H2** — 로컬 개발용 인메모리 DB
- **MySQL** — 운영 데이터베이스
- **Lombok** — 보일러플레이트 코드 감소

## 주요 명령어

모든 명령어는 `backend/` 디렉토리에서 실행해야 합니다.

```bash
# 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun

# 전체 테스트 실행
./gradlew test

# 클린 빌드
./gradlew clean build
```

## 프로젝트 구조

```
backend/
  src/main/java/debatechat/backend/   # 애플리케이션 소스
  src/main/resources/application.properties
  src/test/java/debatechat/backend/   # 테스트
  build.gradle.kts
```

## 테스트 규칙

테스트 검증 시 반드시 전체 테스트(`./gradlew test`)를 실행한다. 단일 테스트만 실행하지 않고, 항상 모든 테스트를 통과하는지 확인해야 한다.

## 설정

`application.properties`는 최소한의 설정만 포함되어 있습니다. DB 연결, 보안 설정, 서버 설정 등은 필요에 따라 추가하세요. 로컬 개발 시에는 H2를 런타임 DB로 사용할 수 있으며, 운영 환경에서는 `mysql-connector-j`로 전환하세요.
