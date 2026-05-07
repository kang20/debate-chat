package debatechat.backend.common.transaction;

import debatechat.backend.common.exception.ErrorCode;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.doThrow;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class TransactionalCommandExecutorUnitTest {

    @Mock private TransactionTemplate txTemplate;
    @Mock private EntityManager em;
    @Mock private PlatformTransactionManager nonJpaTxManager;

    private TransactionalCommandExecutor executor;

    @BeforeEach
    void setUp() {
        executor = new TransactionalCommandExecutor(txTemplate, em, nonJpaTxManager);
    }

    @Test
    void txManager가_JpaTransactionManager가_아니면_원본_예외_그대로_전파() {
        given(txTemplate.execute(any())).willAnswer(inv -> {
            TransactionCallback<?> callback = inv.getArgument(0);
            return callback.doInTransaction(null);
        });

        RuntimeException flushException = new RuntimeException("flush failed");
        doThrow(flushException).when(em).flush();

        assertThatThrownBy(() ->
            executor.executeOrTranslate(
                () -> "result",
                IllegalStateException.class,
                ErrorCode.DUPLICATE_NICKNAME
            )
        )
            .isSameAs(flushException);
    }
}
