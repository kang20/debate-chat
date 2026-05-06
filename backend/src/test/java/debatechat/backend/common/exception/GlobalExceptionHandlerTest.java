package debatechat.backend.common.exception;

import debatechat.backend.common.dto.response.ErrorResponse;
import debatechat.backend.common.security.JwtAuthenticationToken;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void BusinessException은_ErrorCode의_status와_code_message를_반환한다() {
        BusinessException exception = new BusinessException(ErrorCode.INVALID_INPUT);

        ResponseEntity<ErrorResponse> response = handler.handleBusiness(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().code()).isEqualTo("COMMON_001");
    }

    @Test
    void MethodArgumentNotValidException은_400과_COMMON_001을_반환한다() throws Exception {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
        bindingResult.addError(new FieldError("target", "nickname", "닉네임은 2~20자 한글/영문/숫자만 허용됩니다."));
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().code()).isEqualTo("COMMON_001");
        assertThat(response.getBody().message()).isEqualTo("닉네임은 2~20자 한글/영문/숫자만 허용됩니다.");
    }

    @Test
    void HttpMessageNotReadableException은_400과_COMMON_001을_반환한다() {
        HttpMessageNotReadableException exception = new HttpMessageNotReadableException("JSON parse error", (org.springframework.http.HttpInputMessage) null);

        ResponseEntity<ErrorResponse> response = handler.handleMessageNotReadable(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().code()).isEqualTo("COMMON_001");
    }

    @Test
    void 미인증_사용자의_AccessDeniedException은_401을_반환한다() {
        SecurityContextHolder.clearContext();

        ResponseEntity<ErrorResponse> response = handler.handleAccessDenied(new AccessDeniedException("denied"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().code()).isEqualTo(ErrorCode.AUTHENTICATION_REQUIRED.getCode());
    }

    @Test
    void 인증된_사용자의_AccessDeniedException은_403을_반환한다() {
        SecurityContextHolder.getContext()
            .setAuthentication(new JwtAuthenticationToken(1L, "USER"));

        ResponseEntity<ErrorResponse> response = handler.handleAccessDenied(new AccessDeniedException("denied"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().code()).isEqualTo(ErrorCode.ACCESS_DENIED.getCode());
    }

    @Test
    void 예상치_못한_Exception은_500과_COMMON_002를_반환한다() {
        Exception exception = new RuntimeException("unexpected");

        ResponseEntity<ErrorResponse> response = handler.handleUnexpected(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().code()).isEqualTo("COMMON_002");
    }
}
