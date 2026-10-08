package backend.homestaybooking.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "login_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginAttemptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", length = 254, nullable = false)
    private String email;

    @Column(name = "ip_address", length = 45, nullable = false)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "success", nullable = false)
    private boolean success;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt;

    public LoginAttemptEntity(String email, String ipAddress, String userAgent, boolean success, Instant attemptedAt) {
        this.email = email != null ? email.toLowerCase().trim() : null;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.success = success;
        this.attemptedAt = attemptedAt;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase().trim() : null;
    }
}
