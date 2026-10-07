package backend.homestaybooking.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Cấu hình Springdoc OpenAPI 3.x và Swagger UI.
 * Chỉ kích hoạt trên môi trường phát triển nội bộ (profile local) để đảm bảo an toàn thông tin sản xuất.
 */
@Configuration
@Profile("local")
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String sessionSecurityScheme = "CookieSessionAuth";
        final String csrfSecurityScheme = "CsrfTokenAuth";

        return new OpenAPI()
            .info(new Info()
                .title("Homestay Booking Platform API")
                .version("1.0.0")
                .description("Hệ thống API nền tảng đặt phòng Homestay (Modular Monolith - Spring Boot 4)")
                .contact(new Contact()
                    .name("Engineering Team")
                    .email("dev@homestay.local"))
                .license(new License().name("Internal Proprietary").url("https://homestay.local")))
            .components(new Components()
                .addSecuritySchemes(sessionSecurityScheme, new SecurityScheme()
                    .name("HOMESTAY_SESSION")
                    .type(SecurityScheme.Type.APIKEY)
                    .in(SecurityScheme.In.COOKIE)
                    .description("Spring Session JDBC Cookie"))
                .addSecuritySchemes(csrfSecurityScheme, new SecurityScheme()
                    .name("X-XSRF-TOKEN")
                    .type(SecurityScheme.Type.APIKEY)
                    .in(SecurityScheme.In.HEADER)
                    .description("CSRF Protection Token")))
            .addSecurityItem(new SecurityRequirement()
                .addList(sessionSecurityScheme)
                .addList(csrfSecurityScheme));
    }
}
