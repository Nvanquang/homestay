package backend.homestaybooking.shared.security.ratelimit;

import backend.homestaybooking.shared.error.ErrorCode;
import backend.homestaybooking.shared.error.ProblemDetailsResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.Set;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter giới hạn tần suất yêu cầu (Rate Limiting) theo địa chỉ IP bằng Bucket4j.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> RATE_LIMITED_PATHS = Set.of(
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/forgot-password",
        "/test-api/rate-limit"
    );

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    public RateLimitFilter(RateLimiterService rateLimiterService, ObjectMapper objectMapper) {
        this.rateLimiterService = rateLimiterService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String uri = request.getRequestURI();

        if (isRateLimitedPath(uri)) {
            String clientIp = extractClientIp(request);
            String key = clientIp + ":" + uri;

            Bucket bucket = rateLimiterService.resolveDefaultBucket(key);
            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", "60");
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");

                ProblemDetailsResponse problemResponse = new ProblemDetailsResponse(
                    URI.create("about:blank"),
                    "Too Many Requests",
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    "Thao tác quá nhanh, vượt giới hạn tần suất yêu cầu. Vui lòng thử lại sau 60 giây.",
                    ErrorCode.RATE_LIMITED.name(),
                    uri,
                    null
                );

                objectMapper.writeValue(response.getWriter(), problemResponse);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedPath(String uri) {
        return RATE_LIMITED_PATHS.stream().anyMatch(uri::startsWith);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
