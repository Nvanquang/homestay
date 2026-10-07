package backend.homestaybooking.shared.security;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import backend.homestaybooking.shared.security.ratelimit.RateLimitFilter;
import backend.homestaybooking.shared.security.ratelimit.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private RateLimiterService rateLimiterService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        rateLimiterService.clear();
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .apply(springSecurity())
            .addFilter(rateLimitFilter)
            .build();
    }

    @Test
    @DisplayName("Endpoint public /api/v1/health cho phép truy cập tự do không cần đăng nhập")
    void shouldAllowPublicHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status", is("UP")))
            .andExpect(header().string("X-Content-Type-Options", "nosniff"))
            .andExpect(header().string("X-Frame-Options", "DENY"));
    }

    @Test
    @DisplayName("Endpoint chưa khai báo quyền bị mặc định từ chối (denyAll) trả về 401 hoặc 403")
    void shouldDenyUnmappedEndpointsByDefault() throws Exception {
        mockMvc.perform(get("/api/v1/unmapped-resource-secret"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/me yêu cầu xác thực, từ chối khách vãng lai bằng 401 Unauthorized")
    void shouldRequireAuthenticationForMeEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code", is("UNAUTHORIZED")));
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"USER"})
    @DisplayName("GET /api/v1/me cho phép người dùng đã xác thực truy cập")
    void shouldAllowAuthenticatedUserToAccessMeEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username", is("guest@example.com")));
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"USER"})
    @DisplayName("POST mutation không có CSRF token bị Spring Security từ chối 403 Forbidden")
    void shouldRejectPostWithoutCsrfToken() throws Exception {
        mockMvc.perform(post("/api/v1/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\": \"Nguyen Van B\"}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code", is("FORBIDDEN")));
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"USER"})
    @DisplayName("POST mutation kèm CSRF token hợp lệ được chấp nhận")
    void shouldAcceptPostWithValidCsrfToken() throws Exception {
        mockMvc.perform(post("/api/v1/me")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\": \"Nguyen Van B\"}"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Vượt quá ngưỡng Rate Limit (5 yêu cầu) trên route nhạy cảm bị trả về 429 Too Many Requests")
    void shouldReturn429WhenRateLimitExceeded() throws Exception {
        String testRateLimitUrl = "/api/v1/auth/login";

        // 5 lần đầu thành công trong hạn mức
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post(testRateLimitUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"user@example.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isNotFound()); // Vì controller auth thật sẽ implement ở S01
        }

        // Lần thứ 6: Bị chặn bởi Rate Limiter
        mockMvc.perform(post(testRateLimitUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@example.com\",\"password\":\"wrong\"}"))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().string("Retry-After", "60"))
            .andExpect(jsonPath("$.code", is("RATE_LIMITED")))
            .andExpect(jsonPath("$.status", is(429)));
    }
}
