# Slide Ngày 03 – Đưa dự án Club vào Git bằng Pull Request

> **Tóm tắt:** Đưa dự án Club vào repo `devops-labs` bằng feature branch và Pull Request, chặn `.env` bằng `.gitignore`, rồi tự tạo và gỡ một merge conflict.

## Slide 1: Hôm nay bạn làm ra gì

**Mốc cuối ngày:** thư mục `club/` nằm trên `main` của `devops-labs` qua một Pull Request đã merge, và bạn đã gỡ một conflict thật.

- Đã xong Ngày 2; repo `devops-labs` clone ở `~/devops-labs`, đăng nhập GitHub bằng SSH key.
- Thư mục `~/devops-course/starter-project` còn nguyên.

Thời gian: 15 phút slide, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Làm trong WSL, trong `~/` (không dùng `/mnt/c`).
- Phân bổ 85 phút: Bước 1 (5), Bước 2 (10), Bước 3 (10), Bước 4 (10), Bước 5 (15), Bước 6 (5), Bước 7 (30).
- Nhắc: không dán token hay password vào lệnh, file, chat.
- Hỏi: ai từng push nhầm lên nhánh chính?
:::

---

## Slide 2: 5 bạn cùng push thẳng lên main

![Push thẳng main dẫn tới lộ .env, mất commit, demo hỏng](/slides/img/s06-chaos.svg)

::: details Ghi chú cho mentor
- Kể: một bạn commit nhầm `.env` chứa mật khẩu database, một bạn `git push --force` làm mất commit của cả nhóm.
- Dự án Club đang nằm ở `~/devops-course/starter-project`, nơi chỉ đọc. Từ hôm nay mỗi người cần một bản của riêng mình trong `devops-labs`.
- Ngày 9 (CI) chạy trên Pull Request, nên cần quen luồng này ngay.
:::

---

## Slide 3: Bốn vùng của Git

![Working directory, staging, local repository, remote và lệnh giữa các vùng](/slides/img/s06-four-areas.svg)

::: details Ghi chú cho mentor
- Chỉ đọc theo lệnh: `git add`, `git commit`, `git push`. `git pull` là fetch cộng merge.
- Không đi sâu HEAD, rebase.
:::

---

## Slide 4: Bước 1 (5 phút): Kiểm tra Git và cập nhật main

Git cần biết bạn là ai, và `main` local phải mới nhất.

```bash
cd ~/devops-labs
git config --global user.name
git config --global user.email
git switch main
git pull
git status
```

Thiếu tên hoặc email thì đặt: `git config --global user.name "Tên của bạn"`.

**Kiểm tra: bạn đúng khi** `git status` báo `nothing to commit, working tree clean`.

::: details Ghi chú cho mentor
- Chạy thêm `git config --global pull.rebase false` để `git pull` luôn là merge.
- Kiểm tra SSH nếu cần: `ssh -T git@github.com` trả lời `Hi <tên-bạn>!`.
:::

---

## Slide 5: Bước 2 (10 phút): Tạo branch và copy dự án Club

Branch là một dòng lịch sử riêng, nên `main` không bị ảnh hưởng cho tới khi PR được merge.

```bash
git switch -c feature/add-club
cp -r ~/devops-course/starter-project ~/devops-labs/club
ls -a club
git status --short
```

Kết quả: `ls -a club` có `backend`, `frontend`, `database`, `compose.yaml`, `.gitignore`, `.env.example`.

**Kiểm tra: bạn đúng khi** `git status --short` chỉ có một dòng `?? club/`.

::: details Ghi chú cho mentor
- Tên branch nên mô tả việc: `feature/add-club`.
- Lỗi `cp: cannot create directory ... File exists` nghĩa là `club/` đã có từ lần thử trước; xem `ls ~/devops-labs/club` rồi quyết định giữ hay xóa.
:::

---

## Slide 6: Bước 3 (10 phút): .gitignore phải có trước git add

