package backend.homestaybooking.auth.repository;

import backend.homestaybooking.auth.entity.LoginAttemptEntity;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginAttemptRepository extends JpaRepository<LoginAttemptEntity, Long> {

    long countByEmailIgnoreCaseAndSuccessFalseAndAttemptedAtAfter(String email, Instant after);

    long countByEmailIgnoreCaseAndIpAddressAndSuccessFalseAndAttemptedAtAfter(String email, String ipAddress,
            Instant after);

    List<LoginAttemptEntity> findTop5ByEmailIgnoreCaseOrderByAttemptedAtDesc(String email);
}
