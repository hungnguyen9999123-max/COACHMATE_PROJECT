# COACHMATE -- HƯỚNG DẪN KIỂM THỬ TOÀN BỘ FLOW CÁC SPRINT

> **Mục đích:** Tài liệu hướng dẫn chạy và kiểm thử thủ công các luồng
> hiện đã triển khai trong CoachMate, từ nền tảng Sprint 0 đến Student
> Journey ở Sprint 1.4.\
> **Phạm vi:** Frontend demo React + TypeScript + Vite, dữ liệu mẫu và
> LocalStorage. Không có backend/API hoặc thanh toán thật.

------------------------------------------------------------------------

## 1. Phạm vi và trạng thái

  -----------------------------------------------------------------------
  Sprint                  Phạm vi                 Trạng thái theo báo cáo
                                                  hiện tại
  ----------------------- ----------------------- -----------------------
  Sprint 0                Project foundation,     Hoàn thành
                          mock data, repository,  
                          domain logic, tests     

  Sprint 1.1              Design System và        Hoàn thành
                          component showcase      

  Sprint 1.2              App shell, navigation   Hoàn thành
                          theo role, responsive   
                          layout                  

  Sprint 1.3              Student Course          Hoàn thành
                          Marketplace             

  Sprint 1.4              Student checkout,       Hoàn thành
                          tournament, activities, 
                          profile                 

  Sprint 2                Coach Portal            Chưa triển khai trong
                                                  tiến độ được cung cấp

  Sprint 3                Admin / Tournament      Chưa triển khai trong
                          Operations              tiến độ được cung cấp
  -----------------------------------------------------------------------

**Lưu ý:** Các sprint 2 và 3 chỉ là phần tiếp theo dự kiến, không phải
chức năng đã hoàn thành. Hãy cập nhật tài liệu này khi Codex triển khai
thêm.

## 2. Chuẩn bị môi trường

### 2.1. Mở project

Mở terminal tại thư mục project:

``` bash
cd E:\coachmate-project
```

### 2.2. Kiểm tra môi trường

``` bash
node -v
npm -v
```

### 2.3. Cài dependencies (nếu máy chưa cài)

``` bash
npm install
```

### 2.4. Chạy website

``` bash
npm run dev
```

Mở URL mà Vite hiển thị trong terminal, thường là:

``` text
http://localhost:5173
```

Không giả định port luôn là `5173`; nếu port đã được sử dụng, Vite có
thể chọn port khác.

### 2.5. Kiểm tra chất lượng trước khi test

Dùng đúng script có trong `package.json`. Các lệnh thường được cấu hình
trong project:

``` bash
npm run
```

Sau đó chạy các script tương ứng với: - TypeScript check - Vitest -
Production build

Nếu project có các script `typecheck`, `test`, `build`, có thể chạy:

``` bash
npm run typecheck
npm run test
npm run build
```

Không tự tạo script mới nếu `package.json` chưa khai báo.

------------------------------------------------------------------------

## 3. Quy tắc kiểm thử

1.  Thực hiện theo thứ tự các phần bên dưới để dễ phát hiện lỗi phụ
    thuộc.
2.  Dùng dữ liệu demo có sẵn; không tự giả định tên khóa học, HLV hoặc
    giải đấu cụ thể.
3.  Ghi lại URL, thao tác, kết quả mong đợi và kết quả thực tế.
4.  Kiểm tra cả trạng thái thành công và trường hợp lỗi/biên.
5.  Refresh trang sau các thao tác ghi dữ liệu để xác nhận LocalStorage
    persistence.
6.  Khi kiểm thử role switching, phân biệt **role demo** với tài khoản
    đăng nhập thật. Project hiện không có hệ thống
    authentication/backend.
7.  Mọi khoản thanh toán đều là **DEMO / SIMULATED**. Không có giao dịch
    tiền thật.
8.  Nếu thao tác không khớp mô tả, ghi bug thay vì sửa dữ liệu trực tiếp
    trong LocalStorage để làm test pass.