![Add trước khi có .gitignore làm .env vào staging; có .gitignore thì không](/slides/img/s06-gitignore.svg)

::: details Ghi chú cho mentor
- `.gitignore` chỉ có tác dụng với file chưa theo dõi. Chỉ demo bằng giá trị giả, không bao giờ bằng secret thật.
- Dự án Club đã có sẵn `.gitignore` chặn `.env` và `node_modules`.
:::

---

## Slide 7: Bước 3: Chứng minh .env bị chặn

Tạo một `.env` giả từ file mẫu, rồi hỏi Git có bỏ qua nó không.

```bash
cd ~/devops-labs/club
cat .gitignore
cp .env.example .env
git check-ignore -v .env
git status --short
```

Kết quả: `check-ignore` in một dòng có `.gitignore:1:.env`; `git status --short` không liệt kê `.env`.

**Kiểm tra: bạn đúng khi** `.env` không nằm trong `git status`.

::: details Ghi chú cho mentor
- Giá trị trong `.env.example` chỉ là giá trị mẫu, không phải secret thật.
- Luôn chạy `git check-ignore` trước khi `git add`.
:::

---

## Slide 8: Bước 4 (10 phút): Commit đúng thư mục club

Add đúng `club/`, không dùng `git add .` khi chưa chắc `.gitignore` đủ.

```bash
cd ~/devops-labs
git add club
git status --short
git commit -m "Add Club project"
git ls-files | grep -i '\.env$' || echo "OK: khong co file .env"
```

Kết quả: commit báo `N files changed`, dòng cuối là `OK: khong co file .env`.

**Kiểm tra: bạn đúng khi** `git log --oneline -1` có commit `Add Club project`.

::: details Ghi chú cho mentor
- File `.env.example` được phép có mặt vì nó không chứa secret.
- Cho học viên đọc `git status --short` trước khi commit: toàn dòng `A  club/...`.
:::

---

## Slide 9: Bước 5 (15 phút): Push branch lên GitHub

`-u` ghi nhớ upstream, lần sau chỉ cần `git push`.

```bash
git push -u origin feature/add-club
```

Kết quả: dòng cuối `branch 'feature/add-club' set up to track 'origin/feature/add-club'`.

**Kiểm tra: bạn đúng khi** trang repo trên GitHub hiện nút "Compare & pull request".

::: details Ghi chú cho mentor
- Lỗi `Permission denied (publickey)`: SSH key chưa thêm vào GitHub; chẩn đoán bằng `ssh -T git@github.com`.
:::

---

## Slide 10: Bước 5: Mở Pull Request và tự review

![Dev A push, mở PR, reviewer approve, merge, rồi git pull](/slides/img/s06-pr-flow.svg)

Bấm "Compare & pull request": base là `main`, compare là `feature/add-club`. Mở tab "Files changed" và đọc lại diff: có file thừa hoặc secret không?

::: details Ghi chú cho mentor
- PR là tính năng của GitHub, không phải của Git.
- Mô tả PR gồm: đã đổi gì, vì sao, cách kiểm tra.
- Học một mình thì không Approve được PR của chính mình: tự review diff rồi bấm "Merge pull request" (kiểu mặc định). Làm nhóm thì nhờ bạn Approve trước.
- Không bật branch protection hôm nay.
:::

---

## Slide 11: Bước 6 (5 phút): Merge và cập nhật main local

Sau khi bấm Merge trên GitHub, kéo `main` mới về máy rồi dọn branch.

```bash
git switch main
git pull
git branch -d feature/add-club
git log --oneline --graph -5
ls club
```

Kết quả: `Deleted branch feature/add-club`; `git log` có commit `Add Club project` và một merge commit.

**Kiểm tra: bạn đúng khi** PR có nhãn Merged và `ls club` có đủ thư mục dự án.

