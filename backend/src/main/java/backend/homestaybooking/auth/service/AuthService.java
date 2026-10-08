package backend.homestaybooking.auth.service;

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
import backend.homestaybooking.auth.entity.UserEntity;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    RegisterResponse register(RegisterRequest request, String ipAddress, String userAgent);

    UserResponse login(LoginRequest request, String ipAddress, String userAgent, HttpServletRequest httpRequest);

    void logout(HttpServletRequest request);

    VerifyEmailResponse verifyEmail(VerifyEmailRequest request);

    ResendVerificationResponse resendVerification(ResendVerificationRequest request);

    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);

    TokenValidationResponse validateResetToken(String token);

    void resetPassword(ResetPasswordRequest request);

    UserResponse getCurrentUser(String email);

    UserResponse toUserResponse(UserEntity user);
}
