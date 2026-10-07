package backend.homestaybooking.shared.integration;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * HTTP Client an toàn với cơ chế phòng thủ SSRF nhiều tầng:
 * - Kiểm tra địa chỉ IP và tên miền trước khi gửi yêu cầu (SsrfValidator).
 * - Giới hạn thời gian chờ: Connect Timeout (3s), Read Timeout (10s).
 * - Cấm tự động theo dõi chuyển hướng (Redirect NEVER) để ngăn chặn tấn công chuyển hướng sang mạng nội bộ.
 */
@Component
public class SsrfSafeClient {

    private final RestClient restClient;
    private final SsrfValidator ssrfValidator;

    public SsrfSafeClient(SsrfValidator ssrfValidator) {
        this.ssrfValidator = ssrfValidator;

        HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(10));

        this.restClient = RestClient.builder()
            .requestFactory(requestFactory)
            .defaultHeader("User-Agent", "HomestayPlatform-SafeFetcher/1.0")
            .build();
    }

    /**
     * Gửi yêu cầu GET an toàn tới URL bên ngoài.
     */
    public String get(String url) {
        return get(url, String.class);
    }

    /**
     * Gửi yêu cầu GET an toàn và giải mã phản hồi sang kiểu dữ liệu mong muốn.
     */
    public <T> T get(String url, Class<T> responseType) {
        ssrfValidator.validateUrl(url);
        URI uri = URI.create(url);

        return restClient.get()
            .uri(uri)
            .retrieve()
            .body(responseType);
    }

    /**
     * Gửi yêu cầu POST an toàn kèm nội dung body.
     */
    public <T> T post(String url, Object body, Class<T> responseType) {
        ssrfValidator.validateUrl(url);
        URI uri = URI.create(url);

        return restClient.post()
            .uri(uri)
            .body(body)
            .retrieve()
            .body(responseType);
    }

    /**
     * Trả về RestClient bên dưới nếu cần tuỳ biến thêm (đã cấu hình timeout và cấm redirect).
     */
    public RestClient getRawRestClient() {
        return restClient;
    }
}
