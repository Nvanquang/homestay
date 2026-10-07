package backend.homestaybooking.shared.idempotency;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Đánh dấu endpoint cần được bảo vệ chống trùng lặp bằng header Idempotency-Key.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {

    String headerName() default "Idempotency-Key";

    boolean required() default true;
}
