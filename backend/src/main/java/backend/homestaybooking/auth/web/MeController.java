package backend.homestaybooking.auth.web;

import backend.homestaybooking.auth.dto.UserResponse;
import backend.homestaybooking.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint thông tin phiên người dùng hiện tại tại /api/v1/me.
 * Nạp thông tin người dùng từ cơ sở dữ liệu thật và trả về hồ sơ UserResponse đầy đủ.
 */
@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class MeController {

    private final AuthService authService;

    public record UpdateProfileRequest(
        String fullName
    ) {}

    @GetMapping
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        UserResponse userResponse = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Endpoint POST mutation để kiểm thử xác thực và kiểm tra CSRF token.
     */
    @PostMapping
    public ResponseEntity<String> updateProfile(@RequestBody(required = false) UpdateProfileRequest request) {
        return ResponseEntity.ok("Cập nhật thành công");
    }
}
