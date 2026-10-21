# Buổi 02 – Development Environment

Tuần 1 · Giai đoạn 1 – Engineering Foundation · Slide deck: `slides/01-foundation/`

## Learning objectives

Sau buổi học, bạn có thể: giải thích và áp dụng **Development Environment** vào dự án Club Management.

## Nội dung

Windows, WSL2, Linux, Terminal, Shell, package manager, filesystem

## Cấu trúc buổi (120 phút)

| Thời lượng | Hoạt động |
| --- | --- |
| 15' | Ôn tập buổi trước |
| 30' | Kiến thức + demo của mentor |
| 60' | Hands-on lab |
| 15' | Review, recap |

## Hands-on lab

**Đề bài:** Cài WSL2 Ubuntu, thiết lập môi trường thực hành.

Công cụ: WSL2, Ubuntu, VS Code, Git

### L1 – Foundation (hoàn thành theo hướng dẫn)

Cài WSL2 + Ubuntu, VS Code (Remote WSL), Git; chạy `lsb_release -a`, `git --version`.

### L2 – Engineering (tự triển khai, giải thích, xử lý lỗi)

Cấu hình dotfiles cơ bản (`.bashrc`, alias), SSH key cho GitHub, viết script `check-env.sh` kiểm tra các công cụ đã cài.

## Lỗi thường gặp

- Làm việc trong `/mnt/c` gây chậm I/O; dùng home của WSL
- Bật ảo hóa trong BIOS chưa xong

## Nộp bài

Nộp theo `templates/lab-template.md` vào `lab-02/` trong repository cá nhân:
`README.md`, `source/`, `screenshots/`, `evidence/command-output.txt`, `report.md`.
Screenshot không đủ để chấm: phải có source, câu lệnh, log hoặc kết quả kiểm thử.

## Recap

Tự trả lời 3 câu: (1) Vấn đề này giải quyết gì? (2) Nó hoạt động thế nào? (3) Khi lỗi, bạn kiểm tra gì đầu tiên?