::: details Ghi chú cho mentor
- Lỗi thường gặp: quên `git pull` nên `main` local chưa có `club/`.
:::

---

## Slide 12: Bước 7 (30 phút): Người merge sau là người gỡ conflict

![Hai nhánh cùng sửa dòng 1: PR P merge trước, PR Q báo conflict rồi được gỡ](/slides/img/s06-conflict-flow.svg)

::: details Ghi chú cho mentor
- Conflict xảy ra khi hai branch sửa cùng một dòng. Hôm nay tự tạo để lần đầu gặp không hoảng.
- Git chỉ đánh dấu chỗ khác nhau; quyết định kết quả là việc của con người.
:::

---

## Slide 13: Bước 7: Hai branch cùng sửa dòng 1 (phần 1/2)

Branch `title-a` đi ra từ `main` và sửa dòng 1 của `club/README.md`.

```bash
git switch main
git switch -c feature/title-a
sed -i '1s/.*/# Club Management - ban A/' club/README.md
git commit -am "Change title (A)"
git push -u origin feature/title-a
```

**Kiểm tra: bạn đúng khi** `git push` thành công và GitHub có branch `feature/title-a`.

---

## Slide 14: Bước 7: Hai branch cùng sửa dòng 1 (phần 2/2)

Branch `title-b` cũng đi ra từ `main` và sửa đúng dòng 1 đó.

```bash
git switch main
git switch -c feature/title-b
sed -i '1s/.*/# Club Management - ban B/' club/README.md
git commit -am "Change title (B)"
git push -u origin feature/title-b
```

**Kiểm tra: bạn đúng khi** GitHub có cả hai branch `title-a` và `title-b`.

---

## Slide 15: Bước 7: Merge A trước, rồi gặp conflict ở B

Trên GitHub mở PR cho cả hai branch. Merge PR của `title-a` trước. PR của `title-b` báo: `This branch has conflicts that must be resolved`.

Ở branch `title-b`, đưa `main` mới nhất vào:

```bash
git fetch origin
git merge origin/main
```

```text
Auto-merging club/README.md
CONFLICT (content): Merge conflict in club/README.md
Automatic merge failed; fix conflicts and then commit the result.
```

::: details Ghi chú cho mentor
- Học viên đang đứng ở branch `feature/title-b` (vừa push xong); nhắc kiểm tra bằng `git branch --show-current`.
- Dòng `CONFLICT (content)` là điều mong đợi, không phải lỗi hệ thống.
:::

---

## Slide 16: Bước 7: Đọc dấu conflict

Mở file: `code club/README.md`. Bạn thấy:

```text
<<<<<<< HEAD
# Club Management - ban B
=======
# Club Management - ban A
>>>>>>> origin/main
```

Phần trên `=======` là của bạn, phần dưới là của `main`. Chọn một dòng kết quả, ví dụ `# Club Management - A va B`, và xóa cả ba dòng dấu hiệu.

::: details Ghi chú cho mentor
- Với conflict thật, bàn với tác giả kia trước khi chọn kết quả.
- Không xóa code của ai khi chưa hiểu.
:::

---

## Slide 17: Bước 7: Kiểm tra, commit, push

```bash
grep -n '^<<<<<<<\|^=======\|^>>>>>>>' club/README.md || echo "Khong con conflict marker"
git add club/README.md
git commit -m "Merge main into feature/title-b and resolve title conflict"
git push
```

**Kiểm tra: bạn đúng khi** `grep` in `Khong con conflict marker`.

::: details Ghi chú cho mentor
- Lỗi thường gặp: còn sót marker sau commit. Chạy lại `grep`, sửa, commit lại.
:::

---

## Slide 18: Bước 7: Merge B và dọn dẹp

Quay lại GitHub, PR của `title-b` hết conflict: bấm Merge. Rồi dọn:

```bash
git switch main
git pull
git branch -d feature/title-a feature/title-b
head -1 club/README.md
```