### Quy ước kết quả

-   `[ ]` Chưa kiểm thử
-   `[x]` Pass
-   `[!]` Fail / cần điều tra
-   `N/A` Không áp dụng

------------------------------------------------------------------------

# PHẦN A -- SPRINT 0: FOUNDATION

## 4. Kiểm tra nền tảng và dữ liệu

### TC-0.1 -- Khởi động project

-   [ ] Chạy `npm run dev`.
-   [ ] Website mở được trên trình duyệt.
-   [ ] Không có lỗi khởi động trong terminal.
-   [ ] Không có lỗi nghiêm trọng trong browser console.

**Kết quả mong đợi:** Vite khởi động thành công và ứng dụng hiển thị.

### TC-0.2 -- Kiểm tra dữ liệu mẫu

-   [ ] Các trang sử dụng dữ liệu từ nguồn seed/repository hiện có.
-   [ ] Không xuất hiện dữ liệu undefined/null gây vỡ giao diện.
-   [ ] Các quan hệ giữa khóa học, HLV, học viên, giải đấu và payment
    hiển thị nhất quán theo dữ liệu mẫu.

**Kết quả mong đợi:** Các màn hình dùng dữ liệu tập trung, không bị lỗi
do thiếu dữ liệu.

### TC-0.3 -- Kiểm tra LocalStorage

-   [ ] Thực hiện một thao tác có lưu dữ liệu, ví dụ favorite hoặc cập
    nhật profile.
-   [ ] Refresh trang.
-   [ ] Kiểm tra dữ liệu vẫn còn.
-   [ ] Mở DevTools → Application → Local Storage để kiểm tra
    key/version nếu cần.

**Kết quả mong đợi:** Dữ liệu demo được lưu cục bộ và đọc lại được sau
refresh.

### TC-0.4 -- Regression tests

-   [ ] Chạy toàn bộ Vitest.
-   [ ] Chạy TypeScript check.
-   [ ] Chạy production build.

**Kết quả mong đợi:** Không có test fail, lỗi TypeScript hoặc build
error.

------------------------------------------------------------------------

# PHẦN B -- SPRINT 1.1: DESIGN SYSTEM

## 5. Design System Showcase

Mở:

``` text
/design-system
```

### TC-1.1.1 -- Design tokens và giao diện cơ bản

-   [ ] Trang showcase hiển thị.
-   [ ] Màu sắc, typography, spacing, border radius và shadow nhất quán.
-   [ ] Font Be Vietnam Pro được áp dụng nếu cấu hình font tải thành
    công.
-   [ ] Icon hiển thị đúng.

### TC-1.1.2 -- Buttons và form controls

-   [ ] Kiểm tra các biến thể button.
-   [ ] Kiểm tra trạng thái hover, focus, disabled nếu có.
-   [ ] Nhập dữ liệu vào input.
-   [ ] Thử dropdown/select.
-   [ ] Kiểm tra tabs.

### TC-1.1.3 -- Feedback components

-   [ ] Kích hoạt toast.
-   [ ] Mở modal.
-   [ ] Đóng modal.
-   [ ] Mở confirmation dialog.
-   [ ] Kiểm tra thao tác xác nhận/hủy.
-   [ ] Mở và đóng drawer.
-   [ ] Thử save toggle.

**Kết quả mong đợi:** Các component showcase hiển thị đúng và những
tương tác được mô tả đều hoạt động.

------------------------------------------------------------------------

# PHẦN C -- SPRINT 1.2: APPLICATION LAYOUT

## 6. Kiểm tra App Shell và điều hướng

### TC-1.2.1 -- Student role

-   [ ] Chuyển sang role Student.
-   [ ] Kiểm tra sidebar Student.
-   [ ] Kiểm tra các mục điều hướng.
-   [ ] Chọn một mục menu.
-   [ ] Kiểm tra trạng thái active.
-   [ ] Kiểm tra header và page title.

