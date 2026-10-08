package backend.homestaybooking.auth.repository;

import backend.homestaybooking.auth.entity.UserConsentEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserConsentRepository extends JpaRepository<UserConsentEntity, Long> {

    List<UserConsentEntity> findByUserId(Long userId);
}
