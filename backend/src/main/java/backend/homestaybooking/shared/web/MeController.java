package backend.homestaybooking.shared.web;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint thông tin phiên người dùng hiện tại (Yêu cầu xác thực phiên đăng nhập).
 */
@RestController
@RequestMapping("/api/v1/me")
public class MeController {

    public record CurrentUserResponse(
        String username,
        List<String> authorities
    ) {}

    public record UpdateProfileRequest(
        String fullName
    ) {}

    @GetMapping
    public ResponseEntity<CurrentUserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        List<String> authorities = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .toList();

        return ResponseEntity.ok(new CurrentUserResponse(
            authentication.getName(),
            authorities
        ));
    }

    /**
     * Endpoint POST mutation để kiểm thử xác thực và kiểm tra CSRF token.
     */
    @PostMapping
    public ResponseEntity<String> updateProfile(@RequestBody(required = false) UpdateProfileRequest request) {
        return ResponseEntity.ok("Cập nhật thành công");
    }
}
