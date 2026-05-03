package debatechat.backend.common.dto.response;

import debatechat.backend.common.exception.ErrorCode;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ErrorResponseTest {

    @Test
    void of_ErrorCode_는_code와_message를_반환한다() {
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT);

        assertThat(response.code()).isEqualTo(ErrorCode.INVALID_INPUT.getCode());
        assertThat(response.message()).isEqualTo(ErrorCode.INVALID_INPUT.getMessage());
    }

    @Test
    void of_ErrorCode_String_은_message를_오버라이드한다() {
        String customMessage = "닉네임은 2~20자여야 합니다.";
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT, customMessage);

        assertThat(response.code()).isEqualTo(ErrorCode.INVALID_INPUT.getCode());
        assertThat(response.message()).isEqualTo(customMessage);
    }
}
