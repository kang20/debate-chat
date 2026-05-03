package debatechat.backend.common.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BusinessExceptionTest {

    @Test
    void ErrorCode로_생성하면_message와_errorCode를_가진다() {
        BusinessException exception = new BusinessException(ErrorCode.INVALID_INPUT);

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.INVALID_INPUT);
        assertThat(exception.getMessage()).isEqualTo(ErrorCode.INVALID_INPUT.getMessage());
    }

    @Test
    void RuntimeException을_상속한다() {
        BusinessException exception = new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);

        assertThat(exception).isInstanceOf(RuntimeException.class);
    }
}
