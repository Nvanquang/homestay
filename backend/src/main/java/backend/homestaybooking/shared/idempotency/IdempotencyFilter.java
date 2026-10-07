package backend.homestaybooking.shared.idempotency;

import backend.homestaybooking.shared.error.BusinessException;
import backend.homestaybooking.shared.error.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.util.HexFormat;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.util.ContentCachingResponseWrapper;

/**
 * Filter chặn và kiểm soát tính Idempotent cho các yêu cầu có header Idempotency-Key.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class IdempotencyFilter extends OncePerRequestFilter {

    public static final String IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
    public static final String IDEMPOTENT_REPLAYED_HEADER = "Idempotent-Replayed";

    private final IdempotencyStore idempotencyStore;
    private final Clock clock;
    private final HandlerExceptionResolver handlerExceptionResolver;

    public IdempotencyFilter(
        IdempotencyStore idempotencyStore,
        Clock clock,
        @Qualifier("handlerExceptionResolver") HandlerExceptionResolver handlerExceptionResolver
    ) {
        this.idempotencyStore = idempotencyStore;
        this.clock = clock;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String idempotencyKey = request.getHeader(IDEMPOTENCY_KEY_HEADER);

        // Bọc request để đọc cache body
        CachedBodyHttpServletRequest cachedRequest = (request instanceof CachedBodyHttpServletRequest cbr)
            ? cbr
            : new CachedBodyHttpServletRequest(request);

        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        // Nếu không có header Idempotency-Key, cho qua bình thường
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            try {
                filterChain.doFilter(cachedRequest, responseWrapper);
            } finally {
                responseWrapper.copyBodyToResponse();
            }
            return;
        }

        try {
            String requestHash = computeSha256(cachedRequest.getCachedBody());
            Optional<IdempotencyRecord> existingOpt = idempotencyStore.find(idempotencyKey);

            if (existingOpt.isPresent()) {
                IdempotencyRecord existing = existingOpt.get();

                // Nếu cùng key nhưng khác payload hash -> 400 IDEMPOTENCY_PAYLOAD_MISMATCH
                if (!existing.requestHash().equals(requestHash)) {
                    throw new BusinessException(
                        ErrorCode.IDEMPOTENCY_PAYLOAD_MISMATCH,
                        "Khóa Idempotency '%s' bị tái sử dụng với nội dung yêu cầu khác.".formatted(idempotencyKey)
                    );
                }

                // Nếu cùng key và cùng hash nhưng yêu cầu trước đó vẫn đang xử lý -> 409
                if (existing.status() == IdempotencyRecord.IdempotencyStatus.PENDING) {
                    throw new BusinessException(
                        ErrorCode.IDEMPOTENCY_IN_PROGRESS,
                        "Yêu cầu với khóa Idempotency '%s' đang trong quá trình xử lý.".formatted(idempotencyKey)
                    );
                }

                // Nếu đã xử lý thành công (COMPLETED) -> Trả lại ngay response đã lưu
                if (existing.status() == IdempotencyRecord.IdempotencyStatus.COMPLETED) {
                    response.setStatus(existing.responseStatus());
                    response.setHeader(IDEMPOTENT_REPLAYED_HEADER, "true");
                    response.setContentType("application/json;charset=UTF-8");
                    if (existing.responsePayload() != null) {
                        response.getOutputStream().write(existing.responsePayload().getBytes(StandardCharsets.UTF_8));
                    }
                    return;
                }
            }

            // Key chưa có: lưu trạng thái PENDING
            idempotencyStore.save(new IdempotencyRecord(
                idempotencyKey,
                requestHash,
                IdempotencyRecord.IdempotencyStatus.PENDING,
                0,
                null,
                clock.instant()
            ));

            try {
                filterChain.doFilter(cachedRequest, responseWrapper);

                int status = responseWrapper.getStatus();
                String responseBody = new String(responseWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);

                if (status >= 200 && status < 400) {
                    idempotencyStore.update(
                        idempotencyKey,
                        IdempotencyRecord.IdempotencyStatus.COMPLETED,
                        status,
                        responseBody
                    );
                } else {
                    idempotencyStore.update(
                        idempotencyKey,
                        IdempotencyRecord.IdempotencyStatus.FAILED,
                        status,
                        responseBody
                    );
                }
            } finally {
                responseWrapper.copyBodyToResponse();
            }
        } catch (Exception ex) {
            handlerExceptionResolver.resolveException(cachedRequest, responseWrapper, null, ex);
            responseWrapper.copyBodyToResponse();
        }
    }

    private String computeSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data != null ? data : new byte[0]);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Không tìm thấy thuật toán SHA-256", e);
        }
    }
}