### TC-1.2.2 -- Coach role

-   [ ] Chuyển sang role Coach.
-   [ ] Navigation thay đổi theo Coach.
-   [ ] Ứng dụng mở destination đầu tiên của role.
-   [ ] Những trang chưa triển khai hiển thị placeholder rõ ràng.

### TC-1.2.3 -- Admin role

-   [ ] Chuyển sang role Admin.
-   [ ] Navigation thay đổi theo Admin.
-   [ ] Ứng dụng mở destination đầu tiên của role.
-   [ ] Những trang chưa triển khai hiển thị placeholder rõ ràng.

### TC-1.2.4 -- Persist role

-   [ ] Chọn một role.
-   [ ] Refresh trang.
-   [ ] Kiểm tra role được chọn vẫn được giữ.
-   [ ] Chuyển role lần nữa và kiểm tra navigation cập nhật ngay.

### TC-1.2.5 -- Sidebar desktop

-   [ ] Thu gọn sidebar.
-   [ ] Mở rộng sidebar.
-   [ ] Kiểm tra icon và label.
-   [ ] Kiểm tra vùng nội dung thích ứng với sidebar.

### TC-1.2.6 -- Mobile navigation

-   [ ] Mở website ở viewport mobile.
-   [ ] Mở mobile drawer.
-   [ ] Chọn một mục điều hướng.
-   [ ] Kiểm tra drawer đóng sau điều hướng nếu thiết kế yêu cầu.
-   [ ] Kiểm tra không bị tràn ngang.

### TC-1.2.7 -- Header interactions

-   [ ] Thử search input.
-   [ ] Mở notifications.
-   [ ] Mở profile menu.
-   [ ] Kiểm tra các nút có phản hồi phù hợp.

### TC-1.2.8 -- 404

Mở một URL không tồn tại, ví dụ:

``` text
/this-route-does-not-exist
```

-   [ ] Hiển thị trang 404 thân thiện.
-   [ ] Có đường quay lại trang phù hợp.

**Kết quả mong đợi:** App Shell dùng chung, navigation đúng theo role và
responsive.

------------------------------------------------------------------------

# PHẦN D -- SPRINT 1.3: STUDENT COURSE MARKETPLACE

## 7. Danh sách khóa học

Mở:

``` text
/courses
```

### TC-1.3.1 -- Course listing

-   [ ] Danh sách khóa học hiển thị.
-   [ ] Mỗi card hiển thị thông tin theo dữ liệu có sẵn.
-   [ ] Thumbnail không làm vỡ layout nếu ảnh tải lỗi.
-   [ ] Giá, trình độ, loại khóa học và HLV hiển thị hợp lý.
-   [ ] Result count khớp với số kết quả đang hiển thị.

### TC-1.3.2 -- Search

-   [ ] Tìm theo tên khóa học.
-   [ ] Tìm theo tên HLV.
-   [ ] Tìm theo từ khóa.
-   [ ] Xóa từ khóa tìm kiếm.
-   [ ] Nhập từ khóa không có kết quả.

**Kết quả mong đợi:** Danh sách cập nhật đúng theo từ khóa; không có kết
quả thì hiển thị empty state.

### TC-1.3.3 -- Combined filters

Kiểm tra lần lượt và kết hợp:

-   [ ] Skill level.
-   [ ] Course format.
-   [ ] Area/location.
-   [ ] Schedule.
-   [ ] Maximum price.
-   [ ] Kết hợp từ hai bộ lọc trở lên.
-   [ ] Clear all filters.

**Kết quả mong đợi:** Các bộ lọc kết hợp đúng, không ghi đè sai điều
kiện trước đó.

### TC-1.3.4 -- Sorting

-   [ ] Recommended.
-   [ ] Price: Low to High.
-   [ ] Price: High to Low.
-   [ ] Rating.

**Kết quả mong đợi:** Thứ tự khóa học thay đổi đúng theo lựa chọn.

### TC-1.3.5 -- Favorite

