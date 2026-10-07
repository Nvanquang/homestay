package backend.homestaybooking.shared.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Cấu hình thuộc tính ứng dụng có xác thực @Validated theo nguyên tắc Clean Architecture.
 * Không dùng @Value tùy tiện trong mã nguồn.
 */
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
    @NotBlank(message = "Thuộc tính 'app.name' không được để trống")
    String name,

    @NotBlank(message = "Thuộc tính 'app.environment' không được để trống")
    String environment,

    @NotNull(message = "Cấu hình 'app.security' là bắt buộc")
    @Valid
    SecurityProperties security
) {
    public record SecurityProperties(
        @NotBlank(message = "Thuộc tính 'app.security.session-cookie-name' không được để trống")
        String sessionCookieName
    ) {}
}
