package backend.homestaybooking.shared.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MoneyTest {

    @Test
    @DisplayName("Cộng và trừ tiền cùng loại tiền tệ diễn ra chính xác")
    void shouldAddAndSubtractSameCurrency() {
        Money m1 = Money.vnd(500_000);
        Money m2 = Money.vnd(250_000);

        Money sum = m1.plus(m2);
        assertThat(sum.amount()).isEqualTo(750_000);
        assertThat(sum.currency().getCurrencyCode()).isEqualTo("VND");

        Money diff = m1.minus(m2);
        assertThat(diff.amount()).isEqualTo(250_000);
    }

    @Test
    @DisplayName("Ném lỗi IllegalArgumentException khi cộng hoặc trừ khác loại tiền tệ")
    void shouldThrowWhenCurrenciesMismatch() {
        Money vnd = Money.vnd(100_000);
        Money usd = Money.usd(100);

        assertThatThrownBy(() -> vnd.plus(usd))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Không thể thực hiện phép tính giữa 2 loại tiền tệ khác nhau");

        assertThatThrownBy(() -> vnd.minus(usd))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Nhân tiền với số nguyên hoặc hệ số thập phân có làm tròn")
    void shouldMultiplyCorrectly() {
        Money base = Money.usd(1500); // $15.00

        Money triple = base.multiply(3);
        assertThat(triple.amount()).isEqualTo(4500);

        // Giảm 15% (nhân 0.85)
        Money discounted = base.multiply(0.85, RoundingMode.HALF_UP);
        assertThat(discounted.amount()).isEqualTo(1275); // $12.75

        // Nhân BigDecimal
        Money scaled = base.multiply(new BigDecimal("1.10"), RoundingMode.HALF_UP);
        assertThat(scaled.amount()).isEqualTo(1650);
    }

    @Test
    @DisplayName("Chia tiền đều (allocate targets) không làm mất xu lẻ cho VND và USD")
    void shouldAllocateEquallyWithoutLosingPennies() {
        // Chia 100 USD (10,000 cents) cho 3 người
        Money totalUsd = Money.usd(10_000);
        Money[] splitUsd = totalUsd.allocate(3);

        assertThat(splitUsd).hasSize(3);
        assertThat(splitUsd[0].amount()).isEqualTo(3334);
        assertThat(splitUsd[1].amount()).isEqualTo(3333);
        assertThat(splitUsd[2].amount()).isEqualTo(3333);

        long sumUsd = Arrays.stream(splitUsd).mapToLong(Money::amount).sum();
        assertThat(sumUsd).isEqualTo(totalUsd.amount());

        // Chia 100,000 VND cho 3 người
        Money totalVnd = Money.vnd(100_000);
        Money[] splitVnd = totalVnd.allocate(3);

        assertThat(splitVnd).hasSize(3);
        assertThat(splitVnd[0].amount()).isEqualTo(33_334);
        assertThat(splitVnd[1].amount()).isEqualTo(33_333);
        assertThat(splitVnd[2].amount()).isEqualTo(33_333);

        long sumVnd = Arrays.stream(splitVnd).mapToLong(Money::amount).sum();
        assertThat(sumVnd).isEqualTo(totalVnd.amount());

        // Chia 1 cent cho 3 người -> [1, 0, 0]
        Money oneCent = Money.usd(1);
        Money[] splitOneCent = oneCent.allocate(3);
        assertThat(splitOneCent[0].amount()).isEqualTo(1);
        assertThat(splitOneCent[1].amount()).isEqualTo(0);
        assertThat(splitOneCent[2].amount()).isEqualTo(0);
        assertThat(Arrays.stream(splitOneCent).mapToLong(Money::amount).sum()).isEqualTo(1);
    }

    @Test
    @DisplayName("Chia tiền theo tỷ lệ (allocate ratios) không mất xu lẻ (Host 85%, Sàn 15%)")
    void shouldAllocateByRatiosWithoutLosingPennies() {
        // 1,500,000 VND: 85% cho Host, 15% cho Sàn
        Money bookingTotal = Money.vnd(1_500_000);
        Money[] shares = bookingTotal.allocate(85, 15);

        assertThat(shares).hasSize(2);
        assertThat(shares[0].amount()).isEqualTo(1_275_000); // Host
        assertThat(shares[1].amount()).isEqualTo(225_000);   // Sàn
        assertThat(shares[0].amount() + shares[1].amount()).isEqualTo(bookingTotal.amount());

        // Số tiền lẻ: 10,001 VND theo tỷ lệ 70%, 20%, 10%
        Money oddTotal = Money.vnd(10_001);
        Money[] oddShares = oddTotal.allocate(70, 20, 10);
        long oddSum = Arrays.stream(oddShares).mapToLong(Money::amount).sum();
        assertThat(oddSum).isEqualTo(10_001);
    }

    @Test
    @DisplayName("So sánh các giá trị Money")
    void shouldCompareCorrectly() {
        Money m100 = Money.vnd(100);
        Money m200 = Money.vnd(200);

        assertThat(m100.isLessThan(m200)).isTrue();
        assertThat(m200.isGreaterThan(m100)).isTrue();
        assertThat(m100.isGreaterThanOrEqual(m100)).isTrue();
        assertThat(Money.vnd(0).isZero()).isTrue();
        assertThat(m100.isPositive()).isTrue();
        assertThat(Money.vnd(-50).isNegative()).isTrue();
    }
}
