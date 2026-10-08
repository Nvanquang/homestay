package backend.homestaybooking.auth.repository;

import backend.homestaybooking.auth.entity.VerificationTokenEntity;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VerificationTokenRepository extends JpaRepository<VerificationTokenEntity, Long> {

    Optional<VerificationTokenEntity> findByTokenHashAndTokenType(String tokenHash, String tokenType);

    List<VerificationTokenEntity> findByUserIdAndTokenTypeAndConsumedAtIsNull(Long userId, String tokenType);

    @Modifying
    @Query("""
                UPDATE VerificationTokenEntity v
                SET v.consumedAt = :consumedAt
                WHERE v.tokenHash = :tokenHash
                  AND v.tokenType = :tokenType
                  AND v.consumedAt IS NULL
                  AND v.expiresAt > :now
            """)
    int consumeTokenAtomic(
            @Param("tokenHash") String tokenHash,
            @Param("tokenType") String tokenType,
            @Param("consumedAt") Instant consumedAt,
            @Param("now") Instant now);

    @Modifying
    @Query("""
                UPDATE VerificationTokenEntity v
                SET v.consumedAt = :consumedAt
                WHERE v.user.id = :userId
                  AND v.tokenType = :tokenType
                  AND v.consumedAt IS NULL
            """)
    int invalidateActiveTokensForUser(
            @Param("userId") Long userId,
            @Param("tokenType") String tokenType,
            @Param("consumedAt") Instant consumedAt);
}
