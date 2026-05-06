package debatechat.backend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // COMMON
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "COMMON_001", "유효하지 않은 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_002", "서버 내부 오류가 발생했습니다."),

    // AUTH
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "AUTH_001", "이미 사용 중인 닉네임입니다."),
    DUPLICATE_OAUTH_ACCOUNT(HttpStatus.CONFLICT, "AUTH_002", "이미 가입된 OAuth 계정입니다."),
    OAUTH_AUTHENTICATION_FAILED(HttpStatus.UNAUTHORIZED, "AUTH_003", "OAuth 인증에 실패했습니다."),
    USER_NOT_FOUND(HttpStatus.UNAUTHORIZED, "AUTH_004", "가입되지 않은 사용자입니다. 먼저 회원가입을 해주세요."),
    AUTHENTICATION_REQUIRED(HttpStatus.UNAUTHORIZED, "AUTH_005", "인증이 필요합니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_006", "유효하지 않은 토큰입니다. 다시 로그인해주세요."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "AUTH_007", "접근 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
