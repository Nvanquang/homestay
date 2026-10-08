package backend.homestaybooking.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TokenValidationResponse(
    boolean valid,
    String reason
) {}
