package backend.homestaybooking;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

/**
 * Kiểm tra tính hợp lệ về ranh giới module của Spring Modulith.
 */
class ModulithTests {

    private final ApplicationModules modules = ApplicationModules.of(BackendApplication.class);

    @Test
    @DisplayName("Kiểm tra ranh giới giữa 14 module nghiệp vụ và shared kernel không bị vi phạm")
    void verifyModularity() {
        modules.verify();
    }

    @Test
    @DisplayName("Ghi nhận tài liệu kiến trúc Spring Modulith")
    void writeDocumentation() {
        new Documenter(modules).writeDocumentation();
    }
}
