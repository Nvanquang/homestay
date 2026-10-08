package backend.homestaybooking.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Token không được để trống")
    @Size(min = 1, max = 128, message = "Token không hợp lệ")
    String token,

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 128, message = "Mật khẩu phải từ 8 đến 128 ký tự")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*[0-9]).*$", message = "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số")
    String password
) {}
