// Đổi tên file này thành config.js (hoặc sao chép: cp config.example.js config.js),
// rồi thay hai giá trị SUPABASE_URL và SUPABASE_KEY. File config.js được phép commit lên GitHub.
//
// CHỈ dùng khóa công khai (Publishable key "sb_publishable_..." hoặc khóa "anon" kiểu cũ).
// TUYỆT ĐỐI KHÔNG dán secret key ("sb_secret_...") hay "service_role" vào file này.
// Khóa công khai an toàn khi nằm trong trình duyệt VÌ bảng đã bật Row Level Security (xem schema.sql).
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
  SUPABASE_KEY: "YOUR_PUBLISHABLE_KEY",
  CLUB_NAME: "CLB Công nghệ DSC"
};
