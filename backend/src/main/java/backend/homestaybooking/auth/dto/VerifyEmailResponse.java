package backend.homestaybooking.auth.dto;

public record VerifyEmailResponse(
    String result,
    String message
) {}
