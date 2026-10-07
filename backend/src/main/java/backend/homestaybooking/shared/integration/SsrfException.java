package backend.homestaybooking.shared.integration;

import backend.homestaybooking.shared.error.BusinessException;
import backend.homestaybooking.shared.error.ErrorCode;

/**
 * Ngoại lệ bảo mật khi phát hiện URL hoặc địa chỉ IP có nguy cơ tấn công SSRF (Server-Side Request Forgery).
 */
public class SsrfException extends BusinessException {

    public SsrfException(String message) {
        super(ErrorCode.FORBIDDEN, message);
    }
}
