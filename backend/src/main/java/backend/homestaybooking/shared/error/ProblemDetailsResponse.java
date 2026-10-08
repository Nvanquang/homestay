package backend.homestaybooking.shared.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.net.URI;
import java.util.List;

/**
 * Cấu trúc phản hồi lỗi chuẩn RFC 7807 / RFC 9457 Problem Details.
 * Không bao giờ để lộ stack trace hay câu truy vấn SQL nội bộ ra client.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProblemDetailsResponse(
    URI type,
    String title,
    int status,
    String detail,
    String code,
    String instance,
    List<InvalidParam> invalidParams,
    String lockedUntil,
    Integer retryAfterSec
) {
    public ProblemDetailsResponse(
        URI type,
        String title,
        int status,
        String detail,
        String code,
        String instance,
        List<InvalidParam> invalidParams
    ) {
        this(type, title, status, detail, code, instance, invalidParams, null, null);
    }

    public record InvalidParam(
        String field,
        String code,
        String message
    ) {}
}
