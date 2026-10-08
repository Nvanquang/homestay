package backend.homestaybooking.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_consents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserConsentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "consent_type", length = 50, nullable = false)
    private String consentType;

    @Column(name = "document_version", length = 20, nullable = false)
    @Builder.Default
    private String documentVersion = "1.0";

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "agreed_at", nullable = false)
    private Instant agreedAt;

    public UserConsentEntity(UserEntity user, String consentType, String documentVersion, String ipAddress, String userAgent, Instant agreedAt) {
        this.user = user;
        this.consentType = consentType;
        this.documentVersion = documentVersion != null ? documentVersion : "1.0";
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.agreedAt = agreedAt;
    }
}
