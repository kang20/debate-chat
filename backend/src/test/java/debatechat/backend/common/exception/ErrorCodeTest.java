package debatechat.backend.common.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

class ErrorCodeTest {

    @Test
    void INVALID_INPUT은_400이고_COMMON_001이다() {
        assertThat(ErrorCode.INVALID_INPUT.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(ErrorCode.INVALID_INPUT.getCode()).isEqualTo("COMMON_001");
        assertThat(ErrorCode.INVALID_INPUT.getMessage()).isNotBlank();
    }

    @Test
    void INTERNAL_SERVER_ERROR는_500이고_COMMON_002이다() {
        assertThat(ErrorCode.INTERNAL_SERVER_ERROR.getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(ErrorCode.INTERNAL_SERVER_ERROR.getCode()).isEqualTo("COMMON_002");
        assertThat(ErrorCode.INTERNAL_SERVER_ERROR.getMessage()).isNotBlank();
    }

    @Test
    void 모든_ErrorCode는_code와_message가_비어있지_않다() {
        for (ErrorCode errorCode : ErrorCode.values()) {
            assertThat(errorCode.getCode()).isNotBlank();
            assertThat(errorCode.getMessage()).isNotBlank();
            assertThat(errorCode.getStatus()).isNotNull();
        }
    }
}
