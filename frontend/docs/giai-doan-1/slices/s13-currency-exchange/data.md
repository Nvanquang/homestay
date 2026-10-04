## S13 · Tiền tệ hiển thị và tỷ giá

| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| supportedCurrencies[] `{code, symbol, name, decimals}` | `/config/public` | |
| displayCurrency | User/local | |
| Giá trong mọi phản hồi | `Money` + `converted? {original: Money, rate, rateDate}` | BE quy đổi và làm tròn (BR-PRC-08) |
| fx `{status: OK｜STALE｜UNAVAILABLE, asOf, source}` | ExchangeRateSnapshot | STALE/UNAVAILABLE → FE về tiền tệ listing (S13 AC) |
| Truy vấn | thêm tham số `currency=` vào search/quote/price-calendar | |

---

