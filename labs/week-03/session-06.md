# Ngày 3 – Đưa dự án Club vào Git bằng Pull Request

::: warning Bản lưu trữ
Nội dung bài này đã chuyển vào [slide Ngày 3](../../slides/01-foundation/session-06.md). Lộ trình Cơ bản chỉ học bằng slide, trang này giữ lại để tham khảo và không còn là đường học chính.
:::

Lộ trình Cơ bản · Ngày 3/10 · khoảng 2 giờ

[Slide Ngày 3](../../slides/01-foundation/session-06.md) · [Thử thách thêm](session-06-challenge.md)

> **Tóm tắt:** Copy dự án Club vào repo `devops-labs`, đưa lên `main` bằng branch, commit và Pull Request, rồi tự tạo và gỡ một merge conflict.

::: tip Hôm nay bạn làm gì
**Sản phẩm cuối ngày:** thư mục `club/` nằm trên nhánh `main` của repo `devops-labs` (qua một Pull Request đã merge), có `.gitignore` chặn `.env`, và bạn đã gỡ một conflict thật.

**Thời gian:** 15 phút xem slide, 85 phút làm, 20 phút ghi note và commit.

**Cần có:**

- [ ] Đã xong [Ngày 2 – Dùng Linux CLI đọc dự án Club](../week-02/session-03.md).
- [ ] Repo `devops-labs` đã clone ở `~/devops-labs` trong WSL, đăng nhập GitHub bằng SSH key (xem [Tài khoản và repo GitHub](../../resources/setup-github.md)). Không dán token hay password vào lệnh, file hay chat.
- [ ] Thư mục `~/devops-course/starter-project` còn nguyên.
:::

## Bài toán thật

Dự án Club Management đang nằm trong `~/devops-course/starter-project`, nơi bạn chỉ đọc. Từ hôm nay bạn cần một bản của riêng mình để sửa, nên phải đưa nó vào repo `devops-labs`. Nếu push thẳng lên `main`, một lỗi nhỏ hoặc một file `.env` chứa mật khẩu cũng vào lịch sử vĩnh viễn. Cách làm của các đội thật: mỗi thay đổi nằm trên một branch riêng, đi qua Pull Request (PR) rồi mới vào `main`. Các ngày sau (CI ở Ngày 9) đều chạy trên PR, nên bạn cần quen luồng này ngay.

## Làm

Làm trong WSL, trong `~/` (không dùng `/mnt/c`).

### Bước 1. Kiểm tra Git và cập nhật `main`

Bạn cần Git biết bạn là ai, và `main` local phải mới nhất.

```bash
cd ~/devops-labs
git config --global user.name
git config --global user.email
git config --global pull.rebase false
git switch main
git pull
git status
```

Kết quả mong đợi: tên và email của bạn, rồi `On branch main` và `nothing to commit, working tree clean`. Thiếu tên hoặc email thì đặt: `git config --global user.name "Tên của bạn"`.

::: tip Kiểm tra: bạn đúng khi
`git status` báo `working tree clean` và `ssh -T git@github.com` trả lời `Hi <tên-bạn>!`.
:::

### Bước 2. Tạo branch và copy dự án Club vào

Branch là một dòng lịch sử riêng, nên `main` không bị ảnh hưởng cho tới khi PR được merge. Tên branch nên mô tả việc: `feature/add-club`.

```bash
git switch -c feature/add-club
cp -r ~/devops-course/starter-project ~/devops-labs/club
ls -a club
git status --short
```

Kết quả mong đợi: `ls -a club` có `backend`, `frontend`, `database`, `compose.yaml`, `.gitignore`, `.env.example`; `git status` chỉ có một dòng `?? club/`.

### Bước 3. Kiểm tra `.gitignore` trước khi `git add`

Dự án có sẵn `.gitignore` chặn `.env` và `node_modules`. Bạn tạo một `.env` giả để chứng minh nó hoạt động. Luôn kiểm tra bằng `git check-ignore` trước khi add.

```bash
cd ~/devops-labs/club
cat .gitignore
cp .env.example .env
git check-ignore -v .env
git status --short
```

Kết quả mong đợi: `git check-ignore -v .env` in một dòng có chứa `.gitignore:1:.env`, và `git status` không liệt kê `.env`. Giá trị trong `.env.example` chỉ là giá trị mẫu, không phải secret thật.

