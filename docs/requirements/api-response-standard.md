# API 응답 표준 및 ErrorCode 정의

---

## 1. 응답 형식

### 성공 응답

envelope 없이 도메인 데이터를 직접 반환한다. 본문이 없으면 `204 No Content`.

### 에러 응답

모든 에러는 `{ code, message }` 구조를 따른다.

```json
{ "code": "AUTH_001", "message": "이미 사용 중인 닉네임입니다." }
```

- `code`: 커스텀 에러 코드 (`{도메인}_{번호}`)
- `message`: 사용자 표시용 메시지 (한국어)
- 입력값 검증 실패 시 첫 번째 필드 에러 메시지를 `message`에 담는다.

---

## 2. ErrorCode 체계

### 코드 형식

`{도메인}_{번호}` — 도메인 접두사(대문자) + 언더스코어 + 3자리 번호.

### 규칙

- 각 도메인 내에서 번호는 001부터 순차 부여한다.
- 하나의 ErrorCode는 **HTTP 상태**, **코드 문자열**, **기본 메시지**를 가진다.
- 실제 코드 목록은 각 유스케이스 문서에서 정의한다.

---

## 3. 구현 구조

### ErrorCode enum

`ErrorCode(HttpStatus status, String code, String message)` — enum 상수마다 HTTP 상태, 코드 문자열, 기본 메시지를 보유.

### ErrorResponse record

`ErrorResponse(String code, String message)` — 정적 팩토리 `of(ErrorCode)`, `of(ErrorCode, String message)` 제공.

### BusinessException

`RuntimeException`을 상속하며 `ErrorCode` 필드를 가진다. 서비스 계층에서 `throw new BusinessException(ErrorCode.XXX)`.

### GlobalExceptionHandler

| 예외 | 처리 |
|------|------|
| `BusinessException` | `errorCode`의 status + code + message 반환 |
| `MethodArgumentNotValidException` | 400 + COMMON_001 + 첫 번째 필드 에러 메시지 |
| `Exception` (fallback) | 500 + COMMON_002 |

---

## 4. 프론트엔드 호환

- `error.response.data.message`로 메시지 추출 → 기존 `toast.error()` 흐름 유지
- `error.response.data.code`로 에러 종류별 분기 가능 (예: `AUTH_001` → 닉네임 중복 특수 처리)