-   [ ] Favorite một khóa học.
-   [ ] Bỏ favorite.
-   [ ] Refresh trang.
-   [ ] Kiểm tra trạng thái favorite còn được lưu.
-   [ ] Mở trang chi tiết cùng khóa học.
-   [ ] Kiểm tra trạng thái favorite đồng bộ.

## 8. Chi tiết khóa học

Mở một khóa học từ `/courses`:

``` text
/courses/:courseId
```

### TC-1.3.6 -- Course detail

-   [ ] Hiển thị đúng tên khóa học.
-   [ ] Hiển thị mô tả.
-   [ ] Hiển thị thông tin HLV.
-   [ ] Hiển thị rating/reviews nếu có dữ liệu.
-   [ ] Hiển thị trình độ và format.
-   [ ] Hiển thị lịch học, thời lượng và địa điểm nếu có.
-   [ ] Hiển thị giá và capacity.
-   [ ] Hiển thị curriculum/learning outcomes nếu có.
-   [ ] Enrollment CTA xuất hiện đúng.

### TC-1.3.7 -- Invalid course

Mở một ID không tồn tại:

``` text
/courses/invalid-course-id
```

-   [ ] Hiển thị not-found state.
-   [ ] Không bị crash.
-   [ ] Có thể quay lại marketplace.

------------------------------------------------------------------------

# PHẦN E -- SPRINT 1.4: STUDENT JOURNEY

## 9. Course checkout và enrollment

Mở một khóa học còn chỗ tại `/courses`, vào trang chi tiết và chọn đăng
ký.

Route checkout:

``` text
/courses/:courseId/checkout
```

### TC-1.4.1 -- Checkout page

-   [ ] Đúng khóa học được chọn.
-   [ ] Hiển thị giá và thông tin HLV/lịch học.
-   [ ] Hiển thị thông tin học viên demo.
-   [ ] Hiển thị rõ đây là thanh toán mô phỏng.

### TC-1.4.2 -- Validation

-   [ ] Bỏ trống trường bắt buộc.
-   [ ] Thử xác nhận.
-   [ ] Kiểm tra lỗi validation.
-   [ ] Điền dữ liệu hợp lệ.
-   [ ] Kiểm tra có thể tiếp tục.

**Kết quả mong đợi:** Không cho xác nhận khi thiếu thông tin bắt buộc.

### TC-1.4.3 -- Successful enrollment

-   [ ] Hoàn thành thông tin checkout.
-   [ ] Chọn phương thức thanh toán demo.
-   [ ] Xem lại thông tin.
-   [ ] Xác nhận đăng ký.
-   [ ] Hiển thị kết quả thành công.
-   [ ] Kiểm tra enrollment record được lưu.
-   [ ] Kiểm tra payment record được lưu.

### TC-1.4.4 -- Duplicate enrollment

-   [ ] Thử đăng ký lại cùng khóa học bằng cùng demo student.
-   [ ] Kiểm tra hệ thống ngăn đăng ký trùng.
-   [ ] Kiểm tra không tạo payment record trùng.

### TC-1.4.5 -- Full capacity

-   [ ] Dùng một khóa học đã hết chỗ nếu seed data có.
-   [ ] Thử đăng ký.
-   [ ] Kiểm tra hệ thống từ chối đăng ký.
-   [ ] Kiểm tra không tạo enrollment/payment sai.

### TC-1.4.6 -- Persistence

-   [ ] Refresh sau khi đăng ký thành công.
-   [ ] Kiểm tra enrollment và payment vẫn tồn tại.
-   [ ] Điều hướng sang My Courses và Payment History để đối chiếu.

## 10. Tournament Marketplace

Mở:

``` text
/tournaments
```

### TC-1.4.7 -- Tournament listing

-   [ ] Danh sách giải đấu hiển thị.
-   [ ] Thông tin tên, ngày, địa điểm, category và fee đúng với seed.
-   [ ] Search hoạt động.
-   [ ] Filter theo status/category/location/date nếu có.
-   [ ] Sorting hoạt động.
-   [ ] Clear filters hoạt động.
-   [ ] Empty state hiển thị khi không có kết quả.

