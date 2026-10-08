package backend.homestaybooking.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", length = 254, nullable = false, unique = true)
    private String email;

    @Column(name = "full_name", length = 80, nullable = false)
    private String fullName;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "UNVERIFIED";

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "bio", length = 300)
    private String bio;

    @Column(name = "language", length = 5, nullable = false)
    @Builder.Default
    private String language = "vi";

    @Column(name = "display_currency", length = 3, nullable = false)
    @Builder.Default
    private String displayCurrency = "VND";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<RoleEntity> roles = new HashSet<>();

    public UserEntity(String email, String fullName, String passwordHash, Instant now) {
        this.email = email != null ? email.toLowerCase().trim() : null;
        this.fullName = fullName;
        this.passwordHash = passwordHash;
        this.status = "UNVERIFIED";
        this.language = "vi";
        this.displayCurrency = "VND";
        this.createdAt = now;
        this.updatedAt = now;
        this.roles = new HashSet<>();
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase().trim() : null;
    }

    public boolean isEmailVerified() {
        return emailVerifiedAt != null;
    }

    public boolean isHost() {
        return roles != null && roles.stream().anyMatch(r -> "HOST".equalsIgnoreCase(r.getName()));
    }

    public String getStaffRole() {
        if (roles == null) return null;
        for (RoleEntity r : roles) {
            String roleName = r.getName().toUpperCase();
            if ("ADMIN".equals(roleName)) return "ADMIN";
            if ("CSKH".equals(roleName) || "SUPPORT".equals(roleName)) return "SUPPORT";
            if ("ACCOUNTANT".equals(roleName)) return "ACCOUNTANT";
        }
        return null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserEntity that)) return false;
        return Objects.equals(email, that.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(email);
    }
}
