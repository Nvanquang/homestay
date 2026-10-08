package backend.homestaybooking.auth.repository;

import backend.homestaybooking.auth.entity.RoleEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<RoleEntity, Short> {

    Optional<RoleEntity> findByName(String name);
}
