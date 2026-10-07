package backend.homestaybooking.shared.web;

import java.time.Clock;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint kiểm tra tình trạng hoạt động của hệ thống (Public).
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final Clock clock;

    public HealthController(Clock clock) {
        this.clock = clock;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "homestay-backend",
            "timestamp", clock.instant().toString()
        ));
    }
}
