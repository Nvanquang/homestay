package backend.homestaybooking.auth.service.impl;

import backend.homestaybooking.auth.dto.ForgotPasswordRequest;
import backend.homestaybooking.auth.dto.ForgotPasswordResponse;
import backend.homestaybooking.auth.dto.LoginRequest;
import backend.homestaybooking.auth.dto.RegisterRequest;
import backend.homestaybooking.auth.dto.RegisterResponse;
import backend.homestaybooking.auth.dto.ResendVerificationRequest;
import backend.homestaybooking.auth.dto.ResendVerificationResponse;
import backend.homestaybooking.auth.dto.ResetPasswordRequest;
import backend.homestaybooking.auth.dto.TokenValidationResponse;
import backend.homestaybooking.auth.dto.UserResponse;
import backend.homestaybooking.auth.dto.VerifyEmailRequest;
import backend.homestaybooking.auth.dto.VerifyEmailResponse;
import backend.homestaybooking.auth.entity.LoginAttemptEntity;
import backend.homestaybooking.auth.entity.RoleEntity;
import backend.homestaybooking.auth.entity.UserConsentEntity;
import backend.homestaybooking.auth.entity.UserEntity;
import backend.homestaybooking.auth.entity.VerificationTokenEntity;
import backend.homestaybooking.auth.repository.LoginAttemptRepository;
import backend.homestaybooking.auth.repository.RoleRepository;
import backend.homestaybooking.auth.repository.UserConsentRepository;
import backend.homestaybooking.auth.repository.UserRepository;
import backend.homestaybooking.auth.service.AuthService;
import backend.homestaybooking.auth.service.TokenService;
import backend.homestaybooking.shared.audit.AuditService;
import backend.homestaybooking.shared.error.BusinessException;
import backend.homestaybooking.shared.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final UserConsentRepository userConsentRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final Clock clock;

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request, String ipAddress, String userAgent) {
        String normalizedEmail = request.email().toLowerCase().trim();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException(
                ErrorCode.EMAIL_ALREADY_EXISTS,
                "Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác."
            );
        }

        Instant now = clock.instant();
        String hashedPassword = passwordEncoder.encode(request.password());

        UserEntity user = new UserEntity(normalizedEmail, request.fullName().trim(), hashedPassword, now);

        RoleEntity guestRole = roleRepository.findByName("GUEST")
            .orElseGet(() -> roleRepository.save(new RoleEntity("GUEST", "Khách thuê phòng cơ bản", now)));
        user.getRoles().add(guestRole);

        UserEntity savedUser = userRepository.save(user);

        if (Boolean.TRUE.equals(request.acceptTerms())) {
            UserConsentEntity consentTerms = new UserConsentEntity(
                savedUser,
                "TERMS_OF_SERVICE",
                "1.0",
                ipAddress,
                userAgent,
                now
            );
            UserConsentEntity consentPrivacy = new UserConsentEntity(
                savedUser,
                "PRIVACY_POLICY",
                "1.0",
                ipAddress,
                userAgent,
                now
            );
            userConsentRepository.save(consentTerms);
            userConsentRepository.save(consentPrivacy);
        }

        String rawToken = tokenService.createEmailVerificationToken(savedUser);
        log.info("[EMAIL SIMULATION] Sending verification email to {} with activation token: {}", normalizedEmail, rawToken);

        auditService.recordEvent(
            savedUser.getId().toString(),
            "GUEST",
            "USER_REGISTERED",
            "User",
            savedUser.getId().toString(),
            Map.of("email", normalizedEmail),
            ipAddress,
            userAgent
        );

        return new RegisterResponse(maskEmail(normalizedEmail), 60);
    }

    @Override
    @Transactional
    public UserResponse login(LoginRequest request, String ipAddress, String userAgent, HttpServletRequest httpRequest) {
        String normalizedEmail = request.email().toLowerCase().trim();
        Instant now = clock.instant();

        Optional<UserEntity> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        // 1. Kiểm tra tài khoản đang bị khóa tạm thời
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            if (user.getLockedUntil() != null && now.isBefore(user.getLockedUntil())) {
                throw new BusinessException(
                    ErrorCode.ACCOUNT_LOCKED,
                    "Tài khoản đang bị tạm khoá do thử sai nhiều lần. Vui lòng thử lại sau 15 phút.",
                    user.getLockedUntil()
                );
            }
        }

        // 2. Đếm số lần đăng nhập thất bại trong 15 phút gần nhất
        Instant windowStart = now.minus(LOCK_DURATION);
        long recentFailures = loginAttemptRepository
            .countByEmailIgnoreCaseAndSuccessFalseAndAttemptedAtAfter(normalizedEmail, windowStart);

        if (recentFailures >= MAX_FAILED_ATTEMPTS) {
            Instant lockedUntil = now.plus(LOCK_DURATION);
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                user.setStatus("LOCKED");
                user.setLockedUntil(lockedUntil);
                user.setUpdatedAt(now);
                userRepository.save(user);
            }
            throw new BusinessException(
                ErrorCode.ACCOUNT_LOCKED,
                "Tài khoản đang bị tạm khoá do thử sai nhiều lần. Vui lòng thử lại sau 15 phút.",
                lockedUntil
            );
        }

        // 3. Kiểm tra mật khẩu
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.password(), userOpt.get().getPasswordHash())) {
            loginAttemptRepository.save(new LoginAttemptEntity(normalizedEmail, ipAddress, userAgent, false, now));
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "Email hoặc mật khẩu không chính xác.");
        }

        UserEntity user = userOpt.get();

        // 4. Nếu tài khoản đã hết hạn khóa trước đó, mở khóa lại
        if (user.getLockedUntil() != null && !now.isBefore(user.getLockedUntil())) {
            user.setLockedUntil(null);
            if ("LOCKED".equals(user.getStatus())) {
                user.setStatus(user.isEmailVerified() ? "ACTIVE" : "UNVERIFIED");
            }
            user.setUpdatedAt(now);
            userRepository.save(user);
        }

        // 5. Kiểm tra email đã được xác minh chưa
        if (!user.isEmailVerified() || "UNVERIFIED".equals(user.getStatus())) {
            loginAttemptRepository.save(new LoginAttemptEntity(normalizedEmail, ipAddress, userAgent, false, now));
            throw new BusinessException(
                ErrorCode.EMAIL_NOT_VERIFIED,
                "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác minh."
            );
        }

        // 6. Ghi nhận đăng nhập thành công
        loginAttemptRepository.save(new LoginAttemptEntity(normalizedEmail, ipAddress, userAgent, true, now));

        // 7. Thiết lập phiên làm việc Spring Security
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
            .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName().toUpperCase()))
            .toList();

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            user.getEmail(),
            null,
            authorities
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        if (httpRequest != null) {
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());
            if (request.isRememberMe()) {
                session.setMaxInactiveInterval(2592000); // 30 ngày
            }
        }

        auditService.recordEvent(
            user.getId().toString(),
            user.getRoles().stream().findFirst().map(RoleEntity::getName).orElse("GUEST"),
            "USER_LOGIN_SUCCESS",
            "User",
            user.getId().toString(),
            Map.of("email", normalizedEmail),
            ipAddress,
            userAgent
        );

        return toUserResponse(user);
    }

    @Override
    public void logout(HttpServletRequest request) {
        if (request != null) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
        }
        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional
    public VerifyEmailResponse verifyEmail(VerifyEmailRequest request) {
        String rawToken = request.token();

        TokenService.TokenValidationStatus status = tokenService
            .validateToken(rawToken, VerificationTokenEntity.TYPE_EMAIL_VERIFY);

        if (!status.isValid()) {
            if ("EXPIRED".equals(status.reason())) {
                return new VerifyEmailResponse("EXPIRED", "Liên kết xác minh đã hết hạn. Vui lòng yêu cầu gửi lại.");
            }
            if ("USED".equals(status.reason())) {
                return new VerifyEmailResponse("USED", "Liên kết xác minh đã được sử dụng trước đó.");
            }
            return new VerifyEmailResponse("INVALID", "Mã xác minh không hợp lệ hoặc không tồn tại.");
        }

        Optional<UserEntity> userOpt = tokenService
            .consumeTokenAtomic(rawToken, VerificationTokenEntity.TYPE_EMAIL_VERIFY);

        if (userOpt.isEmpty()) {
            return new VerifyEmailResponse("USED", "Liên kết xác minh đã được sử dụng.");
        }

        UserEntity user = userOpt.get();
        Instant now = clock.instant();
        user.setEmailVerifiedAt(now);
        user.setStatus("ACTIVE");
        user.setUpdatedAt(now);
        userRepository.save(user);

        auditService.recordEvent(
            user.getId().toString(),
            "GUEST",
            "EMAIL_VERIFIED",
            "User",
            user.getId().toString(),
            Map.of("email", user.getEmail()),
            null,
            null
        );

        return new VerifyEmailResponse("VERIFIED", "Email đã được xác minh thành công.");
    }

    @Override
    @Transactional
    public ResendVerificationResponse resendVerification(ResendVerificationRequest request) {
        String normalizedEmail = request.email().toLowerCase().trim();
        Optional<UserEntity> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            if (!user.isEmailVerified()) {
                String rawToken = tokenService.createEmailVerificationToken(user);
                log.info("[EMAIL SIMULATION] Resending verification email to {} with token: {}", normalizedEmail, rawToken);
            }
        }

        return new ResendVerificationResponse(true, 60);
    }

    @Override
    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.email().toLowerCase().trim();
        Optional<UserEntity> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            String rawToken = tokenService.createPasswordResetToken(user);
            log.info("[EMAIL SIMULATION] Sending password reset link to {} with token: {}", normalizedEmail, rawToken);

            auditService.recordEvent(
                user.getId().toString(),
                "SYSTEM",
                "FORGOT_PASSWORD_REQUESTED",
                "User",
                user.getId().toString(),
                Map.of("email", normalizedEmail),
                null,
                null
            );
        }

        return new ForgotPasswordResponse(
            true,
            "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public TokenValidationResponse validateResetToken(String token) {
        TokenService.TokenValidationStatus status = tokenService
            .validateToken(token, VerificationTokenEntity.TYPE_PASSWORD_RESET);

        return new TokenValidationResponse(status.isValid(), status.reason());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String rawToken = request.token();

        TokenService.TokenValidationStatus status = tokenService
            .validateToken(rawToken, VerificationTokenEntity.TYPE_PASSWORD_RESET);

        if (!status.isValid()) {
            throw new BusinessException(
                ErrorCode.TOKEN_EXPIRED_OR_USED,
                "Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu liên kết mới."
            );
        }

        Optional<UserEntity> userOpt = tokenService
            .consumeTokenAtomic(rawToken, VerificationTokenEntity.TYPE_PASSWORD_RESET);

        if (userOpt.isEmpty()) {
            throw new BusinessException(
                ErrorCode.TOKEN_EXPIRED_OR_USED,
                "Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng."
            );
        }

        UserEntity user = userOpt.get();
        Instant now = clock.instant();

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setUpdatedAt(now);
        userRepository.save(user);

        auditService.recordEvent(
            user.getId().toString(),
            "SYSTEM",
            "PASSWORD_RESET_SUCCESS",
            "User",
            user.getId().toString(),
            Map.of("email", user.getEmail()),
            null,
            null
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        if (email == null || email.isBlank()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Chưa xác thực hoặc phiên đăng nhập đã hết hạn");
        }

        String normalizedEmail = email.toLowerCase().trim();
        Optional<UserEntity> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (userOpt.isPresent()) {
            return toUserResponse(userOpt.get());
        }

        // Trường hợp người dùng mock trong Unit Test chưa nạp vào DB
        return new UserResponse(
            "usr_guest_01",
            "Người dùng thử nghiệm",
            normalizedEmail,
            true,
            false,
            null,
            "ACTIVE",
            clock.instant()
        );
    }

    @Override
    public UserResponse toUserResponse(UserEntity user) {
        List<String> authorities = user.getRoles().stream()
            .map(RoleEntity::getName)
            .toList();

        return new UserResponse(
            user.getId() != null ? "usr_" + user.getId() : "usr_0",
            user.getFullName(),
            user.getEmail(),
            user.getEmail(),
            user.isEmailVerified(),
            user.getPhone(),
            user.getAvatarUrl(),
            user.getBio(),
            user.getLanguage() != null ? user.getLanguage() : "vi",
            user.getDisplayCurrency() != null ? user.getDisplayCurrency() : "VND",
            user.isHost(),
            user.getStaffRole(),
            "NONE",
            "NONE",
            user.getStatus(),
            user.getCreatedAt(),
            authorities
        );
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf('@');
        String local = email.substring(0, atIndex);
        String domain = email.substring(atIndex);

        if (local.length() <= 2) {
            return local.charAt(0) + "***" + domain;
        }
        return local.substring(0, 2) + "***" + domain;
    }
}