**Kiểm tra: bạn đúng khi** `head -1 club/README.md` là dòng bạn đã chọn khi gỡ conflict.

::: details Ghi chú cho mentor
- Nếu `git branch -d` báo branch chưa merge, kiểm tra PR tương ứng đã Merged chưa.
- Hết ngày: `club/` trên `main`, PR đã merge, conflict đã gỡ.
:::

---

## Slide 19: Lỗi thường gặp: push bị từ chối

```text
! [rejected]  main -> main (fetch first)
```

Remote có commit mới mà local chưa có. Chạy `git pull`, gỡ conflict nếu có, rồi `git push`. Không bao giờ `git push --force`: sẽ xóa commit của đồng đội.

::: details Ghi chú cho mentor
- Điều tra: `git fetch origin`, `git log --oneline --graph --all`.
- Tốt hơn là làm trên branch riêng và dùng PR.
:::

---

## Slide 20: Lỗi thường gặp: Permission denied và .env

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Permission denied (publickey)` khi push | SSH key chưa thêm vào GitHub | `ssh -T git@github.com`, rồi làm lại phần SSH của Ngày 1 |
| `.env` xuất hiện trong `git status` | `.gitignore` thiếu dòng `.env`, hoặc file đã bị theo dõi | Thêm `.env` vào `.gitignore`; đã tracked thì `git rm --cached club/.env` rồi commit |

::: details Ghi chú cho mentor
- Secret thật đã push lên GitHub thì phải đổi secret, không chỉ xóa file.
:::

---

## Slide 21: Lỗi thường gặp: club đã tồn tại, marker còn sót

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `cp: cannot create directory ... File exists` | `club/` đã có từ lần thử trước | `ls ~/devops-labs/club`; nếu chỉ là bản thử thì `rm -rf ~/devops-labs/club` rồi copy lại |
| `<<<<<<<` còn trong file sau commit | Quên xóa ba dòng dấu hiệu | Chạy `grep` ở Bước 7, sửa, commit lại |
| Merge xong nhưng `main` local chưa có `club/` | Quên `git pull` | `git switch main` rồi `git pull` |

::: details Ghi chú cho mentor
- Cảnh báo `rm -rf`: chỉ xóa khi chắc đó là bản thử, kiểm tra đường dẫn hai lần.
:::

---

## Slide 22: Tự kiểm tra

1. Bạn thêm `.env` vào `.gitignore` nhưng `git status` vẫn báo `.env` thay đổi. Vì sao?
2. Vì sao người merge sau là người gỡ conflict?
3. Đồng đội hỏi "push bị rejected, mình `git push --force` nhé?". Bạn trả lời gì?

::: details Ghi chú cho mentor
- 1: File đã được Git theo dõi từ trước; `.gitignore` chỉ áp dụng cho file chưa theo dõi. Chạy `git rm --cached .env` rồi commit. Secret thật đã push thì phải đổi.
- 2: `main` đã đổi khi PR đầu merge. Branch của bạn đưa `main` mới vào (`git merge origin/main`), tự quyết định kết quả, rồi push lại.
- 3: Không. Rejected nghĩa là remote có commit mới; force push sẽ xóa chúng. `git pull`, gỡ conflict nếu có, push thường.
:::

---

## Slide 23: Tiếp theo

Ngày 4 chạy trang Club bằng container: [Ngày 4 – Chạy trang Club bằng container](../02-docker/session-07.md).

---

## Slide 24: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Pro Git book](https://git-scm.com/book/en/v2): sách Git chính thức, miễn phí.
- **Tài liệu chính thức:** [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow): quy trình branch, PR, merge đơn giản.
- **Best practice:** [Comparing Git workflows (Atlassian)](https://www.atlassian.com/git/tutorials/comparing-workflows): so sánh các cách làm việc nhóm với Git.
- **Best practice:** [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): bảo vệ nhánh main khỏi sửa trực tiếp.
