package backend.homestaybooking.auth.service;

import backend.homestaybooking.auth.entity.UserEntity;
import java.util.Optional;

public interface TokenService {

    record TokenValidationStatus(
        boolean isValid,
        String reason,
        UserEntity user
    ) {}

    String createEmailVerificationToken(UserEntity user);

    String createPasswordResetToken(UserEntity user);

    String hashToken(String rawToken);

    TokenValidationStatus validateToken(String rawToken, String tokenType);

    Optional<UserEntity> consumeTokenAtomic(String rawToken, String tokenType);
}