### TC-1.4.8 -- Tournament detail

Mở:

``` text
/tournaments/:tournamentId
```

-   [ ] Hiển thị đúng thông tin giải.
-   [ ] Hiển thị organizer nếu có.
-   [ ] Hiển thị ngày và địa điểm.
-   [ ] Hiển thị category và registration fee.
-   [ ] Hiển thị capacity/deadline/rules nếu dữ liệu hỗ trợ.
-   [ ] Registration CTA hoạt động.

### TC-1.4.9 -- Invalid tournament

-   [ ] Mở ID không tồn tại.
-   [ ] Hiển thị not-found state.
-   [ ] Không crash.

## 11. Tournament registration

Route:

``` text
/tournaments/:tournamentId/register
```

### TC-1.4.10 -- Singles registration

-   [ ] Chọn Singles.
-   [ ] Điền thông tin bắt buộc.
-   [ ] Xác nhận đăng ký.
-   [ ] Kiểm tra registration được lưu.
-   [ ] Kiểm tra payment mô phỏng được tạo nếu giải có phí.

### TC-1.4.11 -- Doubles registration

-   [ ] Chọn Doubles.
-   [ ] Điền thông tin partner theo form.
-   [ ] Thử bỏ trống thông tin partner bắt buộc.
-   [ ] Kiểm tra validation.
-   [ ] Điền hợp lệ và xác nhận.
-   [ ] Kiểm tra registration lưu đúng loại Doubles.

### TC-1.4.12 -- Duplicate and availability

-   [ ] Thử đăng ký trùng giải/category.
-   [ ] Kiểm tra hệ thống ngăn duplicate theo business rule hiện có.
-   [ ] Thử trường hợp hết chỗ nếu dữ liệu hỗ trợ.
-   [ ] Kiểm tra không tạo payment/registration sai.

**Lưu ý:** Bracket, lịch thi đấu và kết quả trận đấu chưa thuộc phạm vi
Sprint 1.4.

## 12. My Activities

### TC-1.4.13 -- My Courses

Mở:

``` text
/me/courses
```

-   [ ] Hiển thị các khóa học đã đăng ký của demo student hiện tại.
-   [ ] Hiển thị trạng thái enrollment.
-   [ ] Hiển thị HLV, lịch học và địa điểm theo dữ liệu.
-   [ ] Điều hướng được tới course detail.
-   [ ] Empty state hiển thị nếu chưa đăng ký.

### TC-1.4.14 -- My Tournaments

Mở:

``` text
/me/tournaments
```

-   [ ] Hiển thị giải đấu đã đăng ký.
-   [ ] Hiển thị trạng thái registration.
-   [ ] Điều hướng tới tournament detail.
-   [ ] Empty state hiển thị nếu chưa đăng ký.

### TC-1.4.15 -- Payment History

Mở:

``` text
/me/payments
```

-   [ ] Hiển thị payment liên quan đến demo student hiện tại.
-   [ ] Hiển thị amount, date, related item và status theo dữ liệu.
-   [ ] Phân biệt giao dịch demo.
-   [ ] Đối chiếu payment với enrollment/registration.
-   [ ] Empty state hiển thị khi chưa có payment.

## 13. Student Profile

Mở:

``` text
/me/profile
```

### TC-1.4.16 -- View profile

-   [ ] Hiển thị profile demo student.
-   [ ] Các trường thông tin khớp dữ liệu hiện tại.

### TC-1.4.17 -- Edit profile

-   [ ] Thay đổi trường được phép chỉnh sửa.
-   [ ] Thử dữ liệu không hợp lệ.
-   [ ] Kiểm tra validation.
-   [ ] Lưu dữ liệu hợp lệ.
-   [ ] Hiển thị save feedback.
-   [ ] Refresh trang.
-   [ ] Kiểm tra thay đổi vẫn được giữ.

