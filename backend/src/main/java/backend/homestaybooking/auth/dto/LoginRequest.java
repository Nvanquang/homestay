package backend.homestaybooking.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email chưa đúng định dạng")
    @Size(max = 254, message = "Email tối đa 254 ký tự")
    String email,

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(max = 128, message = "Mật khẩu tối đa 128 ký tự")
    String password,

    Boolean rememberMe
) {
    public boolean isRememberMe() {
        return Boolean.TRUE.equals(rememberMe);
    }
}
