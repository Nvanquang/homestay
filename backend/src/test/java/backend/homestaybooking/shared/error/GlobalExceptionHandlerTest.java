package backend.homestaybooking.shared.error;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import backend.homestaybooking.shared.web.filter.RequestIdFilter;
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
class GlobalExceptionHandlerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private RequestIdFilter requestIdFilter;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .addFilter(requestIdFilter)
            .build();
    }

    @Test
    @DisplayName("Bắt lỗi validation trường và trả về Problem Details RFC 7807 với invalidParams")
    void shouldReturnProblemDetailsOnValidationException() throws Exception {
        String invalidPayload = """
            {
                "name": "",
                "quantity": 0
            }
            """;

        mockMvc.perform(post("/test-api/validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(header().exists("X-Request-Id"))
            .andExpect(jsonPath("$.type", is("about:blank")))
            .andExpect(jsonPath("$.title", is("Unprocessable Entity")))
            .andExpect(jsonPath("$.status", is(422)))
            .andExpect(jsonPath("$.code", is("VALIDATION_FAILED")))
            .andExpect(jsonPath("$.invalidParams", notNullValue()))
            .andExpect(jsonPath("$.invalidParams[*].field", hasItem("name")))
            .andExpect(jsonPath("$.invalidParams[*].field", hasItem("quantity")));
    }

    @Test
    @DisplayName("Bắt lỗi BusinessException và định dạng Problem Details đúng mã nghiệp vụ")
    void shouldReturnProblemDetailsOnBusinessException() throws Exception {
        mockMvc.perform(get("/test-api/business-error"))
            .andExpect(status().isNotFound())
            .andExpect(header().exists("X-Request-Id"))
            .andExpect(jsonPath("$.title", is("Not Found")))
            .andExpect(jsonPath("$.status", is(404)))
            .andExpect(jsonPath("$.code", is("RESOURCE_NOT_FOUND")))
            .andExpect(jsonPath("$.detail", is("Không tìm thấy phòng kiểm thử")));
    }

    @Test
    @DisplayName("RequestIdFilter tự động gán X-Request-Id từ request sang response")
    void shouldPropagateRequestIdHeader() throws Exception {
        String customRequestId = "my-trace-id-12345";

        mockMvc.perform(get("/test-api/business-error")
                .header("X-Request-Id", customRequestId))
            .andExpect(header().string("X-Request-Id", customRequestId));
    }
}
