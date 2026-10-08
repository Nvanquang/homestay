package backend.homestaybooking.auth.service.impl;

import backend.homestaybooking.auth.entity.UserEntity;
import backend.homestaybooking.auth.entity.VerificationTokenEntity;
import backend.homestaybooking.auth.repository.VerificationTokenRepository;
import backend.homestaybooking.auth.service.TokenService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    public static final Duration EMAIL_VERIFICATION_TTL = Duration.ofHours(24);
    public static final Duration PASSWORD_RESET_TTL = Duration.ofMinutes(15);

    private final VerificationTokenRepository tokenRepository;
    private final Clock clock;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public String createEmailVerificationToken(UserEntity user) {
        tokenRepository.invalidateActiveTokensForUser(
            user.getId(),
            VerificationTokenEntity.TYPE_EMAIL_VERIFY,
            clock.instant()
        );
        return createToken(user, VerificationTokenEntity.TYPE_EMAIL_VERIFY, "vtok_", EMAIL_VERIFICATION_TTL);
    }

    @Override
    @Transactional
    public String createPasswordResetToken(UserEntity user) {
        tokenRepository.invalidateActiveTokensForUser(
            user.getId(),
            VerificationTokenEntity.TYPE_PASSWORD_RESET,
            clock.instant()
        );
        return createToken(user, VerificationTokenEntity.TYPE_PASSWORD_RESET, "rtok_", PASSWORD_RESET_TTL);
    }

    private String createToken(UserEntity user, String tokenType, String prefix, Duration ttl) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String rawToken = prefix + HexFormat.of().formatHex(randomBytes);
        String tokenHash = hashToken(rawToken);

        Instant now = clock.instant();
        Instant expiresAt = now.plus(ttl);

        VerificationTokenEntity entity = new VerificationTokenEntity(
            user,
            tokenHash,
            tokenType,
            expiresAt,
            now
        );
        tokenRepository.save(entity);

        return rawToken;
    }

    @Override
    public String hashToken(String rawToken) {
        if (rawToken == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.trim().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not found", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TokenValidationStatus validateToken(String rawToken, String tokenType) {
        String tokenHash = hashToken(rawToken);
        Optional<VerificationTokenEntity> optionalToken = tokenRepository
            .findByTokenHashAndTokenType(tokenHash, tokenType);

        if (optionalToken.isEmpty()) {
            return new TokenValidationStatus(false, "INVALID", null);
        }

        VerificationTokenEntity token = optionalToken.get();
        if (token.isConsumed()) {
            return new TokenValidationStatus(false, "USED", token.getUser());
        }

        if (token.isExpired(clock.instant())) {
            return new TokenValidationStatus(false, "EXPIRED", token.getUser());
        }

        return new TokenValidationStatus(true, null, token.getUser());
    }

    @Override
    @Transactional
    public Optional<UserEntity> consumeTokenAtomic(String rawToken, String tokenType) {
        String tokenHash = hashToken(rawToken);
        Instant now = clock.instant();

        Optional<VerificationTokenEntity> optionalToken = tokenRepository
            .findByTokenHashAndTokenType(tokenHash, tokenType);

        if (optionalToken.isEmpty()) {
            return Optional.empty();
        }

        VerificationTokenEntity token = optionalToken.get();
        if (token.isConsumed() || token.isExpired(now)) {
            return Optional.empty();
        }

        int updated = tokenRepository.consumeTokenAtomic(tokenHash, tokenType, now, now);
        if (updated > 0) {
            return Optional.of(token.getUser());
        }

        return Optional.empty();
    }
}
