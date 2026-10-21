# Ví dụ Firebase: ghi chú riêng tư

> **Tóm tắt:** Dự án Firebase tối giản gồm Hosting, Authentication Google, Firestore và Storage với Security Rules theo uid, kèm cấu hình Emulator để thử an toàn.

Thư mục này đi kèm bài [Firebase cho người mới](../../../vibe/05-firebase.md).

## Có gì trong thư mục

| File | Vai trò |
| --- | --- |
| `firebase.json` | Khai báo Hosting (thư mục `public`), nơi đặt file rules và cổng Emulator |
| `.firebaserc` | Gán project mặc định. Thay `your-firebase-project-id` bằng ID thật của bạn |
| `firestore.rules` | Luật cho Firestore: ghi chú riêng tư theo uid, bài công khai chỉ đọc |
| `storage.rules` | Luật cho Storage: mỗi người một thư mục, chỉ ảnh, dưới 5 MB |
| `public/index.html`, `public/app.js` | Web tĩnh đăng nhập Google và lưu ghi chú |

## Chạy thử an toàn bằng Emulator (không đụng dữ liệu thật)

Cần Node.js và Java (JDK 11 trở lên) cho Firestore Emulator.

```bash
npm i -g firebase-tools
cd examples/vibe/firebase
firebase emulators:start
```

Bạn sẽ thấy bảng điều khiển Emulator tại `http://localhost:4000` và trang web tại `http://localhost:5000`.

Lưu ý: `public/app.js` đang dùng placeholder. Để thử nhanh phần rules mà không cần cấu hình web, mở Emulator UI, tab Firestore, rồi dùng tab Rules Playground hoặc thử thêm dữ liệu.

## Deploy lên project thật

1. Tạo project trong Firebase console (gói Spark, không cần thẻ).
2. Bật Authentication, mục Sign-in method, bật Google. Bật Firestore Database (chọn chế độ production, tức khóa).
3. Sửa `.firebaserc` và `firebaseConfig` trong `public/app.js` bằng giá trị của project (đây không phải secret).
4. Đăng nhập CLI và deploy:

```bash
firebase login
firebase deploy --only hosting,firestore:rules
```

Storage cần gói Blaze (trả theo mức dùng), nên lệnh trên không deploy `storage.rules`. Chỉ thêm `storage` khi bạn tự quyết định nâng cấp, và nên đặt ngân sách cảnh báo trước.

## Quy tắc an toàn

- Không bao giờ dùng `allow read, write: if true;`.
- Không đưa file service account (JSON khóa admin) vào repo hoặc prompt.
- Luôn thử rules bằng Emulator trước khi deploy.
