package backend.homestaybooking.shared.domain;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;

/**
 * Value Object Money bất biến (Immutable Value Object).
 * Đại diện cho tiền tệ theo đơn vị nhỏ nhất (Minor unit):
 * - VND: lưu số đồng (không có phần thập phân).
 * - USD: lưu cents ($1 = 100 cents).
 * Toàn bộ logic tính toán là hàm thuần (pure function), không có hiệu ứng phụ.
 */
public record Money(long amount, Currency currency) implements Comparable<Money>, Serializable {

    public Money {
        Objects.requireNonNull(currency, "currency must not be null");
    }

    // --- FACTORY METHODS ---

    public static Money of(long amount, Currency currency) {
        return new Money(amount, currency);
    }

    public static Money of(long amount, String currencyCode) {
        return new Money(amount, Currency.getInstance(currencyCode));
    }

    public static Money zero(Currency currency) {
        return new Money(0L, currency);
    }

    public static Money zero(String currencyCode) {
        return zero(Currency.getInstance(currencyCode));
    }

    public static Money vnd(long amount) {
        return of(amount, "VND");
    }

    public static Money usd(long cents) {
        return of(cents, "USD");
    }

    // --- CURRENCY CHECK ---

    public boolean isSameCurrency(Money other) {
        return other != null && this.currency.equals(other.currency);
    }

    private void assertSameCurrency(Money other) {
        Objects.requireNonNull(other, "other Money must not be null");
        if (!isSameCurrency(other)) {
            throw new IllegalArgumentException(
                "Không thể thực hiện phép tính giữa 2 loại tiền tệ khác nhau: %s và %s"
                    .formatted(this.currency.getCurrencyCode(), other.currency.getCurrencyCode())
            );
        }
    }

    // --- ARITHMETIC OPERATIONS ---

    public Money plus(Money other) {
        assertSameCurrency(other);
        return new Money(Math.addExact(this.amount, other.amount), this.currency);
    }

    public Money minus(Money other) {
        assertSameCurrency(other);
        return new Money(Math.subtractExact(this.amount, other.amount), this.currency);
    }

    public Money multiply(long factor) {
        return new Money(Math.multiplyExact(this.amount, factor), this.currency);
    }

    public Money multiply(double factor, RoundingMode roundingMode) {
        Objects.requireNonNull(roundingMode, "roundingMode must not be null");
        BigDecimal result = BigDecimal.valueOf(this.amount)
            .multiply(BigDecimal.valueOf(factor))
            .setScale(0, roundingMode);
        return new Money(result.longValueExact(), this.currency);
    }

    public Money multiply(BigDecimal factor, RoundingMode roundingMode) {
        Objects.requireNonNull(factor, "factor must not be null");
        Objects.requireNonNull(roundingMode, "roundingMode must not be null");
        BigDecimal result = BigDecimal.valueOf(this.amount)
            .multiply(factor)
            .setScale(0, roundingMode);
        return new Money(result.longValueExact(), this.currency);
    }

    public Money abs() {
        return new Money(Math.abs(this.amount), this.currency);
    }

    public Money negate() {
        return new Money(Math.negateExact(this.amount), this.currency);
    }

    // --- ALLOCATION (CHIA TIỀN THEO TỶ LỆ KHÔNG LỆCH XU LẺ) ---

    /**
     * Chia đều số tiền thành n phần bằng nhau, đảm bảo tổng các phần chính xác bằng số tiền ban đầu.
     */
    public Money[] allocate(int targets) {
        if (targets <= 0) {
            throw new IllegalArgumentException("Số lượng phần chia phải lớn hơn 0, nhận: " + targets);
        }
        long[] ratios = new long[targets];
        for (int i = 0; i < targets; i++) {
            ratios[i] = 1L;
        }
        return allocate(ratios);
    }

    /**
     * Chia tiền theo mảng tỷ lệ (Fowler's Money Pattern), phân bổ phần dư không làm mất xu lẻ.
     * Ví dụ: 100 USD chia theo tỷ lệ 85% Host và 15% Sàn -> allocate(85, 15).
     */
    public Money[] allocate(long... ratios) {
        if (ratios == null || ratios.length == 0) {
            throw new IllegalArgumentException("Mảng tỷ lệ không được rỗng");
        }

        long totalRatio = 0L;
        for (long ratio : ratios) {
            if (ratio < 0L) {
                throw new IllegalArgumentException("Tỷ lệ không được âm: " + ratio);
            }
            totalRatio = Math.addExact(totalRatio, ratio);
        }

        if (totalRatio == 0L) {
            throw new IllegalArgumentException("Tổng các tỷ lệ phải lớn hơn 0");
        }

        Money[] results = new Money[ratios.length];
        long remainder = this.amount;

        for (int i = 0; i < ratios.length; i++) {
            // Sử dụng BigInteger/BigDecimal để tránh tràn số khi nhân
            BigDecimal share = BigDecimal.valueOf(this.amount)
                .multiply(BigDecimal.valueOf(ratios[i]))
                .divide(BigDecimal.valueOf(totalRatio), 0, RoundingMode.FLOOR);
            long allocatedAmount = share.longValue();
            results[i] = new Money(allocatedAmount, this.currency);
            remainder -= allocatedAmount;
        }

        // Phân bổ phần dư lần lượt cho các phần đầu tiên
        for (int i = 0; i < remainder; i++) {
            results[i] = new Money(results[i].amount + 1L, this.currency);
        }

        return results;
    }

    // --- COMPARISON & PREDICATES ---

    public boolean isZero() {
        return this.amount == 0L;
    }

    public boolean isPositive() {
        return this.amount > 0L;
    }

    public boolean isNegative() {
        return this.amount < 0L;
    }

    public boolean isGreaterThan(Money other) {
        return compareTo(other) > 0;
    }

    public boolean isGreaterThanOrEqual(Money other) {
        return compareTo(other) >= 0;
    }

    public boolean isLessThan(Money other) {
        return compareTo(other) < 0;
    }

    public boolean isLessThanOrEqual(Money other) {
        return compareTo(other) <= 0;
    }

    @Override
    public int compareTo(Money other) {
        assertSameCurrency(other);
        return Long.compare(this.amount, other.amount);
    }

    @Override
    public String toString() {
        return "%d %s".formatted(this.amount, this.currency.getCurrencyCode());
    }
}
