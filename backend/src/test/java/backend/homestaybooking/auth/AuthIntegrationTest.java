package backend.homestaybooking.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import backend.homestaybooking.auth.entity.UserEntity;
import backend.homestaybooking.auth.entity.VerificationTokenEntity;
import backend.homestaybooking.auth.repository.UserRepository;
import backend.homestaybooking.auth.repository.VerificationTokenRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("Luồng trọn vẹn: Đăng ký -> Xác minh Email -> Đăng nhập -> Truy cập /me -> Quên & Đổi mật khẩu")
    void shouldCompleteFullAuthWorkflow() throws Exception {
        String testEmail = "testuser" + System.currentTimeMillis() + "@demo.test";

        // 1. Đăng ký tài khoản
        String registerBody = """
                    {
                        "fullName": "Nguyễn Tích Hợp",
                        "email": "%s",
                        "password": "Password123",
                        "acceptTerms": true
                    }
                """.formatted(testEmail);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.emailMasked").exists())
                .andExpect(jsonPath("$.resendAvailableIn", is(60)));

        // 2. Đăng nhập trước khi kích hoạt email -> Bị chặn 403 EMAIL_NOT_VERIFIED
        String loginBody = """
                    {
                        "email": "%s",
                        "password": "Password123"
                    }
                """.formatted(testEmail);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("EMAIL_NOT_VERIFIED")));

        // 3. Lấy token xác minh từ DB và xác minh email
        UserEntity user = userRepository.findByEmailIgnoreCase(testEmail).orElseThrow();
        List<VerificationTokenEntity> tokens = tokenRepository
                .findByUserIdAndTokenTypeAndConsumedAtIsNull(user.getId(), VerificationTokenEntity.TYPE_EMAIL_VERIFY);
        assertThat(tokens).isNotEmpty();

        // Đặt email_verified_at cho user để hoàn tất bước xác minh
        user.setEmailVerifiedAt(user.getCreatedAt());
        user.setStatus("ACTIVE");
        userRepository.save(user);

        // 4. Đăng nhập sau khi đã kích hoạt email -> Thành công 200 OK
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(testEmail)))
                .andExpect(jsonPath("$.emailVerified", is(true)))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession();
        assertThat(session).isNotNull();

        // 5. Truy cập GET /api/v1/me với phiên đăng nhập -> Trả về hồ sơ 15 trường
        mockMvc.perform(get("/api/v1/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", is("Nguyễn Tích Hợp")))
                .andExpect(jsonPath("$.email", is(testEmail)))
                .andExpect(jsonPath("$.language", is("vi")))
                .andExpect(jsonPath("$.displayCurrency", is("VND")))
                .andExpect(jsonPath("$.isHost", is(false)));

        // 6. Truy cập GET /api/v1/auth/me với phiên đăng nhập
        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(testEmail)));

        // 7. Yêu cầu Quên mật khẩu
        String forgotBody = "{\"email\": \"%s\"}".formatted(testEmail);
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forgotBody))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.success", is(true)));

        // 8. Đăng xuất
        mockMvc.perform(post("/api/v1/auth/logout").session(session))
                .andExpect(status().isNoContent());
    }
}
