package backend.homestaybooking.shared.idempotency;

import backend.homestaybooking.shared.error.BusinessException;
import backend.homestaybooking.shared.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor kiểm tra sự hiện diện của Idempotency-Key trên các endpoint có annotation @Idempotent.
 */
@Component
public class IdempotencyInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        Idempotent idempotent = handlerMethod.getMethodAnnotation(Idempotent.class);
        if (idempotent == null) {
            idempotent = handlerMethod.getBeanType().getAnnotation(Idempotent.class);
        }

        if (idempotent != null && idempotent.required()) {
            String headerName = idempotent.headerName();
            String key = request.getHeader(headerName);
            if (key == null || key.isBlank()) {
                throw new BusinessException(
                    ErrorCode.IDEMPOTENCY_KEY_REQUIRED,
                    "Endpoint này yêu cầu header '%s' để đảm bảo tính Idempotent".formatted(headerName)
                );
            }
        }

        return true;
    }
}
