# Tính năng AI của CoachMate (MVP)

Tài liệu ghi lại toàn bộ phần AI đã bổ sung vào bản MVP, gồm 2 phần: **AI ghép cặp & xếp lịch giải đấu** và **Combo A – AI toàn cảnh** (dự đoán trận, gợi ý khóa học, dự báo lớp sắp mở, trợ lý AI).

---

## 1. Nguyên tắc triển khai

- **Chỉ thêm, không sửa**: không đụng vào luồng thanh toán, hoàn tiền, hoa hồng, báo cáo tài chính hay hành vi nhánh đấu / lịch thi đấu sẵn có.
- **Không LLM, không API key, không gọi mạng**: toàn bộ tính toán chạy phía client bằng thuật toán tất định (deterministic). Cùng dữ liệu → cùng kết quả.
- **Giải thích được bằng tiếng Việt**: mọi kết quả AI đều kèm lý do hoặc bảng điểm chi tiết để người dùng kiểm chứng.
- **Dữ liệu lấy từ chính demo state** (`localStorage`, key `coachmate-cp3-mvp-v1`), không phát sinh nguồn dữ liệu mới.

---

## 2. Phần 1 — AI ghép cặp & xếp lịch giải đấu

### 2.1 Dữ liệu bổ sung cho lượt đăng ký

Thêm 2 trường vào `TournamentRegistration`:

| Trường | Ý nghĩa |
| --- | --- |
| `skillLevel` | Trình độ VĐV: `Mới bắt đầu` · `Cơ bản` · `Trung cấp` · `Nâng cao` |
| `club` | Câu lạc bộ / đơn vị của VĐV, dùng để tránh trùng cặp ở vòng 1 |

Form đăng ký giải của học viên có thêm 2 ô này; dữ liệu mẫu trong `seed.ts` đã được điền sẵn để demo có kết quả ngay.

### 2.2 Thuật toán (`frontend/src/domain/aiScheduler.ts`)

- **Xếp hạt giống**: quy đổi trình độ thành điểm 1–4 (`Mới bắt đầu` → `Nâng cao`), sắp giảm dần, cùng điểm thì ưu tiên đăng ký sớm hơn.
- **Chia nhánh**: dùng thứ tự hạt giống chuẩn của bracket (hạt 1 gặp hạt yếu nhất, hạt 2 gặp hạt yếu nhì, …) nên các VĐV mạnh nằm khác nhánh.
- **Tránh trùng CLB vòng 1**: đếm số cặp cùng CLB ở vòng đầu, sau đó hoán vị các vị trí trong cùng nhánh cho tới khi hết cặp trùng hoặc không còn cách xếp nào tốt hơn. Số cặp trùng còn lại được báo minh bạch cho ban tổ chức.
- **Chia sân – giờ – trọng tài**: mỗi vòng chia thành các "sóng" theo số sân của địa điểm tổ chức; trận trong cùng sóng dùng sân khác nhau và trọng tài khác nhau, mỗi sóng cách nhau 40 phút, bắt đầu 08:00.
- **Suất đặc cách (bye)**: giữ nguyên hành vi cũ, chỉ các trận thực đấu mới được xếp sân/giờ/trọng tài.

### 2.3 Trải nghiệm trên giao diện

- Chọn **"AI xếp cặp (khuyến nghị)"** hoặc **"Theo thứ tự đăng ký (cũ)"** trước khi chốt đăng ký.
- Hộp thoại xác nhận mô tả rõ AI sẽ làm gì với số lượt đã duyệt.
- Sau khi tạo nhánh: hiển thị tóm tắt kế hoạch AI (số VĐV, số suất đặc cách, số cặp cùng CLB phải chấp nhận, khung giờ đầu–cuối, số sân).
- Toast thông báo riêng cho chế độ AI; chế độ cổ điển giữ nguyên thông báo cũ.

---

## 3. Phần 2 — Combo A "AI toàn cảnh"

### 3.1 Dự đoán kết quả trận bằng Elo — `domain/elo.ts`

- Điểm khởi tạo theo trình độ khai báo: `Mới bắt đầu` 1300 · `Cơ bản` 1400 · `Trung cấp` 1500 · `Nâng cao` 1600; không khai báo thì 1400.
- Cập nhật Elo sau mỗi trận đã có tỷ số, hệ số **K = 24**.
- Khi dự đoán một trận, **loại bỏ chính trận đó** khỏi dữ liệu tính toán → dự đoán phản ánh đúng thời điểm trước khi bóng lăn.
- Xác suất thắng = kỳ vọng Elo, làm tròn %; hai bên luôn cộng lại 100%.
- **Độ tin cậy** = f(chênh lệch điểm, tổng số trận đã đấu), xếp thành `thấp` / `trung bình` / `cao`.
- `isUpset()` phát hiện kết quả ngược với bên được đánh giá cao hơn.

