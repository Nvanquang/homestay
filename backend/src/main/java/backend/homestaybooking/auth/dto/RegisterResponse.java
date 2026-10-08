package backend.homestaybooking.auth.dto;

public record RegisterResponse(
    String emailMasked,
    int resendAvailableIn
) {}
