package debatechat.backend.common.transaction;

import debatechat.backend.common.exception.BusinessException;
import debatechat.backend.common.exception.ErrorCode;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.function.Supplier;

@Component
@RequiredArgsConstructor
public class TransactionalCommandExecutor {
    private final TransactionTemplate txTemplate;
    private final EntityManager em;
    private final PlatformTransactionManager txManager;

    public <T> T executeOrTranslate(
        Supplier<T> action,
        Class<? extends RuntimeException> exceptionType,
        ErrorCode errorCode
    ) {
        try {
            return txTemplate.execute(status -> {
                T result = action.get();
                flushTranslated();
                return result;
            });
        } catch (RuntimeException e) {
            if (exceptionType.isInstance(e)) {
                throw new BusinessException(errorCode);
            }
            throw e;
        }
    }

    private void flushTranslated() {
        try {
            em.flush();
        } catch (RuntimeException e) {
            if (txManager instanceof JpaTransactionManager jpa) {
                throw jpa.getJpaDialect().translateExceptionIfPossible(e);
            }
            throw e;
        }
    }
}
