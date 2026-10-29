# Tài Liệu Yêu Cầu Nghiệp Vụ (BRD - Business Requirements Document)
## Dự Án: CoachMate - Nền Tảng Quản Lý & Kết Nối Cầu Lông All-in-One

> **Môn học:** EXE101 / CP1 — Trường Đại học FPT  
> **Ngày cập nhật:** Tháng 10/2026  
> **Trạng thái:** Bản chuẩn nghiệp vụ MVP (CP1)

---

## 1. Giới Thiệu Đội Ngũ Dự Án (Project Team)

Dự án **CoachMate** được nghiên cứu và phát triển bởi nhóm gồm 6 thành viên thuộc Đại học FPT:

| STT | Họ và Tên              | Chuyên ngành / Vai trò | Trách nhiệm chính trong dự án |
|---|------------------------|---|---|
| 1 | **Nguyễn Đỗ Bảo Hưng** | Leader & Back-end Developer | Quản trị chung dự án, kiến trúc hệ thống Back-end & thiết kế cơ sở dữ liệu/API |
| 2 | **Nguyễn Lê Ngọc Trí** | Back-end Developer | Phát triển các dịch vụ xử lý nghiệp vụ Back-end, tích hợp lưu trữ & logic tài chính |
| 3 | **Trần Thái Dương**    | Front-end Developer | Xây dựng giao diện người dùng (UI/UX), luồng trải nghiệm học viên & giải đấu |
| 4 | **Lê Minh Khang**      | Front-end Developer | Xây dựng hệ thống UI Components, tích hợp trạng thái giao diện & thiết kế responsive |
| 5 | **Trần Thành Đạt**     | Business & Finance | Nghiên cứu thị trường, định hình mô hình kinh doanh, tính toán tài chính & kinh tế giải đấu |
| 6 | **Đào Phước Anh Dũng** | Media & Communications | Lập kế hoạch truyền thông, marketing, nhận diện thương hiệu & phát triển cộng đồng |

---

## 2. Bối Cảnh & Mục Tiêu Kinh Doanh (Business Context & Objectives)

### 2.1. Vấn đề thực tế của thị trường
1. **Đối với Học viên / Người chơi Cầu lông:** Khó tìm kiếm Huấn luyện viên (HLV) uy tín, minh bạch về giá cả, lịch học và trình độ. Việc đăng ký tham gia các giải đấu phong trào còn thủ công, thiếu thông tin lịch thi đấu và nhánh đấu rõ ràng.
2. **Đối với Huấn luyện viên (Coach):** Gặp khó khăn trong việc quản lý danh sách học viên, thu tiền học phí, thiếu công cụ quảng bá hình ảnh cá nhân và theo dõi hiệu quả kinh doanh.
3. **Đối với Quản trị viên hệ thống (Admin):** Khó quản lý tài khoản, phân quyền, kiểm duyệt nội dung, giao dịch và báo cáo trên một nền tảng thống nhất.
4. **Đối với Ban tổ chức giải đấu (Organizer):** Việc lập kế hoạch chi phí, tính điểm hòa vốn, xếp lịch thi đấu, vẽ sơ đồ nhánh đấu (bracket) và quản lý kết quả tốn nhiều thời gian, dễ xảy ra sai sót.

### 2.2. Giải pháp CoachMate
CoachMate cung cấp một nền tảng số hóa toàn diện kết nối 4 vai trò trên cùng một hệ sinh thái:
- Tự động hóa luồng đăng ký & thanh toán mô phỏng cho khóa học và giải đấu.
- Cung cấp công cụ quản trị tài khoản, nội dung, giao dịch, báo cáo và cấu hình hệ thống cho Admin.
- Cung cấp công cụ tính toán tài chính, dự báo lợi nhuận và điểm hòa vốn tự động cho Organizer.
- Tự động hóa quá trình sinh sơ đồ nhánh đấu (Bracket), phân sân đấu, ca thi đấu và cập nhật kết quả theo thời gian thực.

---

## 3. Ma Trận Vai Trò Người Dùng (User Roles & Matrix)

Nền tảng hỗ trợ 4 vai trò chính với các phạm vi nghiệp vụ tách biệt:

