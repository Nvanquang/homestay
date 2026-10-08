package backend.homestaybooking.auth.web;

import backend.homestaybooking.auth.dto.ForgotPasswordRequest;
import backend.homestaybooking.auth.dto.ForgotPasswordResponse;
import backend.homestaybooking.auth.dto.LoginRequest;
import backend.homestaybooking.auth.dto.RegisterRequest;
import backend.homestaybooking.auth.dto.RegisterResponse;
import backend.homestaybooking.auth.dto.ResendVerificationRequest;
import backend.homestaybooking.auth.dto.ResendVerificationResponse;
import backend.homestaybooking.auth.dto.ResetPasswordRequest;
import backend.homestaybooking.auth.dto.TokenValidationResponse;
import backend.homestaybooking.auth.dto.UserResponse;
import backend.homestaybooking.auth.dto.VerifyEmailRequest;
import backend.homestaybooking.auth.dto.VerifyEmailResponse;
import backend.homestaybooking.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
        @Valid @RequestBody RegisterRequest request,
        HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        RegisterResponse response = authService.register(request, ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpRequest
    ) {
        String ip = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        UserResponse response = authService.login(request, ip, userAgent, httpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        authService.logout(httpRequest);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(
        @Valid @RequestBody VerifyEmailRequest request
    ) {
        VerifyEmailResponse response = authService.verifyEmail(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ResendVerificationResponse> resendVerification(
        @Valid @RequestBody ResendVerificationRequest request
    ) {
        ResendVerificationResponse response = authService.resendVerification(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request
    ) {
        ForgotPasswordResponse response = authService.forgotPassword(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping("/reset-password/validate")
    public ResponseEntity<TokenValidationResponse> validateResetToken(
        @RequestParam("token") String token
    ) {
        TokenValidationResponse response = authService.validateResetToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
        @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponse response = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
