package backend.homestaybooking.auth.dto;

public record ForgotPasswordResponse(
    boolean success,
    String message
) {}