Hiển thị: ngay trong nhánh đấu (dòng `AI 85% – 15%` kèm "Vì sao?"), banner dự đoán trong modal nhập tỷ số, và toast nhận diện "lật kèo" khi kết quả trái dự đoán.

### 3.2 Gợi ý khóa học cá nhân hóa — `domain/recommendations.ts`

Chấm điểm trên thang 100:

| Tiêu chí | Điểm tối đa | Cách tính |
| --- | --- | --- |
| Trình độ | 40 | Đúng trình độ 40 · lệch 1 bậc 14 · lệch hơn 0 |
| Khu vực | 20 | Cùng quận với hồ sơ học viên |
| Lịch học | 15 | Trùng khung giờ học viên hay học (theo lịch sử đăng ký) |
| Ngân sách | 15 | Trong mức học phí quen thuộc 15 · vượt ≤25% 8 |
| Huấn luyện viên | 10 | Theo điểm đánh giá trung bình của HLV |

- Loại bỏ khóa chưa publish, khóa đã đầy, và khóa học viên đã đăng ký.
- Trả về top 3 kèm lý do ngắn gọn + bảng điểm chi tiết từng tiêu chí.
- Hiển thị ở mục **"Dành cho bạn"** trên chợ khóa học, có nút "Vì sao AI chọn thế?".

### 3.3 Dự báo lớp sắp mở — `domain/forecast.ts`

- Tính **tốc độ đăng ký thực tế** = số học viên / số ngày kể từ học viên đầu tiên.
- **Dự phóng** số học viên tại ngày khai giảng = hiện tại + tốc độ × số ngày còn lại.
- **Xác suất mở lớp** = hàm logistic quanh ngưỡng `minStudents`, kẹp trong khoảng 3%–97%.
- Mức rủi ro: `≥75%` khả năng mở cao · `45–75%` cần theo dõi · `<45%` nguy cơ huỷ lớp.
- Trường hợp đặc biệt: lớp đã đủ `minStudents` → 96%; đã đủ `maxStudents` → 100%; đã tới ngày khai giảng mà chưa đủ → xác suất thấp.
- Hiển thị ở **"Dự báo lớp sắp mở"** trên dashboard HLV, sắp xếp từ rủi ro cao nhất, kèm lý do và phần giải thích 3 bước.

### 3.4 Trợ lý AI toàn cục — `domain/assistant.ts` + `layout/AiAssistant.tsx`

- Rule-based, phân tích ý định tiếng Việt bằng từ khóa + regex (chuẩn hoá dấu, `đ` → `d`) nên nhận được cả câu có dấu và không dấu.
- Ý định hỗ trợ: tìm/gợi ý khóa học (lọc theo khu vực, trình độ, ngân sách), giải đấu sắp tới, lịch học của học viên, lịch thi đấu của ban tổ chức, doanh thu (theo vai trò), dự báo lớp, nhà vô địch, và câu trả lời mặc định.
- Câu trả lời **phụ thuộc vai trò** đang xem: học viên nhận gợi ý lớp + lịch cá nhân; HLV nhận doanh thu của mình + dự báo lớp; ban tổ chức nhận lịch thi đấu + quỹ lệ phí; admin nhận số liệu nền tảng.
- Mỗi câu trả lời kèm **nút hành động** (điều hướng tới đúng trang) và **chip câu hỏi gợi ý** theo vai trò.
- Panel nổi cố định góc phải dưới, mount một lần trong `AppShell` nên xuất hiện ở mọi trang.
- Số liệu tài chính lấy từ module có sẵn (`calculatePlatformTotals`, `getCoachOverview`) nên khớp tuyệt đối với trang báo cáo.

### 3.5 Ngôn ngữ giải thích dùng chung — `design-system/AiExplain.tsx` + `ai.css`

- `AiBadge`: nhãn "AI" nhỏ, thống nhất trên mọi bề mặt.
- `AiExplain`: khối "Vì sao AI chọn thế?" dạng `<details>` — mở ra bảng lý do/điểm số, không chiếm chỗ khi đóng.
- Toàn bộ style AI gói trong một file `ai.css` riêng, không sửa CSS hiện có.

---

## 4. Danh sách file thay đổi

**Thêm mới**