```text
               ┌─────────────────────────────────────────┐
               │          Hệ Sinh Thái CoachMate         │
               └────────────────────┬────────────────────┘
                                    │
         ┌──────────────────┬──────────────────┬──────────────────┐
         ▼                  ▼                  ▼                  ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│Student / Player│ │     Coach      │ │     Admin      │ │   Organizer    │
│  (Học viên)    │ │(Huấn luyện viên)│ │(Quản trị hệ thống)│ │(Ban tổ chức)│
└────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
```

| Tính năng | Student / Player | Coach | Admin | Organizer |
|---|:---:|:---:|:---:|:---:|
| Tìm kiếm & Lọc khóa học | ✅ | ✅ | ✅ | ❌ |
| Đăng ký & Thanh toán giả lập khóa học | ✅ | ❌ | ❌ | ❌ |
| Đánh giá HLV (1–5 sao), xem lịch sử | ✅ | ❌ | ❌ | ❌ |
| Đăng ký giải đấu (Đơn / Đôi) | ✅ | ❌ | ❌ | ❌ |
| Xem lịch thi đấu & Sơ đồ nhánh đấu | ✅ | ✅ | ✅ | ✅ |
| Tạo & Quản lý khóa học | ❌ | ✅ | ✅ (kiểm duyệt) | ❌ |
| Quản lý học viên & lịch dạy | ❌ | ✅ | ❌ | ❌ |
| Nâng cấp gói Coach Pro & xem KPI | ❌ | ✅ | ✅ (theo dõi) | ❌ |
| Quản lý tài khoản và phân quyền | ❌ | ❌ | ✅ | ❌ |
| Quản lý Coach và Student | ❌ | ❌ | ✅ | ❌ |
| Quản lý giao dịch và báo cáo nền tảng | ❌ | ❌ | ✅ | ❌ |
| Cấu hình hệ thống | ❌ | ❌ | ✅ | ❌ |
| Tạo giải đấu và duyệt đăng ký VĐV | ❌ | ❌ | ❌ | ✅ |
| Quản lý sân, trọng tài, lịch thi đấu | ❌ | ❌ | ❌ | ✅ |
| Quản lý nhánh đấu, kết quả và thứ hạng | ❌ | ❌ | ❌ | ✅ |

---

## 4. Chi Tiết Yêu Cầu Nghiệp Vụ (Detailed Business Requirements)

### 4.1. Nghiệp vụ Học viên / Người chơi (Student / Player Flow)

1. **Tìm kiếm & Lọc Khóa học:**
   - Tìm kiếm theo từ khóa (Tên khóa học, Tên HLV, Địa điểm/Sân).
   - Lọc kết quả kết hợp (AND logic) theo: Trình độ (Mới bắt đầu, Trung bình, Nâng cao), Khu vực, Lịch học, Mức giá tối đa.
   - Sắp xếp ưu tiên: Khóa học của HLV có gói **Coach Pro** lên đầu, tiếp theo là ngày khai giảng gần nhất.

2. **Trạng thái Mở lớp của Khóa học (Course Opening Rules):**
   - Đã đủ học viên mở lớp: Số lượng đăng ký hiện tại $\ge$ Số học viên tối thiểu (`min`).
   - Đã đầy (Full): Số lượng đăng ký hiện tại $\ge$ Số học viên tối đa (`max`).
   - Cần thêm học viên: Số lượng đăng ký hiện tại $<$ `min`.
   - Tính toán đơn giá/buổi: $\text{Giá mỗi buổi} = \frac{\text{Tổng học phí}}{\text{Số buổi học}}$.

3. **Đăng ký Khóa học & Thanh toán Mô phỏng:**
   - Người dùng nhập Họ tên, Số điện thoại (tùy chọn) và chọn Phương thức thanh toán.
   - Kiểm tra điều kiện: Không cho phép đăng ký nếu lớp đã đầy (`count >= max`).
   - Hiển thị rõ thông báo **Giao dịch giả lập (Simulated Payment)** — Không thu tiền thật.

4. **Đăng ký Giải đấu (Tournament Registration):**
   - Nội dung **Thi đấu Đơn**: Đăng ký 1 vận động viên.
   - Nội dung **Thi đấu Đôi**: Đăng ký bắt buộc 2 vận động viên (VĐV chính & Partner).
   - Mỗi đăng ký lưu giữ mức phí niêm yết tại thời điểm giao dịch.

