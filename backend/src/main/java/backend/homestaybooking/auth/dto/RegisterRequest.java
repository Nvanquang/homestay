package backend.homestaybooking.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 80, message = "Họ và tên phải từ 2 đến 80 ký tự")
    String fullName,

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email chưa đúng định dạng")
    @Size(max = 254, message = "Email tối đa 254 ký tự")
    String email,

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 128, message = "Mật khẩu phải từ 8 đến 128 ký tự")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*[0-9]).*$", message = "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số")
    String password,

    @NotNull(message = "Bắt buộc xác nhận Điều khoản dịch vụ")
    @AssertTrue(message = "Bắt buộc đồng ý Điều khoản dịch vụ và Chính sách bảo mật")
    Boolean acceptTerms
) {}
