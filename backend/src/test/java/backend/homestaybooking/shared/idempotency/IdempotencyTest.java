package backend.homestaybooking.shared.idempotency;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import backend.homestaybooking.shared.web.TestSampleController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@ActiveProfiles("test")
class IdempotencyTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private IdempotencyFilter idempotencyFilter;

    @Autowired
    private InMemoryIdempotencyStore store;

    @Autowired
    private TestSampleController testController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        store.clear();
        testController.resetCounter();
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .addFilter(idempotencyFilter)
            .build();
    }

    @Test
    @DisplayName("Gửi cùng Idempotency-Key 2 lần trả về kết quả lưu trữ kèm header Idempotent-Replayed")
    void shouldReplayResponseWhenSameKeyAndPayloadSentTwice() throws Exception {
        String key = "IDEM-KEY-001";
        String payload = """
            {
                "name": "Homestay Da Lat",
                "quantity": 2
            }
            """;

        // Lần 1: Thực thi lần đầu, count = 1
        mockMvc.perform(post("/test-api/idempotent-action")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("Homestay Da Lat")))
            .andExpect(jsonPath("$.count", is(1)));

        // Lần 2: Cùng key, cùng payload -> Trả response cache, count vẫn là 1, có header Idempotent-Replayed
        mockMvc.perform(post("/test-api/idempotent-action")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(header().string("Idempotent-Replayed", "true"))
            .andExpect(jsonPath("$.name", is("Homestay Da Lat")))
            .andExpect(jsonPath("$.count", is(1)));
    }

    @Test
    @DisplayName("Gửi cùng Idempotency-Key nhưng khác payload trả về 400 IDEMPOTENCY_PAYLOAD_MISMATCH")
    void shouldReturnBadRequestWhenSameKeyReusedWithDifferentPayload() throws Exception {
        String key = "IDEM-KEY-002";
        String payload1 = """
            {
                "name": "Homestay Sapa",
                "quantity": 1
            }
            """;
        String payload2 = """
            {
                "name": "Homestay Ha Long",
                "quantity": 3
            }
            """;

        // Lần 1: Thành công
        mockMvc.perform(post("/test-api/idempotent-action")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload1))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("Homestay Sapa")));

        // Lần 2: Cùng key nhưng khác payload -> 400 IDEMPOTENCY_PAYLOAD_MISMATCH
        mockMvc.perform(post("/test-api/idempotent-action")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload2))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code", is("IDEMPOTENCY_PAYLOAD_MISMATCH")));
    }

    @Test
    @DisplayName("Thiếu header Idempotency-Key ở endpoint @Idempotent trả về 400 IDEMPOTENCY_KEY_REQUIRED")
    void shouldReturnBadRequestWhenMissingIdempotencyKey() throws Exception {
        String payload = """
            {
                "name": "Homestay Vung Tau",
                "quantity": 1
            }
            """;

        mockMvc.perform(post("/test-api/idempotent-action")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code", is("IDEMPOTENCY_KEY_REQUIRED")));
    }
}
