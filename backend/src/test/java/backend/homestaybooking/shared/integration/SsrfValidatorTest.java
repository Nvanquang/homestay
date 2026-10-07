package backend.homestaybooking.shared.integration;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.InetAddress;
import java.net.UnknownHostException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("Kiểm thử bộ phòng chống SSRF (SsrfValidator)")
class SsrfValidatorTest {

    private SsrfValidator ssrfValidator;

    @BeforeEach
    void setUp() {
        ssrfValidator = new SsrfValidator();
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "http://localhost:8080/internal",
        "http://127.0.0.1:8080/secret",
        "http://sub.localhost/api",
        "http://service.local/admin",
        "http://internal.service.internal:80/data",
        "ftp://example.com/file",
        "file:///etc/passwd",
        "gopher://example.com/item",
        "http://user:password@example.com/safe",
        "http://example.com:22/ssh",
        "http://example.com:3306/db",
        "http://example.com:8080/actuator"
    })
    @DisplayName("Chặn các URL không an toàn về Scheme, Port, Hostname hoặc UserInfo")
    void shouldRejectUnsafeUrls(String url) {
        assertThatThrownBy(() -> ssrfValidator.validateUrl(url))
            .isInstanceOf(SsrfException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "127.0.0.1",
        "10.0.0.1",
        "10.255.255.255",
        "172.16.0.1",
        "172.31.255.255",
        "192.168.1.1",
        "192.168.100.200",
        "169.254.169.254", // AWS Cloud Metadata
        "169.254.1.1",
        "0.0.0.0",
        "100.64.0.1",     // CGNAT
        "100.127.255.255"
    })
    @DisplayName("Chặn trực tiếp các địa chỉ IP nguy hiểm nội bộ RFC 1918, link-local, loopback")
    void shouldRejectDangerousIpAddresses(String ip) throws UnknownHostException {
        InetAddress address = InetAddress.getByName(ip);
        assertThatThrownBy(() -> ssrfValidator.validateIpAddress(address))
            .isInstanceOf(SsrfException.class);
    }

    @Test
    @DisplayName("Chấp nhận địa chỉ IP Public hợp lệ (ví dụ Google DNS 8.8.8.8)")
    void shouldAllowPublicIpAddress() throws UnknownHostException {
        InetAddress address = InetAddress.getByName("8.8.8.8");
        assertThatCode(() -> ssrfValidator.validateIpAddress(address))
            .doesNotThrowAnyException();
    }
}