------------------------------------------------------------------------

# PHẦN F -- END-TO-END REGRESSION

## 14. Flow E2E số 1: Đăng ký khóa học

Thực hiện liên tục trong cùng một phiên:

1.  [ ] Chuyển sang Student.
2.  [ ] Mở `/courses`.
3.  [ ] Search một khóa học.
4.  [ ] Áp dụng filter.
5.  [ ] Mở course detail.
6.  [ ] Favorite khóa học.
7.  [ ] Mở checkout.
8.  [ ] Hoàn thành thông tin.
9.  [ ] Xác nhận thanh toán demo.
10. [ ] Kiểm tra success state.
11. [ ] Mở `/me/courses`.
12. [ ] Xác nhận khóa học xuất hiện.
13. [ ] Mở `/me/payments`.
14. [ ] Xác nhận payment tương ứng xuất hiện.
15. [ ] Refresh trang và kiểm tra dữ liệu.

**Pass khi:** Enrollment và payment nhất quán, không có giao dịch thật,
dữ liệu vẫn còn sau refresh.

## 15. Flow E2E số 2: Đăng ký giải đấu

1.  [ ] Mở `/tournaments`.
2.  [ ] Search/filter giải đấu.
3.  [ ] Mở tournament detail.
4.  [ ] Chọn đăng ký.
5.  [ ] Chọn Singles hoặc Doubles.
6.  [ ] Điền thông tin bắt buộc.
7.  [ ] Xác nhận đăng ký demo.
8.  [ ] Kiểm tra registration state.
9.  [ ] Kiểm tra payment history nếu có phí.
10. [ ] Mở `/me/tournaments`.
11. [ ] Xác nhận giải đấu xuất hiện.
12. [ ] Refresh và kiểm tra dữ liệu.

**Pass khi:** Registration và payment (nếu có) được lưu đúng, không tạo
bản ghi trùng.

## 16. Flow E2E số 3: Role switching

1.  [ ] Đang ở Student, ghi nhận dữ liệu đã tạo.
2.  [ ] Chuyển sang Coach.
3.  [ ] Kiểm tra Coach navigation/placeholder.
4.  [ ] Chuyển sang Admin.
5.  [ ] Kiểm tra Admin navigation/placeholder.
6.  [ ] Chuyển lại Student.
7.  [ ] Mở My Courses, My Tournaments và Payment History.
8.  [ ] Kiểm tra dữ liệu Student trước đó còn nguyên.

**Pass khi:** Role switching không làm mất dữ liệu đã lưu và các
navigation hiển thị đúng role.

## 17. Flow E2E số 4: Responsive

Thực hiện trên các kích thước viewport:

-   [ ] Desktop.
-   [ ] Tablet.
-   [ ] Mobile.

Kiểm tra: - \[ \] Không có horizontal overflow ngoài ý muốn. - \[ \]
Sidebar/drawer hoạt động. - \[ \] Course cards chuyển layout phù hợp. -
\[ \] Detail page đọc được. - \[ \] Checkout form không bị tràn. - \[ \]
Tournament registration dùng được. - \[ \] Modal/drawer không bị cắt. -
\[ \] Các nút quan trọng có thể thao tác trên mobile.

------------------------------------------------------------------------

# PHẦN G -- SPRINT TIẾP THEO

## 18. Sprint 2 -- Coach Portal (chưa triển khai theo tiến độ hiện tại)

Các luồng dự kiến cần kiểm thử sau khi được triển khai:

-   [ ] Coach Dashboard.
-   [ ] Xem danh sách khóa học của HLV.
-   [ ] Tạo khóa học.
-   [ ] Chỉnh sửa khóa học.
-   [ ] Cập nhật trạng thái/publish theo business rules.
-   [ ] Xem danh sách học viên.
-   [ ] Xem lịch học.
-   [ ] Quản lý lịch nếu được hỗ trợ.
-   [ ] Xem doanh thu.
-   [ ] Coach Pro/subscription nếu nằm trong feature map.
-   [ ] Refresh và xác nhận dữ liệu được lưu.

