package backend.homestaybooking.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserResponse(
    String id,
    String fullName,
    String email,
    String username,
    boolean emailVerified,
    String phone,
    String avatarUrl,
    String bio,
    String language,
    String displayCurrency,
    boolean isHost,
    String staffRole,
    String hostVerification,
    String guestVerification,
    String status,
    Instant createdAt,
    List<String> authorities
) {
    public UserResponse(
        String id,
        String fullName,
        String email,
        boolean emailVerified,
        boolean isHost,
        String staffRole,
        String status,
        Instant createdAt
    ) {
        this(
            id,
            fullName,
            email,
            email,
            emailVerified,
            null,
            null,
            null,
            "vi",
            "VND",
            isHost,
            staffRole,
            "NONE",
            "NONE",
            status,
            createdAt,
            null
        );
    }
}