::: tip Kiểm tra: bạn đúng khi
`git check-ignore -v .env` có in ra một dòng, và `.env` không nằm trong `git status`.
:::

### Bước 4. Commit

Add đúng thư mục `club/` (không dùng `git add .` khi chưa chắc `.gitignore` đủ). Đọc `git status` trước khi commit.

```bash
cd ~/devops-labs
git add club
git status --short
git commit -m "Add Club project"
git ls-files club | head -20
git ls-files | grep -i '\.env$' || echo "OK: khong co file .env"
```

Kết quả mong đợi: commit báo `N files changed` (N là số file), và dòng cuối là `OK: khong co file .env`. File `.env.example` thì được phép có mặt (nó không chứa secret).

::: tip Kiểm tra: bạn đúng khi
`git ls-files | grep -i '\.env$'` không in gì, và `git log --oneline -1` có commit `Add Club project`.
:::

### Bước 5. Push và mở Pull Request

`-u` ghi nhớ upstream để lần sau chỉ cần `git push`.

```bash
git push -u origin feature/add-club
```

Mở GitHub, repo `devops-labs`, bấm "Compare & pull request" (base là `main`, compare là `feature/add-club`). Viết mô tả ngắn: đã thêm gì, vì sao, cách kiểm tra. Mở tab "Files changed" và tự đọc lại diff như một reviewer: có file thừa hoặc secret không?

Nếu học một mình, bạn không thể Approve PR của chính mình, chỉ cần tự review và bấm "Merge pull request" (kiểu mặc định "Create a merge commit"). Làm theo nhóm thì nhờ một bạn comment một dòng và Approve trước.

### Bước 6. Merge và cập nhật `main` local

```bash
git switch main
git pull
git branch -d feature/add-club
git log --oneline --graph -5
ls club
```

Kết quả mong đợi: `Deleted branch feature/add-club`, `git log` có commit `Add Club project` và merge commit, `ls club` có đủ thư mục dự án.

::: tip Kiểm tra: bạn đúng khi
Trên GitHub PR có nhãn Merged, và tab Code của `main` hiện thư mục `club/`.
:::

### Bước 7. Tạo và gỡ một merge conflict

Conflict xảy ra khi hai branch sửa cùng một dòng. Bạn tự tạo để lần đầu gặp không hoảng. Hai branch `title-a` và `title-b` cùng đi ra từ `main` và cùng sửa dòng 1 của `club/README.md`.

```bash
git switch main
git switch -c feature/title-a
sed -i '1s/.*/# Club Management - ban A/' club/README.md
git commit -am "Change title (A)"
git push -u origin feature/title-a

git switch main
git switch -c feature/title-b
sed -i '1s/.*/# Club Management - ban B/' club/README.md
git commit -am "Change title (B)"
git push -u origin feature/title-b
```

Trên GitHub mở PR cho cả hai branch. Merge PR của `title-a` trước; PR của `title-b` sẽ báo "This branch has conflicts that must be resolved". Người merge sau là người gỡ conflict. Đưa `main` mới nhất vào branch của bạn:

```bash
git fetch origin
git merge origin/main
```

Kết quả mong đợi:

```text
Auto-merging club/README.md
CONFLICT (content): Merge conflict in club/README.md
Automatic merge failed; fix conflicts and then commit the result.
```

Mở file bằng VS Code (`code club/README.md`). Bạn thấy:

```text
<<<<<<< HEAD
# Club Management - ban B
=======
# Club Management - ban A
>>>>>>> origin/main
```

Phần trên `=======` là của bạn, phần dưới là của `main`. Chọn một dòng kết quả, ví dụ `# Club Management - A va B`, và xóa cả ba dòng dấu hiệu. Rồi kiểm tra, commit, push:

```bash
grep -n '^<<<<<<<\|^=======\|^>>>>>>>' club/README.md || echo "Khong con conflict marker"
git add club/README.md
git commit -m "Merge main into feature/title-b and resolve title conflict"
git push
```

Quay lại GitHub, PR của `title-b` hết conflict; bấm Merge. Cuối cùng dọn:

```bash
git switch main
git pull
git branch -d feature/title-a feature/title-b
head -1 club/README.md
```

::: tip Kiểm tra: bạn đúng khi
Bạn đã thấy dòng `CONFLICT (content)` thật, `grep` in `Khong con conflict marker`, và `head -1 club/README.md` là dòng bạn đã chọn.
:::