```
frontend/src/domain/aiScheduler.ts          frontend/src/domain/aiScheduler.test.ts
frontend/src/domain/elo.ts                  frontend/src/domain/elo.test.ts
frontend/src/domain/recommendations.ts      frontend/src/domain/recommendations.test.ts
frontend/src/domain/forecast.ts             frontend/src/domain/forecast.test.ts
frontend/src/domain/assistant.ts            frontend/src/domain/assistant.test.ts
frontend/src/design-system/AiExplain.tsx    frontend/src/design-system/ai.css
frontend/src/layout/AiAssistant.tsx
```

**Chỉnh sửa (thêm điểm gắn AI, không đổi hành vi cũ)**

```
frontend/src/domain/types.ts                 thêm skillLevel, club cho lượt đăng ký
frontend/src/data/seed.ts                    dữ liệu mẫu trình độ + CLB
frontend/src/domain/studentFlows.ts          truyền 2 trường mới khi đăng ký giải
frontend/src/domain/tournaments.ts           chế độ tạo nhánh ai | classic
frontend/src/domain/organizerFlows.ts        gọi AI scheduler khi chọn chế độ AI
frontend/src/student/StudentJourney.tsx      ô nhập trình độ + CLB
frontend/src/organizer/OrganizerJourney.tsx  chọn chế độ, tóm tắt AI, dự đoán Elo, modal, toast
frontend/src/student/CourseMarketplace.tsx   mục "Dành cho bạn"
frontend/src/coach/CoachJourney.tsx          "Dự báo lớp sắp mở"
frontend/src/layout/AppShell.tsx             mount trợ lý AI toàn cục
```

---

## 5. Kiểm thử

```powershell
npm test --prefix "E:\mvp exe\frontend"        # 17 file · 75 test pass
npm run typecheck --prefix "E:\mvp exe\frontend"  # tsc -b sạch
npm run build --prefix "E:\mvp exe\frontend"     # build production OK
```

Kiểm thử bằng trình duyệt thật (dev server cổng 5199), trên cả 4 vai trò, **0 lỗi console**:

| Vai trò | Đã kiểm |
| --- | --- |
| Học viên | 3 thẻ gợi ý có điểm + lý do; "Vì sao AI chọn thế?" mở đúng bảng điểm; trợ lý trả lời "Tìm lớp Quận 7 dưới 2 triệu" → 2 khóa kèm link |
| HLV | Dashboard hiện 3 dòng dự báo (3% · 16% · 96%) kèm lý do; trợ lý trả lời "Lớp nào nguy cơ huỷ?" và "Doanh thu của tôi" (11.880.000đ thực nhận) |
| Ban tổ chức | Nhánh đấu hiện 4 dự đoán trận đang chờ (85–15 · 50–50 · 76–24 · 76–24); modal nhập tỷ số có banner "AI dự đoán trước trận"; trợ lý trả lời lịch thi đấu 4 trận và "Ai vô địch?" |
| Admin | Trợ lý trả lời "Doanh thu nền tảng" khớp số liệu module tài chính |

---

## 6. Cách chạy thử

```powershell
npm install --prefix "E:\mvp exe\frontend"
npm run dev --prefix "E:\mvp exe\frontend"
```

- Vào **Khám phá khóa học** → xem mục "Dành cho bạn".
- Chuyển vai trò **Huấn luyện viên** → **Tổng quan** → xem "Dự báo lớp sắp mở".
- Chuyển vai trò **Ban tổ chức** → mở giải đấu → chốt đăng ký với chế độ "AI xếp cặp" → xem % dự đoán từng trận.
- Bấm nút **Trợ lý AI** ở góc phải dưới trên bất kỳ trang nào.
- Nếu dữ liệu trình duyệt đã bị thay đổi trong lúc thử, dùng **"Đặt lại dữ liệu mẫu"** để về trạng thái ban đầu.

---

## 7. Giới hạn đã biết (đúng mức MVP)

- Toàn bộ dữ liệu nằm trong `localStorage`, không có backend; đổi trình duyệt là mất trạng thái.
- Elo chỉ dựa trên các trận đã có tỷ số trong chính giải đang xét, chưa có Elo xuyên giải.
- Dự báo lớp dùng tốc độ đăng ký quan sát được, chưa tính mùa vụ hay khuyến mãi.
- Trợ lý là rule-based theo bộ ý định cố định; câu hỏi ngoài phạm vi sẽ nhận câu trả lời hướng dẫn chung.
- Trợ lý dùng HLV mẫu `c1` cho các câu hỏi về doanh thu/dự báo của HLV, phù hợp với dữ liệu demo hiện tại.
