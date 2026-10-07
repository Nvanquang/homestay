package backend.homestaybooking.shared.error;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Global Exception Handler chuẩn RFC 7807 / RFC 9457 Problem Details.
 * Đảm bảo thống nhất định dạng phản hồi lỗi và không lộ chi tiết nhạy cảm (stack trace, SQL).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final URI DEFAULT_TYPE = URI.create("about:blank");

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ProblemDetailsResponse> handleBusinessException(
        BusinessException ex,
        HttpServletRequest request
    ) {
        ErrorCode errorCode = ex.getErrorCode();
        HttpStatus status = errorCode.getStatus();

        if (status.is5xxServerError()) {
            log.error("Lỗi nghiệp vụ mức hệ thống (5xx): {} - {}", errorCode, ex.getMessage(), ex);
        } else {
            log.warn("Lỗi nghiệp vụ khách hàng (4xx): {} - {}", errorCode, ex.getMessage());
        }

        ProblemDetailsResponse response = new ProblemDetailsResponse(
            DEFAULT_TYPE,
            status.getReasonPhrase(),
            status.value(),
            ex.getMessage(),
            errorCode.name(),
            request.getRequestURI(),
            null
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetailsResponse> handleValidationException(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        List<ProblemDetailsResponse.InvalidParam> invalidParams = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            invalidParams.add(new ProblemDetailsResponse.InvalidParam(
                fieldError.getField(),
                fieldError.getCode() != null ? fieldError.getCode() : "INVALID",
                fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Giá trị không hợp lệ"
            ));
        }

        HttpStatus status = HttpStatus.UNPROCESSABLE_ENTITY;
        ProblemDetailsResponse response = new ProblemDetailsResponse(
            DEFAULT_TYPE,
            status.getReasonPhrase(),
            status.value(),
            "Dữ liệu gửi lên vi phạm quy tắc kiểm tra tính hợp lệ",
            ErrorCode.VALIDATION_FAILED.name(),
            request.getRequestURI(),
            invalidParams
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetailsResponse> handleHttpMessageNotReadable(
        HttpMessageNotReadableException ex,
        HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ProblemDetailsResponse response = new ProblemDetailsResponse(
            DEFAULT_TYPE,
            status.getReasonPhrase(),
            status.value(),
            "Cú pháp nội dung yêu cầu (JSON) không hợp lệ hoặc thiếu trường bắt buộc",
            ErrorCode.BAD_REQUEST.name(),
            request.getRequestURI(),
            null
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ProblemDetailsResponse> handleNoResourceFound(
        NoResourceFoundException ex,
        HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        ProblemDetailsResponse response = new ProblemDetailsResponse(
            DEFAULT_TYPE,
            status.getReasonPhrase(),
            status.value(),
            "Không tìm thấy tài nguyên yêu cầu tại đường dẫn: " + request.getRequestURI(),
            ErrorCode.RESOURCE_NOT_FOUND.name(),
            request.getRequestURI(),
            null
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ProblemDetailsResponse> handleMethodNotSupported(
        HttpRequestMethodNotSupportedException ex,
        HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.METHOD_NOT_ALLOWED;
        ProblemDetailsResponse response = new ProblemDetailsResponse(
            DEFAULT_TYPE,
            status.getReasonPhrase(),
            status.value(),
            "Phương thức HTTP " + ex.getMethod() + " không được hỗ trợ cho endpoint này",
            ErrorCode.BAD_REQUEST.name(),
            request.getRequestURI(),
            null
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetailsResponse> handleGeneralException(
        Exception ex,
        HttpServletRequest request
    ) {
        log.error("Lỗi máy chủ không lường trước tại URL {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ProblemDetailsResponse response = new ProblemDetailsResponse(
            DEFAULT_TYPE,
            status.getReasonPhrase(),
            status.value(),
            "Đã xảy ra sự cố máy chủ nội bộ. Vui lòng liên hệ quản trị viên.",
            ErrorCode.INTERNAL_SERVER_ERROR.name(),
            request.getRequestURI(),
            null
        );

        return ResponseEntity.status(status).body(response);
    }
}