**Chưa đánh dấu Pass cho các mục trên khi trang vẫn là placeholder.**

## 19. Sprint 3 -- Admin / Tournament Operations (chưa triển khai theo tiến độ hiện tại)

Các luồng dự kiến cần kiểm thử sau khi được triển khai:

-   [ ] Admin Dashboard.
-   [ ] Quản lý giải đấu.
-   [ ] Tạo/chỉnh sửa giải đấu.
-   [ ] Quản lý courts.
-   [ ] Quản lý referees.
-   [ ] Tạo và quản lý match schedule.
-   [ ] Quản lý brackets.
-   [ ] Nhập/cập nhật kết quả.
-   [ ] Financial Overview.
-   [ ] Assumptions.
-   [ ] Activity Log.
-   [ ] Kiểm tra các thay đổi dữ liệu sau refresh.

**Chưa đánh dấu Pass cho các mục trên khi trang vẫn là placeholder.**

------------------------------------------------------------------------

# PHẦN H -- GHI NHẬN KẾT QUẢ TEST

## 20. Test summary

  Hạng mục                           Pass   Fail   N/A Ghi chú
  -------------------------------- ------ ------ ----- ---------
  Sprint 0 -- Foundation                               
  Sprint 1.1 -- Design System                          
  Sprint 1.2 -- App Shell                              
  Sprint 1.3 -- Marketplace                            
  Sprint 1.4 -- Checkout                               
  Sprint 1.4 -- Tournament                             
  Sprint 1.4 -- My Activities                          
  Sprint 1.4 -- Profile                                
  E2E -- Course enrollment                             
  E2E -- Tournament registration                       
  E2E -- Role switching                                
  Responsive                                           
  Sprint 2 -- Coach Portal                             
  Sprint 3 -- Admin Portal                             

## 21. Bug log

  -----------------------------------------------------------------------------
  ID         Sprint /   Steps to    Expected   Actual     Severity   Status
             Page       reproduce   result     result                
  ---------- ---------- ----------- ---------- ---------- ---------- ----------
  BUG-001                                                            

  BUG-002                                                            

  BUG-003                                                            
  -----------------------------------------------------------------------------

## 22. Điều kiện hoàn tất kiểm thử

Một sprint chỉ nên được xác nhận hoàn tất kiểm thử khi:

1.  Các luồng chính đã được thực hiện trên trình duyệt.
2.  Các trường hợp validation và lỗi quan trọng đã được thử.
3.  Dữ liệu sau thao tác được kiểm tra lại.
4.  Không còn lỗi blocker/critical.
5.  TypeScript check, automated tests và production build đều pass.
6.  Ghi rõ phần nào chưa thể kiểm thử.

------------------------------------------------------------------------

## 23. Lưu ý kiến trúc và giới hạn demo

-   CoachMate hiện là frontend demo React + TypeScript + Vite.
-   Node.js được dùng làm môi trường chạy công cụ phát triển/build; điều
    đó không đồng nghĩa project đã có backend Node.js.
-   Dữ liệu được lưu qua repository và LocalStorage trong trình duyệt.
-   Chưa có backend/API/database dùng chung giữa nhiều người dùng.
-   Thanh toán là mô phỏng; không kết nối cổng thanh toán thật.
-   Không coi role switcher là cơ chế xác thực hoặc phân quyền bảo mật
    thực tế.
-   Dữ liệu LocalStorage phụ thuộc browser/profile đang sử dụng và có
    thể mất nếu người dùng xóa site data.
-   Các chức năng Coach/Admin và tournament operations chỉ được kiểm thử
    sau khi những sprint tương ứng được triển khai.

**Tài liệu này là checklist kiểm thử thủ công; kết quả Pass chỉ được
đánh dấu sau khi thực sự thực hiện thao tác và quan sát kết quả.**
