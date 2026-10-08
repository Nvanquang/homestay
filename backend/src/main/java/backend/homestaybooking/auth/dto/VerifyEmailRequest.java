package backend.homestaybooking.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequest(
    @NotBlank(message = "Token không được để trống")
    @Size(min = 1, max = 128, message = "Token không hợp lệ")
    String token
) {}
