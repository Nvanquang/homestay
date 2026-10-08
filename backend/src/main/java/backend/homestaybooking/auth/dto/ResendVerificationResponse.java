package backend.homestaybooking.auth.dto;

public record ResendVerificationResponse(
    boolean success,
    int resendAvailableIn
) {}
