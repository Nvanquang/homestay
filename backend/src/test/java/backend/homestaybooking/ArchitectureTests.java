package backend.homestaybooking;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bài kiểm tra kiến trúc hệ thống bằng ArchUnit:
 * 1. Cấm gọi trực tiếp Instant.now(), LocalDate.now(), LocalDateTime.now() (phải qua Clock).
 * 2. Controller không import Repository hoặc Entity trực tiếp (phải qua Service/DTO).
 * 3. Package shared không import các module nghiệp vụ cụ thể.
 */
@AnalyzeClasses(
    packages = "backend.homestaybooking",
    importOptions = ImportOption.DoNotIncludeTests.class
)
public class ArchitectureTests {

    @ArchTest
    public static final ArchRule no_direct_call_to_now_methods = noClasses()
        .should().callMethod(Instant.class, "now")
        .orShould().callMethod(LocalDate.class, "now")
        .orShould().callMethod(LocalDateTime.class, "now")
        .orShould().callMethod(LocalTime.class, "now")
        .orShould().callMethod(ZonedDateTime.class, "now")
        .orShould().callMethod(OffsetDateTime.class, "now")
        .allowEmptyShould(true)
        .because("Mọi tác vụ lấy thời gian phải đi qua bean java.time.Clock để hỗ trợ kiểm thử và tua nhanh thời gian (Clean Architecture / Time Invariant)");

    @ArchTest
    public static final ArchRule controllers_must_not_depend_on_repositories_or_entities = noClasses()
        .that().areAnnotatedWith(RestController.class)
        .or().areAnnotatedWith(Controller.class)
        .or().resideInAPackage("..web..")
        .should().dependOnClassesThat()
        .areAnnotatedWith("jakarta.persistence.Entity")
        .orShould().dependOnClassesThat()
        .areAnnotatedWith("org.springframework.stereotype.Repository")
        .orShould().dependOnClassesThat()
        .haveSimpleNameEndingWith("Repository")
        .orShould().dependOnClassesThat()
        .haveSimpleNameEndingWith("Entity")
        .allowEmptyShould(true)
        .because("Controller không được import Repository hoặc Entity trực tiếp; phải thông qua Service/DTO");

    @ArchTest
    public static final ArchRule shared_must_not_depend_on_business_modules = noClasses()
        .that().resideInAPackage("backend.homestaybooking.shared..")
        .should().dependOnClassesThat()
        .resideInAnyPackage(
            "backend.homestaybooking.auth..",
            "backend.homestaybooking.listing..",
            "backend.homestaybooking.pricing..",
            "backend.homestaybooking.booking..",
            "backend.homestaybooking.payment..",
            "backend.homestaybooking.search..",
            "backend.homestaybooking.messaging..",
            "backend.homestaybooking.review..",
            "backend.homestaybooking.dispute..",
            "backend.homestaybooking.admin..",
            "backend.homestaybooking.finance..",
            "backend.homestaybooking.notification..",
            "backend.homestaybooking.report..",
            "backend.homestaybooking.audit.."
        )
        .allowEmptyShould(true)
        .because("Package shared là nhân dùng chung (shared kernel), không được import các module nghiệp vụ cụ thể");
}
