package backend.homestaybooking.shared.audit;

import java.util.Map;

/**
 * Giao diện dịch vụ ghi nhận Audit Log nghiệp vụ.
 * Thực thi trong cùng database transaction với nghiệp vụ chính (nếu transaction rollback, audit log cũng rollback).
 */
public interface AuditService {

    /**
     * Ghi nhận sự kiện kiểm toán với đầy đủ thông tin bối cảnh.
     */
    void recordEvent(
        String actorId,
        String actorRole,
        String action,
        String entityType,
        String entityId,
        Map<String, Object> details,
        String ipAddress,
        String userAgent
    );

    /**
     * Phương thức tiện ích ghi nhận sự kiện với thông tin cơ bản.
     */
    void recordEvent(
        String actorId,
        String action,
        String entityType,
        String entityId,
        Map<String, Object> details
    );
}
