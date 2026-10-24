# Solutions

::: warning Dành cho mentor
Trang này dành cho người quản lý đáp án; học viên không cần đọc.
:::

Đáp án dành cho mentor. Khuyến nghị đặt phần mentor-only trong **repository private riêng** thay vì repo học viên (xem [Quản lý repo giáo trình, mục 5](../mentors/repo-governance.md)).

## Đáp án nằm ở đâu

- [Walkthrough 16 tuần](../mentors/walkthroughs/index.md): nay nằm ở `mentors/walkthroughs/` (trước đây ở `solutions/walkthroughs/`), kèm `index.md` làm mục lục. Các trang này nằm trong website, học viên mở sau khi nộp bài (hub tuần có mục "Đối chiếu đáp án"). Không chứa mã nguồn bản tham chiếu capstone.
- `mentors/grading/`: barem chi tiết, lỗi hay bị trừ điểm, lệnh kiểm tra nhanh và câu hỏi vấn đáp theo tuần. Xem [mục lục mentor](../mentors/index.md).
- `mentors/sessions/`: kịch bản dạy từng buổi.
- `mentor-only/`: đáp án đầy đủ và rubric chi tiết, nằm ngoài website (cấu hình `srcExclude` trong `.vitepress/config.mts` loại `solutions/mentor-only/**`). Nên chuyển sang repo private.

Bản `starter-project/` đã chứa đủ Dockerfile, Compose, k8s manifests và workflows để mentor kiểm chứng.
Khi phát cho học viên, nên gỡ `k8s/` và `.github/workflows/` (học viên tự viết theo lab).
