package debatechat.backend.base.arch;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import debatechat.backend.common.annotation.Implement;
import org.springframework.stereotype.Service;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(
    packages = "debatechat.backend",
    importOptions = ImportOption.DoNotIncludeTests.class
)
class ArchitectureTest {

    // =========================================================================
    // 계층 간 의존성 규칙
    // Presentation → Domain ← Infra, Common은 독립
    // =========================================================================

    @ArchTest
    static final ArchRule domain은_presentation_controller를_의존하지_않는다 =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..presentation..controller..")
            .because("Domain 계층은 Presentation Controller에 의존하지 않는다");

    @ArchTest
    static final ArchRule domain은_infra를_의존하지_않는다 =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..infra..")
            .because("Domain 계층은 Infra 계층에 의존하지 않는다");

    @ArchTest
    static final ArchRule domain은_config를_의존하지_않는다 =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..config..")
            .because("Domain 계층은 Config 계층에 의존하지 않는다");

    @ArchTest
    static final ArchRule presentation은_infra를_의존하지_않는다 =
        noClasses().that().resideInAPackage("..presentation..")
            .should().dependOnClassesThat().resideInAPackage("..infra..")
            .because("Presentation 계층은 Infra 계층에 의존하지 않는다");

    @ArchTest
    static final ArchRule infra는_presentation을_의존하지_않는다 =
        noClasses().that().resideInAPackage("..infra..")
            .should().dependOnClassesThat().resideInAPackage("..presentation..")
            .because("Infra 계층은 Presentation 계층에 의존하지 않는다");

    @ArchTest
    static final ArchRule common은_다른_계층을_의존하지_않는다 =
        noClasses().that().resideInAPackage("..common..")
            .and().haveSimpleNameNotEndingWith("Filter")
            .should().dependOnClassesThat().resideInAnyPackage(
                "..domain..", "..presentation..", "..infra..", "..config..")
            .because("Common 계층은 다른 계층에 의존하지 않는다 (Security Filter 제외)");

    // =========================================================================
    // Controller 의존성 규칙
    // =========================================================================

    @ArchTest
    static final ArchRule Controller는_Service_구체_클래스를_의존하지_않는다 =
        noClasses().that().resideInAPackage("..presentation..controller..")
            .should().dependOnClassesThat().resideInAPackage("..domain..service..")
            .because("Controller는 Usecase 인터페이스(inbound port)만 의존해야 한다");

    // =========================================================================
    // Port 인터페이스 규칙
    // =========================================================================

    @ArchTest
    static final ArchRule inbound_port는_인터페이스여야_한다 =
        classes().that().resideInAPackage("..port.inbound..")
            .should().beInterfaces()
            .because("Inbound Port(Usecase)는 반드시 인터페이스여야 한다");

    @ArchTest
    static final ArchRule outbound_port는_인터페이스여야_한다 =
        classes().that().resideInAPackage("..port.outbound..")
            .should().beInterfaces()
            .because("Outbound Port(Repository, Client)는 반드시 인터페이스여야 한다");

    // =========================================================================
    // 어노테이션 규칙
    // =========================================================================

    @ArchTest
    static final ArchRule Service_클래스는_Service_어노테이션을_가진다 =
        classes().that().resideInAPackage("..domain..service")
            .and().areNotInterfaces()
            .should().beAnnotatedWith(Service.class)
            .because("Service 클래스는 @Service 어노테이션을 가져야 한다");

    @ArchTest
    static final ArchRule Implement_클래스는_Implement_어노테이션을_가진다 =
        classes().that().resideInAPackage("..domain..service.implement..")
            .should().beAnnotatedWith(Implement.class)
            .because("Implement 클래스는 @Implement 어노테이션을 가져야 한다");

    // =========================================================================
    // Service → Usecase 구현 규칙
    // =========================================================================

    @ArchTest
    static final ArchRule Service는_Usecase_인터페이스를_구현해야_한다 =
        classes().that().resideInAPackage("..domain..service")
            .and().areAnnotatedWith(Service.class)
            .should().implement(resideInInboundPort())
            .because("@Service 클래스는 port.inbound의 Usecase 인터페이스를 구현해야 한다");

    private static com.tngtech.archunit.base.DescribedPredicate<JavaClass> resideInInboundPort() {
        return new com.tngtech.archunit.base.DescribedPredicate<>("port.inbound 패키지의 인터페이스") {
            @Override
            public boolean test(JavaClass javaClass) {
                return javaClass.getPackageName().contains(".port.inbound");
            }
        };
    }
}
