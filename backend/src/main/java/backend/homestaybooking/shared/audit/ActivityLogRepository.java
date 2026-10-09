package backend.homestaybooking.shared.audit;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Kho lưu trữ JPA cho nhật ký kiểm toán.
 * Chỉ phục vụ nội bộ module audit và các tác vụ tra cứu kiểm toán.
 */
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, UUID> {

    List<ActivityLogEntity> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);

    List<ActivityLogEntity> findByActorIdOrderByCreatedAtDesc(String actorId);

    long countByEntityTypeAndEntityId(String entityType, String entityId);
}