5. **Đánh giá & Nhận xét HLV (Coach Rating):**
   - Học viên chỉ được đánh giá HLV sau khi hoàn tất khóa học (`done = true`).
   - Đánh giá theo thang điểm 1–5 sao. Điểm trung bình của HLV được tính:
     $$\text{Rating} = \frac{\text{Tổng số sao } (rSum)}{\text{Tổng số lượt đánh giá } (rCnt)}$$
   - Hiển thị dấu gạch ngang (`—`) nếu HLV chưa có lượt đánh giá nào.

---

### 4.2. Nghiệp vụ Huấn luyện viên (Coach Flow)

1. **Tổng quan Chỉ số KPI (Coach Dashboard):**
   - Báo cáo số lượng khóa học đang quản lý, tổng số lượt học viên đăng ký.
   - Tổng doanh thu thu hộ (GMV - Gross Merchandise Value).
   - Phí hoa hồng nền tảng đã khấu trừ.
   - Thu nhập thực nhận của HLV ($\text{Net Payout} = \text{GMV} - \text{Tổng hoa hồng}$).

2. **Tạo mới & Cấu hình Khóa học (Create Course):**
   - Nhập thông tin bắt buộc: Tiêu đề khóa học, Địa điểm/Sân, Học phí, Số học viên tối thiểu/tối đa ($1 \le min \le max$).
   - Công cụ **Live Price Split Preview**: Tự động tính toán & hiển thị số tiền hoa hồng nền tảng giữ lại và số tiền HLV thực nhận ngay khi nhập giá.

3. **Gói Hội Viên Coach Pro (Coach Pro Subscription):**
   - HLV có thể đăng ký gói Coach Pro với mức phí cố định (mặc định 99.000đ/tháng).
   - Quyền lợi Pro: Đánh dấu huy hiệu Pro, ưu tiên hiển thị khóa học lên đầu danh sách tìm kiếm của học viên.
   - HLV có thể hủy gói Pro bất cứ lúc nào (`active = false`).

---

### 4.3. Nghiệp vụ Ban tổ chức giải đấu (Organizer Flow)

1. **Theo dõi tài chính từng giải đấu:** Xem phí đăng ký, chi phí vận hành, doanh thu dự kiến và điểm hòa vốn cho giải đang tổ chức.

2. **Kinh tế Giải đấu & Điểm Hòa Vốn (Tournament Break-Even Economics):**
   - Chi phí cố định giải đấu:
     $$\text{Fixed Cost} = \text{Thuê sân} + \text{Nhân sự} + \text{Giải thưởng} + \text{Chi phí khác}$$
   - Thu phí net đơn vị (Unit Net Revenue):
     $$\text{Unit Net} = \text{Phí đăng ký} \times (1 - \text{Phí thanh toán}\%) - \text{Chi phí trọng tài/trận}$$
   - Số lượt đăng ký tối thiểu để Hòa vốn (Break-Even Entries):
     $$\text{Break-Even} = \left\lceil \frac{\text{Fixed Cost}}{\text{Unit Net}} \right\rceil$$
   - Hệ thống phát cảnh báo nếu số lượng đăng ký tối thiểu cấu hình thấp hơn điểm hòa vốn.

3. **Tự động Sinh Sơ đồ Nhánh Đấu (Automatic Bracket Generation):**
   - Quy mô nhánh đấu là lũy thừa của 2 kế tiếp ($2^k$, ví dụ: 4, 8, 16, 32).
   - Nếu số đội đăng ký ít hơn quy mô nhánh đấu, các suất trống được xếp là **Bye** (Đặc cách) và tự động tiến vào vòng trong.
   - Khi chọn "Khóa đăng ký & Tạo nhánh đấu", trạng thái giải chuyển sang `closed`.

4. **Tự động Xếp Lịch & Phân Sân (Match Scheduling):**
   - Lịch thi đấu bắt đầu từ **08:00 AM**, mỗi trận dự kiến **40 phút**.
   - Tự động chia ca đấu và xoay vòng theo số lượng sân đấu hiện có ($1 \dots \text{Courts}$) và danh sách trọng tài.