### Bước 8. Ghi note ngày 3

Tạo `notes/day-03.md` (trong `~/devops-labs/notes/`) trên một branch riêng, và đưa vào `main` bằng PR, giống các bước trên:

```bash
git switch -c docs/day-03-note
cat > notes/day-03.md <<'EOF'
# Ngày 3 - Git và Pull Request

- Link PR đã merge: <dán link PR "Add Club project">
- Link PR có conflict: <dán link PR title-b>
- Điều tôi hiểu: <2-3 câu: vì sao dùng branch + PR thay vì push thẳng main>
EOF
git add notes/day-03.md
git commit -m "Add day 3 note"
git push -u origin docs/day-03-note
```

Mở PR, merge, rồi `git switch main && git pull`.

## Gặp lỗi?

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Permission denied (publickey)` khi push | SSH key chưa thêm vào GitHub | `ssh -T git@github.com` để chẩn đoán, làm lại phần SSH trong [Tài khoản và repo GitHub](../../resources/setup-github.md) |
| `.env` xuất hiện trong `git status` | `.gitignore` thiếu dòng `.env`, hoặc file đã bị theo dõi | Thêm `.env` vào `.gitignore`; nếu đã tracked thì `git rm --cached club/.env` rồi commit |
| `rejected ... (fetch first)` khi push | Remote có commit mới mà local chưa có | `git pull`, xử lý conflict nếu có, push lại. Không `git push --force` |
| `cp: cannot create directory ... File exists` | `club/` đã tồn tại từ lần thử trước | Xem `ls ~/devops-labs/club`; nếu chỉ là bản thử, xóa nó (xem hộp cảnh báo dưới) rồi copy lại |
| Conflict marker còn sót trong file sau commit | Quên xóa `<<<<<<<`, `=======`, `>>>>>>>` | Chạy lệnh `grep` ở Bước 7, sửa, commit lại |
| Merge xong nhưng `main` local chưa có `club/` | Quên `git pull` sau khi merge trên web | `git switch main` rồi `git pull` |

::: danger Trước khi xóa
Chỉ xóa `club/` nếu bạn chắc nó là bản thử chưa có gì đáng giữ: `rm -rf ~/devops-labs/club`. Kiểm tra đường dẫn hai lần; không bao giờ chạy `rm -rf` với đường dẫn bạn không chắc.
:::

## Nộp bài

- [ ] Thư mục `club/` có trên nhánh `main` của repo `devops-labs` (qua PR đã merge).
- [ ] `git ls-files | grep -i '\.env$'` không in gì (không có `.env` trên GitHub).
- [ ] Đã có PR chứa conflict, đã gỡ và merge; `club/README.md` không còn conflict marker.
- [ ] `notes/day-03.md` có link hai PR và 2-3 câu giải thích vì sao dùng branch + PR.

## Tự kiểm tra

1. Bạn thêm `.env` vào `.gitignore` nhưng `git status` vẫn báo `.env` thay đổi. Vì sao?

::: details Đáp án gợi ý
File đã được Git theo dõi từ trước; `.gitignore` chỉ áp dụng cho file chưa theo dõi. Chạy `git rm --cached .env` rồi commit. Nếu đó là secret thật đã push lên GitHub thì phải đổi secret.
:::

2. Vì sao người merge sau là người gỡ conflict?

::: details Đáp án gợi ý
`main` đã đổi khi PR đầu merge. Branch của bạn phải đưa `main` mới vào (`git merge origin/main`), tự quyết định kết quả, rồi push lại. Git chỉ đánh dấu chỗ khác nhau, không biết ý định của con người.
:::

3. Đồng đội báo "push bị rejected, mình `git push --force` nhé?". Bạn trả lời gì?

::: details Đáp án gợi ý
Không. Rejected nghĩa là remote có commit mới; force push sẽ xóa chúng. Chạy `git pull`, gỡ conflict nếu có, rồi push thường. Tốt hơn là làm trên branch riêng và dùng PR.
:::

## Tiếp theo

[Ngày 4 – Chạy trang Club bằng container](../week-04/session-07.md).

::: details Tài liệu tham khảo
- [Pro Git (sách chính thức)](https://git-scm.com/book/vi/v2)
- [GitHub Docs – About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [GitHub Docs – Addressing merge conflicts](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)
- [GitHub Docs – Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
:::
