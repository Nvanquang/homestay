import fs from "fs";
import path from "path";

const docsDir = "e:/github-tutorio-demo/homestaybooking/frontend/docs/giai-doan-1";
const archiveDir = path.join(docsDir, "_archive");
const foundationsDir = path.join(docsDir, "00-foundations");
const slicesDir = path.join(docsDir, "slices");
const appendicesDir = path.join(docsDir, "appendices");

// Ensure directories
[archiveDir, foundationsDir, slicesDir, appendicesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Slice folder names
const sliceMap = {
  S01: "s01-auth",
  S02: "s02-account",
  S03: "s03-admin-rbac",
  S04: "s04-host-verification",
  S05: "s05-listing-draft",
  S06: "s06-listing-amenities-pricing",
  S07: "s07-listing-policy-submit",
  S08: "s08-admin-review-listing",
  S09: "s09-listing-calendar",
  S10: "s10-seasonal-pricing",
  S11: "s11-home-search",
  S12: "s12-listing-detail",
  S13: "s13-currency-exchange",
};

Object.values(sliceMap).forEach((name) => {
  const p = path.join(slicesDir, name);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Read the 4 source files
const f1 = fs.readFileSync(path.join(docsDir, "01-user-flow.md"), "utf8");
const f2 = fs.readFileSync(path.join(docsDir, "02-wireframes.md"), "utf8");
const f3 = fs.readFileSync(path.join(docsDir, "03-ux-behavior.md"), "utf8");
const f4 = fs.readFileSync(path.join(docsDir, "04-screen-data.md"), "utf8");

// Backup original files to _archive
fs.writeFileSync(path.join(archiveDir, "01-user-flow.original.md"), f1, "utf8");
fs.writeFileSync(path.join(archiveDir, "02-wireframes.original.md"), f2, "utf8");
fs.writeFileSync(path.join(archiveDir, "03-ux-behavior.original.md"), f3, "utf8");
fs.writeFileSync(path.join(archiveDir, "04-screen-data.original.md"), f4, "utf8");

console.log("Original files backed up to _archive/");

// Helper: split text by regex for ## or ### headers
function extractSections(content, headerRegex) {
  const lines = content.split("\n");
  const sections = [];
  let currentHeader = "";
  let currentLines = [];

  for (const line of lines) {
    if (headerRegex.test(line)) {
      if (currentHeader || currentLines.length > 0) {
        sections.push({ header: currentHeader, body: currentLines.join("\n") });
      }
      currentHeader = line;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentHeader || currentLines.length > 0) {
    sections.push({ header: currentHeader, body: currentLines.join("\n") });
  }
  return sections;
}

// 1. Process 01-user-flow.md
console.log("Processing 01-user-flow.md...");
// Sections by ##
const f1Sections = extractSections(f1, /^## /);

// Overview in 01: section 0 (quy ước), 1 (bản đồ), 2 (sitemap), 3 (flow nền tảng)
const f1Overview = f1Sections.filter(s => 
  s.header.includes("0. Quy ước") ||
  s.header.includes("1. Bản đồ slice") ||
  s.header.includes("2. Sitemap") ||
  s.header.includes("3. Flow nền tảng")
).map(s => s.header + "\n" + s.body).join("\n\n---\n\n");

// Flow per slice inside "## 4. Flow theo slice"
const flowSliceSection = f1Sections.find(s => s.header.includes("4. Flow theo slice"));
let f1SliceMap = {};
if (flowSliceSection) {
  const subSlices = extractSections(flowSliceSection.body, /^### S[0-9]{2}/);
  subSlices.forEach(ss => {
    const match = ss.header.match(/S([0-9]{2})/);
    if (match) {
      f1SliceMap[`S${match[1]}`] = ss.header + "\n" + ss.body;
    }
  });
}

// Appendices in 01
const f1Journeys = f1Sections.find(s => s.header.includes("5. Hành trình"));
const f1OutScope = f1Sections.find(s => s.header.includes("6. Ngoài phạm vi"));
const f1Assumptions = f1Sections.find(s => s.header.includes("7. Giả định"));

// 2. Process 02-wireframes.md
console.log("Processing 02-wireframes.md...");
const f2Sections = extractSections(f2, /^## /);

const f2Section0 = f2Sections.find(s => s.header.includes("0. Nền tảng layout"));
let f2SliceMap = {};
f2Sections.forEach(s => {
  const match = s.header.match(/^## (S[0-9]{2})/);
  if (match) {
    f2SliceMap[match[1]] = s.header + "\n" + s.body;
  }
});

// Break down section 0 of wireframes into foundations
if (f2Section0) {
  const f2Sub0 = extractSections(f2Section0.body, /^### /);
  const breakpoints = f2Sub0.find(s => s.header.includes("0.1"));
  const symbols = f2Sub0.find(s => s.header.includes("0.2"));
  const shells = f2Sub0.find(s => s.header.includes("0.3"));
  const components = f2Sub0.find(s => s.header.includes("0.4"));
  const statusTable = f2Sub0.find(s => s.header.includes("0.5"));
  const designTokens = f2Sub0.find(s => s.header.includes("0.6"));

  // design-tokens.md
  const tokensContent = [
    "# Design Tokens & Typography (Phong cách Airbnb, WCAG AA)\n",
    breakpoints ? breakpoints.header + "\n" + breakpoints.body : "",
    symbols ? symbols.header + "\n" + symbols.body : "",
    statusTable ? statusTable.header + "\n" + statusTable.body : "",
    designTokens ? designTokens.header + "\n" + designTokens.body : "",
  ].filter(Boolean).join("\n\n---\n\n");
  fs.writeFileSync(path.join(foundationsDir, "design-tokens.md"), tokensContent, "utf8");

  // shells.md
  if (shells) {
    fs.writeFileSync(
      path.join(foundationsDir, "shells.md"),
      "# 4 Khung Trang (Public, Account, Host, Admin Shells)\n\n" + shells.header + "\n" + shells.body,
      "utf8"
    );
  }

  // components-catalog.md
  if (components) {
    fs.writeFileSync(
      path.join(foundationsDir, "components-catalog.md"),
      "# Danh Mục Component Dùng Chung (CMP-01 đến CMP-34)\n\n" + components.header + "\n" + components.body,
      "utf8"
    );
  }
}

// 3. Process 03-ux-behavior.md
console.log("Processing 03-ux-behavior.md...");
const f3Sections = extractSections(f3, /^## /);

const f3Section0 = f3Sections.find(s => s.header.includes("0. Quy tắc chung"));
if (f3Section0) {
  fs.writeFileSync(
    path.join(foundationsDir, "common-ux.md"),
    "# Quy Tắc UX & Hành Vi Chung (Validation, Feedback, Modal, Auto-save)\n\n" + f3Section0.header + "\n" + f3Section0.body,
    "utf8"
  );
}

let f3SliceMap = {};
f3Sections.forEach(s => {
  const match = s.header.match(/^## (S[0-9]{2})/);
  if (match) {
    f3SliceMap[match[1]] = s.header + "\n" + s.body;
  }
});

const f3I18n = f3Sections.find(s => s.header.includes("Phụ lục A"));
const f3OpenQuestions = f3Sections.find(s => s.header.includes("Phụ lục B"));

// 4. Process 04-screen-data.md
console.log("Processing 04-screen-data.md...");
const f4Sections = extractSections(f4, /^## /);

const f4Section0 = f4Sections.find(s => s.header.includes("0. Hợp đồng dữ liệu"));
if (f4Section0) {
  fs.writeFileSync(
    path.join(foundationsDir, "common-data.md"),
    "# Hợp Đồng Dữ Liệu Dùng Chung (Money, DateTime, Pagination, Enums)\n\n" + f4Section0.header + "\n" + f4Section0.body,
    "utf8"
  );
}

let f4SliceMap = {};
f4Sections.forEach(s => {
  const match = s.header.match(/^## (S[0-9]{2})/);
  if (match) {
    f4SliceMap[match[1]] = s.header + "\n" + s.body;
  }
});

const f4Seed = f4Sections.find(s => s.header.includes("Phụ lục · Dữ liệu seed"));
const f4Privacy = f4Sections.find(s => s.header.includes("Phụ lục · Ma trận"));

// Write out each slice folder
console.log("Writing slice folders...");
Object.entries(sliceMap).forEach(([sliceId, folderName]) => {
  const targetDir = path.join(slicesDir, folderName);
  
  const flowContent = f1SliceMap[sliceId] || `# ${sliceId} Flow\n\nChưa có đặc tả flow riêng.`;
  const wireframesContent = f2SliceMap[sliceId] || `# ${sliceId} Wireframes\n\nChưa có đặc tả wireframe riêng.`;
  const uxContent = f3SliceMap[sliceId] || `# ${sliceId} UX Behavior\n\nChưa có đặc tả UX riêng.`;
  const dataContent = f4SliceMap[sliceId] || `# ${sliceId} Screen Data\n\nChưa có đặc tả data riêng.`;

  fs.writeFileSync(path.join(targetDir, "flow.md"), flowContent + "\n", "utf8");
  fs.writeFileSync(path.join(targetDir, "wireframes.md"), wireframesContent + "\n", "utf8");
  fs.writeFileSync(path.join(targetDir, "ux-behavior.md"), uxContent + "\n", "utf8");
  fs.writeFileSync(path.join(targetDir, "data.md"), dataContent + "\n", "utf8");

  // Also create a consolidated README.md for the slice so the agent can read one file if desired!
  const consolidated = [
    `# Đặc Tả Kỹ Thuật Giao Diện · ${folderName.toUpperCase()}`,
    `> Thư mục này đóng gói toàn bộ: **User Flow**, **Wireframes**, **UX Behavior**, và **Screen Data/API Contract** cho ${sliceId}.\n`,
    "---",
    flowContent,
    "\n---\n",
    wireframesContent,
    "\n---\n",
    uxContent,
    "\n---\n",
    dataContent,
  ].join("\n\n");
  fs.writeFileSync(path.join(targetDir, "README.md"), consolidated + "\n", "utf8");
});

// Write Appendices
console.log("Writing appendices...");
if (f1Journeys) {
  fs.writeFileSync(
    path.join(appendicesDir, "e2e-journeys.md"),
    "# Hành Trình Xuyên Slice (E2E User Journeys J1–J5)\n\n" + f1Journeys.header + "\n" + f1Journeys.body,
    "utf8"
  );
}
if (f3I18n) {
  fs.writeFileSync(
    path.join(appendicesDir, "i18n-dictionary.md"),
    "# Từ Điển Thông Điệp Nền Tảng (VI / EN)\n\n" + f3I18n.header + "\n" + f3I18n.body,
    "utf8"
  );
}
if (f4Seed) {
  fs.writeFileSync(
    path.join(appendicesDir, "seed-data.md"),
    "# Bộ Dữ Liệu Mẫu (Demo Seed Data)\n\n" + f4Seed.header + "\n" + f4Seed.body,
    "utf8"
  );
}
if (f4Privacy) {
  fs.writeFileSync(
    path.join(appendicesDir, "privacy-matrix.md"),
    "# Ma Trận Màn Hình × Dữ Liệu Nhạy Cảm\n\n" + f4Privacy.header + "\n" + f4Privacy.body,
    "utf8"
  );
}

const assumptionsCombined = [
  "# Tổng Hợp Các Giả Định & Câu Hỏi Mở (Assumptions & Open Questions)\n",
  f1Assumptions ? f1Assumptions.header + "\n" + f1Assumptions.body : "",
  f3OpenQuestions ? f3OpenQuestions.header + "\n" + f3OpenQuestions.body : "",
  f1OutScope ? f1OutScope.header + "\n" + f1OutScope.body : "",
].filter(Boolean).join("\n\n---\n\n");

fs.writeFileSync(path.join(appendicesDir, "assumptions.md"), assumptionsCombined + "\n", "utf8");

// Write main docs/giai-doan-1/README.md as Master Index
console.log("Writing Master README.md...");
const masterReadme = `# Tài Liệu Giao Diện Giai Đoạn 1 – Bản Đồ Điều Hướng (Frontend Slices Map)

> **Mô hình tài liệu**: Phân tách theo **Vertical Slices (S01–S13)** và **Nền tảng dùng chung (Foundations)**.  
> **Nguyên tắc Agent**: Khi thực thi một task cụ thể, chỉ đọc thư mục tương ứng trong \`slices/sxx-...\` (kích thước ~10–20 KB) để tối ưu hóa Context Budget và ngăn chặn tình trạng tràn token.

---

${f1Overview}

---

## Danh Mục Tài Liệu Theo Thư Mục

### 1. Nền Tảng Dùng Chung (\`00-foundations/\`)
- [\`design-tokens.md\`](./00-foundations/design-tokens.md): Breakpoint, lưới 12 cột, hệ màu WCAG AA phong cách Airbnb, typography.
- [\`shells.md\`](./00-foundations/shells.md): 4 Khung trang (Public Shell, Account Shell, Host Shell, Admin Shell).
- [\`components-catalog.md\`](./00-foundations/components-catalog.md): Danh mục 34 UI Primitives (CMP-01 đến CMP-34).
- [\`common-ux.md\`](./00-foundations/common-ux.md): Quy tắc form validation, feedback, modal/bottom sheet, auto-save.
- [\`common-data.md\`](./00-foundations/common-data.md): Hợp đồng dữ liệu chung: Tiền tệ (Money), Thời gian (ISO UTC), Enums.

### 2. Danh Sách 13 Vertical Slices (\`slices/\`)
| Slice | Mã Thư Mục | Màn Hình | Mục Tiêu Nghiệp Vụ | Đường Dẫn Đặc Tả |
|---|---|---|---|---|
| **S01** | \`s01-auth\` | P06, P07, P08, P09 | Đăng ký, xác minh email, đăng nhập, quên mật khẩu | [slices/s01-auth/README.md](./slices/s01-auth/README.md) |
| **S02** | \`s02-account\` | C01, C02 | Hồ sơ, cài đặt tài khoản, đổi mật khẩu, bật Host | [slices/s02-account/README.md](./slices/s02-account/README.md) |
| **S03** | \`s03-admin-rbac\` | A01, A18 | Admin đăng nhập, tạo nhân sự CSKH/Kế toán, phân quyền | [slices/s03-admin-rbac/README.md](./slices/s03-admin-rbac/README.md) |
| **S04** | \`s04-host-verification\` | P10, H02, C03, A03 | Nộp hồ sơ xác minh CCCD/Passport, Admin duyệt danh tính | [slices/s04-host-verification/README.md](./slices/s04-host-verification/README.md) |
| **S05** | \`s05-listing-draft\` | H03, H04 (bước 1–3) | Tạo listing: thông tin cơ bản, chọn vị trí bản đồ, tải ảnh | [slices/s05-listing-draft/README.md](./slices/s05-listing-draft/README.md) |
| **S06** | \`s06-listing-amenities-pricing\` | H04 (bước 4–6) | Tiện nghi, quy tắc lưu trú, bảng giá & phí dọn dẹp | [slices/s06-listing-amenities-pricing/README.md](./slices/s06-listing-amenities-pricing/README.md) |
| **S07** | \`s07-listing-policy-submit\` | H04 (bước 7–8), H05 | Chính sách hủy, giấy tờ pháp lý, nộp duyệt, trạng thái | [slices/s07-listing-policy-submit/README.md](./slices/s07-listing-policy-submit/README.md) |
| **S08** | \`s08-admin-review-listing\` | A04 | Admin thẩm định listing lần đầu và duyệt công khai | [slices/s08-admin-review-listing/README.md](./slices/s08-admin-review-listing/README.md) |
| **S09** | \`s09-listing-calendar\` | H06 | Lịch listing của Host, chặn/mở ngày, chống đặt trùng | [slices/s09-listing-calendar/README.md](./slices/s09-listing-calendar/README.md) |
| **S10** | \`s10-seasonal-pricing\` | H08 | Giá theo mùa, ngày lễ, ngày đặc biệt + ưu tiên giá | [slices/s10-seasonal-pricing/README.md](./slices/s10-seasonal-pricing/README.md) |
| **S11** | \`s11-home-search\` | P01, P02 | Trang chủ, thanh tìm kiếm viên thuốc, bộ lọc, Mapbox | [slices/s11-home-search/README.md](./slices/s11-home-search/README.md) |
| **S12** | \`s12-listing-detail\` | P03, P04, P05 | Chi tiết phòng, photo gallery, hồ sơ Host, chính sách hủy | [slices/s12-listing-detail/README.md](./slices/s12-listing-detail/README.md) |
| **S13** | \`s13-currency-exchange\` | C02, P02, P03 | Chọn tiền tệ hiển thị và bảng tỷ giá quy đổi | [slices/s13-currency-exchange/README.md](./slices/s13-currency-exchange/README.md) |

### 3. Phụ Lục & Kiểm Thử Nghiệm Thu (\`appendices/\`)
- [\`e2e-journeys.md\`](./appendices/e2e-journeys.md): 5 Hành trình xuyên suốt J1–J5 để kiểm thử nghiệm thu.
- [\`i18n-dictionary.md\`](./appendices/i18n-dictionary.md): Bảng thông điệp nền tảng song ngữ (VI / EN).
- [\`seed-data.md\`](./appendices/seed-data.md): Bộ dữ liệu mẫu dùng cho mock API và test.
- [\`privacy-matrix.md\`](./appendices/privacy-matrix.md): Ma trận màn hình × dữ liệu nhạy cảm (bảo vệ quyền riêng tư).
- [\`assumptions.md\`](./appendices/assumptions.md): Tổng hợp các giả định và câu hỏi mở cần PO/BA xác nhận.
`;

fs.writeFileSync(path.join(docsDir, "README.md"), masterReadme, "utf8");

console.log("=== FINISHED SPLITTING DOCUMENTATION SUCCESSFULLY ===");