5. **Nhập Kết Quả & Cập Nhật Nhánh Đấu (Result Entry & Winner Advancement):**
   - Ban tổ chức nhập tỷ số 2 bên (yêu cầu không hòa nhau).
   - Đội thắng tự động được đẩy tiếp vào trận đấu tương ứng ở vòng sau.
   - Khi trận Chung kết có kết quả, hệ thống tự động ghi nhận **Nhà vô địch (Champion)** và chuyển trạng thái giải thành `finished`.

### 4.4. Nghiệp vụ Quản trị hệ thống (Admin Flow)

1. **Quản lý tài khoản và phân quyền:** Xem danh sách tài khoản, vai trò, trạng thái; cập nhật quyền và khóa/mở tài khoản theo chính sách.
2. **Quản lý Coach và Student:** Tra cứu hồ sơ, tình trạng hoạt động và thông tin liên quan; không xóa dữ liệu lịch sử giao dịch.
3. **Quản lý nội dung và khóa học:** Kiểm tra khóa học, cập nhật trạng thái xuất bản/ẩn/lưu trữ; giữ nguyên lịch sử enrollment và khoản tiền đã ghi nhận.
4. **Quản lý giao dịch và báo cáo:** Tra cứu giao dịch mô phỏng, đối chiếu đăng ký và xem tổng hợp doanh thu, phí, dòng tiền tạm giữ, phễu chuyển đổi.
   - **Doanh thu nhận diện:** Hoa hồng khóa học + doanh thu gói Coach Pro + phí giải đấu đã kết thúc.
   - **Dòng tiền tạm giữ:** Tổng phí từ giải đấu đang mở, chưa ghi nhận là doanh thu.
   - **Lợi nhuận ước tính:** Doanh thu nhận diện trừ phí thanh toán và chi phí vận hành.
5. **Cấu hình hệ thống:** Quản lý tỷ lệ hoa hồng, phí thanh toán, giá Coach Pro và bảng theo dõi giả định kinh doanh.
6. **Giới hạn bản demo:** Các màn hình Admin hiện mô phỏng trên dữ liệu LocalStorage, không xác thực tài khoản, không thực thi phân quyền bảo mật và không xử lý giao dịch tiền thật.

---

## 5. Dữ Liệu Kiểm Thử Nền Tảng (Baseline Regression Data)

Sau khi reset dữ liệu về trạng thái ban đầu (Seed Data), hệ thống phải khớp chính xác các con số tiêu chuẩn sau:

### 5.1. Bảng Khóa học Mẫu
- **Tổng GMV Khóa học:** 21.000.000đ
- **Doanh thu hoa hồng (10%):** 2.100.000đ
- **Phí thanh toán (2%):** 420.000đ

### 5.2. Bảng Tài chính Nền tảng Mặc định
- **Doanh thu Coach Pro:** 99.000đ
- **Dòng tiền giải đấu tạm giữ (Held Funds):** 3.450.000đ
- **Tổng doanh thu nhận diện:** 2.199.000đ
- **Chi phí nhận diện:** 420.000đ
- **Lợi nhuận ước tính:** 1.779.000đ

---

## 6. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

1. **Lưu trữ & Bảo toàn Dữ liệu (Persistence):**
   - Lưu trữ toàn bộ trạng thái hệ thống vào `localStorage` với key phiên bản `coachmate-cp3-mvp-v1`.
   - Đảm bảo dữ liệu không bị mất khi F5 hoặc chuyển đổi giữa các vai trò người dùng.
2. **Giao diện & Trải nghiệm (UI/UX):**
   - Tuân thủ nghiêm ngặt hệ thống thiết kế tại `docs/DESIGN.md`.
   - Hiển thị mượt mà trên cả 3 kích thước màn hình: Desktop ($>1200\text{px}$), Tablet ($768\text{px} - 1199\text{px}$), Mobile ($<768\text{px}$).
3. **An toàn Giao dịch:**
   - Mọi thao tác thanh toán, nộp phí, đăng ký gói đều là **mô phỏng (simulated)**. Giao diện phải thông báo rõ ràng minh bạch điều này cho người dùng.
