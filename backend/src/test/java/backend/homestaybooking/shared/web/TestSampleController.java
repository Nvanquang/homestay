package backend.homestaybooking.shared.web;

import backend.homestaybooking.shared.error.BusinessException;
import backend.homestaybooking.shared.error.ErrorCode;
import backend.homestaybooking.shared.idempotency.Idempotent;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller giả lập phục vụ kiểm thử GlobalExceptionHandler và Idempotency.
 */
@RestController
@RequestMapping("/test-api")
public class TestSampleController {

    private final AtomicInteger executionCounter = new AtomicInteger(0);

    public record TestRequest(
        @NotBlank(message = "Tên không được để trống")
        String name,

        @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
        int quantity
    ) {}

    public record TestResponse(
        String name,
        int count
    ) {}

    @PostMapping("/validation")
    public ResponseEntity<String> testValidation(@Valid @RequestBody TestRequest request) {
        return ResponseEntity.ok("OK: " + request.name());
    }

    @GetMapping("/business-error")
    public ResponseEntity<String> testBusinessError() {
        throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy phòng kiểm thử");
    }

    @Idempotent
    @PostMapping("/idempotent-action")
    public ResponseEntity<TestResponse> testIdempotent(@RequestBody TestRequest request) {
        int count = executionCounter.incrementAndGet();
        return ResponseEntity.ok(new TestResponse(request.name(), count));
    }

    public void resetCounter() {
        executionCounter.set(0);
    }
}
