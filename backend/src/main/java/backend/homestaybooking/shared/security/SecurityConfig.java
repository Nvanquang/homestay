package backend.homestaybooking.shared.security;

import backend.homestaybooking.shared.error.ErrorCode;
import backend.homestaybooking.shared.error.ProblemDetailsResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

/**
 * Cấu hình Spring Security:
 * - Mặc định từ chối: .anyRequest().denyAll()
 * - Xác thực mật khẩu: Argon2id chuẩn OWASP
 * - Bảo vệ CSRF: CookieCsrfTokenRepository (cookie XSRF-TOKEN)
 * - Header bảo mật: nosniff, DENY iframe, HSTS
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final ObjectMapper objectMapper;

    public SecurityConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Quản lý phiên: IF_REQUIRED, chống cố định phiên (changeSessionId)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation(fixation -> fixation.changeSessionId())
            )

            // 2. CSRF: Cookie XSRF-TOKEN đọc được bởi JS (Next.js client)
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                .ignoringRequestMatchers(
                    "/api/v1/auth/**",
                    "/api/v1/webhooks/**"
                )
            )

            // 3. Phân quyền: MẶC ĐỊNH TỪ CHỐI (Deny by default)
            .authorizeHttpRequests(auth -> auth
                // Công khai: Health check và xác thực ban đầu
                .requestMatchers(HttpMethod.GET, "/api/v1/health").permitAll()
                .requestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/register",
                    "/api/v1/auth/verify-email",
                    "/api/v1/auth/resend-verification",
                    "/api/v1/auth/forgot-password",
                    "/api/v1/auth/reset-password/**",
                    "/api/v1/auth/logout"
                ).permitAll()

                // Tài liệu API Swagger & OpenAPI
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // Endpoint người dùng đã xác thực
                .requestMatchers("/api/v1/me/**").authenticated()
                .requestMatchers("/api/v1/auth/me").authenticated()

                // Endpoint kiểm thử
                .requestMatchers("/test-api/**").permitAll()

                // BẤT KỲ YÊU CẦU NÀO KHÁC CHƯA KHAI BÁO: MẶC ĐỊNH TỪ CHỐI
                .anyRequest().denyAll()
            )

            // 4. Header bảo mật API
            .headers(headers -> headers
                .contentTypeOptions(Customizer.withDefaults()) // nosniff
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny) // DENY
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
            )

            // 5. Xử lý ngoại lệ bảo mật chuẩn Problem Details RFC 7807
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    ProblemDetailsResponse body = new ProblemDetailsResponse(
                        URI.create("about:blank"),
                        "Unauthorized",
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Yêu cầu xác thực tài khoản để truy cập tài nguyên này",
                        ErrorCode.UNAUTHORIZED.name(),
                        request.getRequestURI(),
                        null
                    );
                    objectMapper.writeValue(response.getWriter(), body);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    ProblemDetailsResponse body = new ProblemDetailsResponse(
                        URI.create("about:blank"),
                        "Forbidden",
                        HttpServletResponse.SC_FORBIDDEN,
                        "Bạn không có quyền thực hiện hành động này hoặc thiếu CSRF token hợp lệ",
                        ErrorCode.FORBIDDEN.name(),
                        request.getRequestURI(),
                        null
                    );
                    objectMapper.writeValue(response.getWriter(), body);
                })
            );

        return http.build();
    }
}
