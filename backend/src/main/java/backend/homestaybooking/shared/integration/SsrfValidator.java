package backend.homestaybooking.shared.integration;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Bộ kiểm tra an toàn URL và địa chỉ IP phòng chống SSRF (Server-Side Request Forgery).
 * Chặn hoàn toàn truy cập tới dải IP riêng tư (RFC 1918), loopback, link-local (AWS metadata 169.254.169.254),
 * multicast, địa chỉ nội bộ và các cổng không thuộc chuẩn HTTP/HTTPS.
 */
@Component
@Slf4j
public class SsrfValidator {

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");
    private static final Set<Integer> ALLOWED_PORTS = Set.of(80, 443);

    /**
     * Xác thực URL chuỗi.
     */
    public void validateUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new SsrfException("URL không được để trống");
        }
        try {
            URI uri = URI.create(url.trim());
            validateUri(uri);
        } catch (IllegalArgumentException e) {
            throw new SsrfException("Cú pháp URL không hợp lệ: " + e.getMessage());
        }
    }

    /**
     * Xác thực đối tượng URI.
     */
    public void validateUri(URI uri) {
        if (uri == null) {
            throw new SsrfException("URI không được null");
        }

        // 1. Kiểm tra Scheme
        String scheme = uri.getScheme();
        if (scheme == null || !ALLOWED_SCHEMES.contains(scheme.toLowerCase(Locale.ROOT))) {
            throw new SsrfException("Giao thức không được phép: " + scheme + ". Chỉ chấp nhận http hoặc https.");
        }

        // 2. Chặn URL chứa userinfo (nguy cơ giả mạo và injection)
        if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
            throw new SsrfException("URL không được phép chứa thông tin xác thực (userinfo).");
        }

        // 3. Kiểm tra Port
        int port = uri.getPort();
        if (port != -1 && !ALLOWED_PORTS.contains(port)) {
            throw new SsrfException("Cổng không được phép: " + port + ". Chỉ chấp nhận cổng 80 hoặc 443.");
        }

        // 4. Kiểm tra Hostname
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new SsrfException("Hostname của URL không được để trống.");
        }

        String lowerHost = host.toLowerCase(Locale.ROOT);
        if (lowerHost.equals("localhost")
            || lowerHost.endsWith(".localhost")
            || lowerHost.endsWith(".local")
            || lowerHost.endsWith(".internal")) {
            throw new SsrfException("Tên miền nội bộ bị chặn: " + host);
        }

        // 5. Phân giải DNS và kiểm tra tất cả địa chỉ IP
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            if (addresses == null || addresses.length == 0) {
                throw new SsrfException("Không thể phân giải tên miền: " + host);
            }

            for (InetAddress address : addresses) {
                validateIpAddress(address);
            }
        } catch (UnknownHostException e) {
            throw new SsrfException("Không tìm thấy máy chủ cho tên miền: " + host);
        }
    }

    /**
     * Kiểm tra tính an toàn của một địa chỉ IP cụ thể.
     */
    public void validateIpAddress(InetAddress address) {
        if (address.isLoopbackAddress()) {
            throw new SsrfException("Địa chỉ IP loopback bị chặn: " + address.getHostAddress());
        }

        if (address.isAnyLocalAddress()) {
            throw new SsrfException("Địa chỉ IP wildcard/anylocal bị chặn: " + address.getHostAddress());
        }

        if (address.isSiteLocalAddress()) {
            throw new SsrfException("Địa chỉ IP mạng riêng tư (RFC 1918) bị chặn: " + address.getHostAddress());
        }

        if (address.isLinkLocalAddress()) {
            throw new SsrfException("Địa chỉ IP link-local / cloud metadata bị chặn: " + address.getHostAddress());
        }

        if (address.isMulticastAddress()) {
            throw new SsrfException("Địa chỉ IP multicast bị chặn: " + address.getHostAddress());
        }

        byte[] bytes = address.getAddress();

        if (address instanceof Inet4Address) {
            int b0 = bytes[0] & 0xFF;
            int b1 = bytes[1] & 0xFF;

            // 10.0.0.0/8 (RFC 1918)
            if (b0 == 10) {
                throw new SsrfException("Dải IP 10.0.0.0/8 bị chặn: " + address.getHostAddress());
            }

            // 172.16.0.0/12 (RFC 1918)
            if (b0 == 172 && (b1 >= 16 && b1 <= 31)) {
                throw new SsrfException("Dải IP 172.16.0.0/12 bị chặn: " + address.getHostAddress());
            }

            // 192.168.0.0/16 (RFC 1918)
            if (b0 == 192 && b1 == 168) {
                throw new SsrfException("Dải IP 192.168.0.0/16 bị chặn: " + address.getHostAddress());
            }

            // 127.0.0.0/8 (Loopback)
            if (b0 == 127) {
                throw new SsrfException("Dải IP 127.0.0.0/8 bị chặn: " + address.getHostAddress());
            }

            // 169.254.0.0/16 (Link Local & AWS Metadata 169.254.169.254)
            if (b0 == 169 && b1 == 254) {
                throw new SsrfException("Dải IP link-local / AWS metadata 169.254.0.0/16 bị chặn: " + address.getHostAddress());
            }

            // 0.0.0.0/8 (Current network)
            if (b0 == 0) {
                throw new SsrfException("Dải IP 0.0.0.0/8 bị chặn: " + address.getHostAddress());
            }

            // 100.64.0.0/10 (Shared Address Space / CGNAT RFC 6598)
            if (b0 == 100 && (b1 >= 64 && b1 <= 127)) {
                throw new SsrfException("Dải IP CGNAT 100.64.0.0/10 bị chặn: " + address.getHostAddress());
            }
        } else if (address instanceof Inet6Address) {
            // IPv6 Unique Local Address fc00::/7
            int b0 = bytes[0] & 0xFF;
            if ((b0 & 0xFE) == 0xFC) {
                throw new SsrfException("Địa chỉ IPv6 Unique Local Address bị chặn: " + address.getHostAddress());
            }
        }
    }
}
