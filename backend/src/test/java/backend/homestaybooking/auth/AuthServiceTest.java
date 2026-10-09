package backend.homestaybooking.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import backend.homestaybooking.auth.dto.ForgotPasswordRequest;
import backend.homestaybooking.auth.dto.ForgotPasswordResponse;
import backend.homestaybooking.auth.dto.LoginRequest;
import backend.homestaybooking.auth.dto.RegisterRequest;
import backend.homestaybooking.auth.dto.RegisterResponse;
import backend.homestaybooking.auth.dto.ResetPasswordRequest;
import backend.homestaybooking.auth.dto.TokenValidationResponse;
import backend.homestaybooking.auth.dto.UserResponse;
import backend.homestaybooking.auth.dto.VerifyEmailRequest;
import backend.homestaybooking.auth.dto.VerifyEmailResponse;
import backend.homestaybooking.auth.entity.LoginAttemptEntity;
import backend.homestaybooking.auth.entity.RoleEntity;
import backend.homestaybooking.auth.entity.UserEntity;
import backend.homestaybooking.auth.entity.VerificationTokenEntity;
import backend.homestaybooking.auth.repository.LoginAttemptRepository;
import backend.homestaybooking.auth.repository.RoleRepository;
import backend.homestaybooking.auth.repository.UserConsentRepository;
import backend.homestaybooking.auth.repository.UserRepository;
import backend.homestaybooking.auth.service.AuthService;
import backend.homestaybooking.auth.service.TokenService;
import backend.homestaybooking.auth.service.impl.AuthServiceImpl;
import backend.homestaybooking.shared.audit.AuditService;
import backend.homestaybooking.shared.error.BusinessException;
import backend.homestaybooking.shared.error.ErrorCode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceTest {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private LoginAttemptRepository loginAttemptRepository;
    private UserConsentRepository userConsentRepository;
    private TokenService tokenService;
    private PasswordEncoder passwordEncoder;
    private AuditService auditService;
    private Clock clock;

    private AuthService authService;

    private final Instant fixedNow = Instant.parse("2026-10-07T10:00:00Z");

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        roleRepository = mock(RoleRepository.class);
        loginAttemptRepository = mock(LoginAttemptRepository.class);
        userConsentRepository = mock(UserConsentRepository.class);
        tokenService = mock(TokenService.class);
        passwordEncoder = mock(PasswordEncoder.class);
        auditService = mock(AuditService.class);
        clock = Clock.fixed(fixedNow, ZoneId.of("UTC"));

        authService = new AuthServiceImpl(
                userRepository,
                roleRepository,
                loginAttemptRepository,
                userConsentRepository,
                tokenService,
                passwordEncoder,
                auditService,
                clock);
    }

    @Test
    @DisplayName("Đăng ký thành công: Lưu user, băm mật khẩu Argon2, sinh verification token và ẩn email")
    void shouldRegisterSuccessfully() {
        RegisterRequest request = new RegisterRequest(
                "Nguyễn Văn Khách",
                "guest@demo.test",
                "Password123",
                true);

        when(userRepository.existsByEmailIgnoreCase("guest@demo.test")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("argon2_hashed_pass");

        RoleEntity role = new RoleEntity("GUEST", "Khách", fixedNow);
        when(roleRepository.findByName("GUEST")).thenReturn(Optional.of(role));

        UserEntity savedUser = new UserEntity("guest@demo.test", "Nguyễn Văn Khách", "argon2_hashed_pass", fixedNow);
        savedUser.setId(100L);
        savedUser.getRoles().add(role);

        when(userRepository.save(any(UserEntity.class))).thenReturn(savedUser);
        when(tokenService.createEmailVerificationToken(any(UserEntity.class))).thenReturn("vtok_abc123");

        RegisterResponse response = authService.register(request, "127.0.0.1", "TestAgent");

        assertThat(response.emailMasked()).isEqualTo("gu***@demo.test");
        assertThat(response.resendAvailableIn()).isEqualTo(60);
        verify(tokenService).createEmailVerificationToken(savedUser);
        verify(userConsentRepository, org.mockito.Mockito.times(2)).save(any());
    }

    @Test
    @DisplayName("Đăng ký thất bại: Email đã tồn tại ném lỗi 409 EMAIL_ALREADY_EXISTS")
    void shouldFailRegisterWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest(
                "Nguyễn Văn Khách",
                "guest@demo.test",
                "Password123",
                true);

        when(userRepository.existsByEmailIgnoreCase("guest@demo.test")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request, "127.0.0.1", "TestAgent"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo(ErrorCode.EMAIL_ALREADY_EXISTS);
                });
    }

    @Test
    @DisplayName("Đăng nhập thất bại: Tài khoản đang trong thời gian tạm khóa ném lỗi 423 ACCOUNT_LOCKED")
    void shouldFailLoginWhenAccountLocked() {
        LoginRequest request = new LoginRequest("locked@demo.test", "Password123", false);

        UserEntity lockedUser = new UserEntity("locked@demo.test", "Locked User", "hash", fixedNow);
        lockedUser.setId(1L);
        lockedUser.setStatus("LOCKED");
        lockedUser.setLockedUntil(fixedNow.plus(Duration.ofMinutes(10)));

        when(userRepository.findByEmailIgnoreCase("locked@demo.test")).thenReturn(Optional.of(lockedUser));

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent", null))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo(ErrorCode.ACCOUNT_LOCKED);
                });
    }

    @Test
    @DisplayName("Đăng nhập thất bại: Vượt quá 5 lần thử sai trong 15 phút sẽ khóa tài khoản và ném lỗi 423")
    void shouldLockAccountWhenExceedingMaxFailedAttempts() {
        LoginRequest request = new LoginRequest("user@demo.test", "WrongPassword", false);

        UserEntity user = new UserEntity("user@demo.test", "Test User", "hash", fixedNow);
        user.setId(2L);
        when(userRepository.findByEmailIgnoreCase("user@demo.test")).thenReturn(Optional.of(user));
        when(loginAttemptRepository.countByEmailIgnoreCaseAndSuccessFalseAndAttemptedAtAfter(eq("user@demo.test"),
                any(Instant.class)))
                .thenReturn(5L);

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent", null))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo(ErrorCode.ACCOUNT_LOCKED);
                });

        verify(userRepository).save(user);
        assertThat(user.getStatus()).isEqualTo("LOCKED");
        assertThat(user.getLockedUntil()).isNotNull();
    }

    @Test
    @DisplayName("Đăng nhập thất bại: Mật khẩu sai ném lỗi 401 INVALID_CREDENTIALS")
    void shouldFailLoginWhenPasswordIncorrect() {
        LoginRequest request = new LoginRequest("user@demo.test", "WrongPass", false);

        UserEntity user = new UserEntity("user@demo.test", "Test User", "hash", fixedNow);
        user.setId(2L);
        when(userRepository.findByEmailIgnoreCase("user@demo.test")).thenReturn(Optional.of(user));
        when(loginAttemptRepository.countByEmailIgnoreCaseAndSuccessFalseAndAttemptedAtAfter(eq("user@demo.test"),
                any(Instant.class)))
                .thenReturn(1L);
        when(passwordEncoder.matches("WrongPass", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent", null))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo(ErrorCode.INVALID_CREDENTIALS);
                });

        verify(loginAttemptRepository).save(any(LoginAttemptEntity.class));
    }

    @Test
    @DisplayName("Đăng nhập thất bại: Chưa xác minh email ném lỗi 403 EMAIL_NOT_VERIFIED")
    void shouldFailLoginWhenEmailNotVerified() {
        LoginRequest request = new LoginRequest("unverified@demo.test", "CorrectPass", false);

        UserEntity user = new UserEntity("unverified@demo.test", "Test User", "hash", fixedNow);
        user.setId(3L);
        user.setStatus("UNVERIFIED");
        user.setEmailVerifiedAt(null);

        when(userRepository.findByEmailIgnoreCase("unverified@demo.test")).thenReturn(Optional.of(user));
        when(loginAttemptRepository.countByEmailIgnoreCaseAndSuccessFalseAndAttemptedAtAfter(eq("unverified@demo.test"),
                any(Instant.class)))
                .thenReturn(0L);
        when(passwordEncoder.matches("CorrectPass", "hash")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent", null))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo(ErrorCode.EMAIL_NOT_VERIFIED);
                });
    }

    @Test
    @DisplayName("Đăng nhập thành công: Trả về UserResponse đầy đủ 15 trường hồ sơ")
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("active@demo.test", "CorrectPass", false);

        RoleEntity role = new RoleEntity("GUEST", "Khách", fixedNow);
        UserEntity user = new UserEntity("active@demo.test", "Active User", "hash", fixedNow);
        user.setId(4L);
        user.setStatus("ACTIVE");
        user.setEmailVerifiedAt(fixedNow);
        user.getRoles().add(role);

        when(userRepository.findByEmailIgnoreCase("active@demo.test")).thenReturn(Optional.of(user));
        when(loginAttemptRepository.countByEmailIgnoreCaseAndSuccessFalseAndAttemptedAtAfter(eq("active@demo.test"),
                any(Instant.class)))
                .thenReturn(0L);
        when(passwordEncoder.matches("CorrectPass", "hash")).thenReturn(true);

        UserResponse response = authService.login(request, "127.0.0.1", "TestAgent", null);

        assertThat(response.id()).isEqualTo("usr_4");
        assertThat(response.email()).isEqualTo("active@demo.test");
        assertThat(response.emailVerified()).isTrue();
        assertThat(response.status()).isEqualTo("ACTIVE");
        assertThat(response.isHost()).isFalse();
    }

    @Test
    @DisplayName("Xác minh email thành công: Cập nhật status ACTIVE và email_verified_at")
    void shouldVerifyEmailSuccessfully() {
        VerifyEmailRequest request = new VerifyEmailRequest("vtok_valid123");

        UserEntity user = new UserEntity("guest@demo.test", "Guest", "hash", fixedNow);
        user.setId(5L);

        when(tokenService.validateToken("vtok_valid123", VerificationTokenEntity.TYPE_EMAIL_VERIFY))
                .thenReturn(new TokenService.TokenValidationStatus(true, null, user));
        when(tokenService.consumeTokenAtomic("vtok_valid123", VerificationTokenEntity.TYPE_EMAIL_VERIFY))
                .thenReturn(Optional.of(user));

        VerifyEmailResponse response = authService.verifyEmail(request);

        assertThat(response.result()).isEqualTo("VERIFIED");
        assertThat(user.getStatus()).isEqualTo("ACTIVE");
        assertThat(user.getEmailVerifiedAt()).isEqualTo(fixedNow);
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Quên mật khẩu & Đặt lại mật khẩu: Sinh token, kiểm tra hợp lệ và đổi mật khẩu")
    void shouldHandleForgotPasswordAndReset() {
        UserEntity user = new UserEntity("reset@demo.test", "Reset User", "oldHash", fixedNow);
        user.setId(6L);
        when(userRepository.findByEmailIgnoreCase("reset@demo.test")).thenReturn(Optional.of(user));
        when(tokenService.createPasswordResetToken(user)).thenReturn("rtok_xyz789");

        ForgotPasswordResponse forgotResponse = authService
                .forgotPassword(new ForgotPasswordRequest("reset@demo.test"));
        assertThat(forgotResponse.success()).isTrue();

        when(tokenService.validateToken("rtok_xyz789", VerificationTokenEntity.TYPE_PASSWORD_RESET))
                .thenReturn(new TokenService.TokenValidationStatus(true, null, user));

        TokenValidationResponse valResponse = authService.validateResetToken("rtok_xyz789");
        assertThat(valResponse.valid()).isTrue();

        when(tokenService.consumeTokenAtomic("rtok_xyz789", VerificationTokenEntity.TYPE_PASSWORD_RESET))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPassword2026")).thenReturn("newHashedPassword");

        authService.resetPassword(new ResetPasswordRequest("rtok_xyz789", "NewPassword2026"));

        assertThat(user.getPasswordHash()).isEqualTo("newHashedPassword");
        verify(userRepository).save(user);
    }
}
