# Slide Ngày 03 – Đưa dự án Club vào Git bằng Pull Request

> **Tóm tắt:** Ngày 3 đưa dự án Club vào repository `devops-labs` bằng feature branch và Pull Request, chặn tệp `.env` bằng `.gitignore`, rồi tạo và gỡ một merge conflict có chủ đích.

## Slide 1: Mục tiêu và sản phẩm cuối ngày

**Mốc cuối ngày:** thư mục `club/` nằm trên `main` của `devops-labs` thông qua một Pull Request đã merge, và một conflict thật đã được gỡ.

- Điều kiện: đã hoàn thành Ngày 2; repository `devops-labs` được clone ở `~/devops-labs`; đã đăng nhập GitHub bằng SSH key.
- Thư mục `~/devops-course/starter-project` còn nguyên.

Thời gian: 15 phút slide, 85 phút thực hành, 20 phút tổng kết.

::: details Ghi chú cho mentor
- Thực hành trong WSL, tại `~/` (không dùng `/mnt/c`).
- Phân bổ 85 phút: Bước 1 (5), Bước 2 (10), Bước 3 (10), Bước 4 (10), Bước 5 (15), Bước 6 (5), Bước 7 (30).
- Nhắc: không dán token hay password vào lệnh, tệp hoặc tin nhắn.
- Câu hỏi mở đầu: ai đã từng push nhầm lên nhánh chính?
:::

---

## Slide 2: Vấn đề: nhiều người cùng push thẳng lên main

![Push thẳng main dẫn tới lộ .env, mất commit, demo hỏng](/slides/img/s06-chaos.svg)

::: details Ghi chú cho mentor
- Tình huống minh họa: một thành viên commit nhầm `.env` chứa mật khẩu database; một thành viên chạy `git push --force` làm mất commit của cả nhóm.
- Dự án Club hiện nằm ở `~/devops-course/starter-project`, thư mục chỉ để đọc. Từ hôm nay mỗi người cần một bản riêng trong `devops-labs`.
- Ngày 9 (CI) chạy trên Pull Request, vì vậy cần làm quen luồng này từ bây giờ.
:::

---

## Slide 3: Khái niệm: Git và repository

- **Git** là hệ thống quản lý phiên bản (version control system): nó lưu lịch sử thay đổi của mã nguồn.
- **Repository** (kho mã nguồn) là nơi Git lưu toàn bộ tệp của dự án cùng lịch sử thay đổi của chúng.
- Ví dụ trong dự án: `~/devops-labs` là một repository, và `club/` sẽ trở thành một thư mục trong đó.

---

## Slide 4: Bốn vùng của Git

![Working directory, staging, local repository, remote và lệnh giữa các vùng](/slides/img/s06-four-areas.svg)

::: details Ghi chú cho mentor
- Chỉ đọc sơ đồ theo lệnh: `git add`, `git commit`, `git push`. `git pull` là fetch cộng merge.
- Không đi sâu vào HEAD và rebase.
:::

---

## Slide 5: Khái niệm: Commit

- **Commit** là một bản ghi (snapshot) trạng thái các tệp tại một thời điểm, kèm thông điệp mô tả thay đổi.
- Các commit nối tiếp nhau tạo thành lịch sử của repository, nên có thể xem lại hoặc quay về từng thời điểm.
- Ví dụ trong dự án: ở Bước 4, lệnh `git commit -m "Add Club project"` tạo commit đầu tiên chứa thư mục `club/`.

---

## Slide 6: Khái niệm: Branch

- **Branch** (nhánh) là một dòng lịch sử commit riêng, tách ra từ một điểm của nhánh khác.
- Công việc trên branch không ảnh hưởng đến `main` cho đến khi branch được merge.
- Ví dụ trong dự án: branch `feature/add-club` chứa việc thêm `club/`; `main` giữ nguyên cho đến khi Pull Request được merge.

---

## Slide 7: Khái niệm: Remote và push

- **Remote** là phiên bản của repository đặt trên máy chủ, ở đây là GitHub; tên mặc định của remote là `origin`.
- **Push** gửi các commit từ repository trên máy lên remote; **pull** lấy commit mới từ remote về máy.
- Ví dụ trong dự án: `git push -u origin feature/add-club` gửi branch lên GitHub.

---

## Slide 8: Bước 1 (5 phút): Kiểm tra Git và cập nhật main

Git cần biết danh tính của người commit, và `main` trên máy phải là bản mới nhất.

```bash
cd ~/devops-labs
git config --global user.name
git config --global user.email
git switch main
git pull
git status
```

Khi thiếu tên hoặc email, đặt bằng lệnh: `git config --global user.name "Tên của bạn"`.

**Kiểm tra: kết quả đúng khi** `git status` báo `nothing to commit, working tree clean`.

::: details Ghi chú cho mentor
- Có thể chạy thêm `git config --global pull.rebase false` để `git pull` luôn thực hiện merge.
- Kiểm tra SSH khi cần: `ssh -T git@github.com` trả lời `Hi <tên-bạn>!`.
:::

---

## Slide 9: Bước 2 (10 phút): Tạo branch và copy dự án Club

Branch là một dòng lịch sử riêng, do đó `main` không bị ảnh hưởng cho đến khi Pull Request được merge.

```bash
git switch -c feature/add-club
cp -r ~/devops-course/starter-project ~/devops-labs/club
ls -a club
git status --short
```

Kết quả: `ls -a club` liệt kê `backend`, `frontend`, `database`, `compose.yaml`, `.gitignore`, `.env.example`.

**Kiểm tra: kết quả đúng khi** `git status --short` chỉ có một dòng `?? club/`.

::: details Ghi chú cho mentor
- Tên branch nên mô tả công việc, ví dụ `feature/add-club`.
- Lỗi `cp: cannot create directory ... File exists` nghĩa là `club/` đã tồn tại từ lần thử trước; xem `ls ~/devops-labs/club` rồi quyết định giữ hay xóa.
:::

---

## Slide 10: Khái niệm: .gitignore

- **`.gitignore`** là tệp liệt kê các mẫu tên tệp mà Git phải bỏ qua, không đưa vào commit.
- Tệp chứa bí mật như `.env` (mật khẩu, khóa) cần được liệt kê ở đây để không bị đẩy lên repository công khai.
- Lưu ý: `.gitignore` chỉ có tác dụng với tệp Git chưa theo dõi; tệp đã được commit trước đó vẫn tiếp tục bị theo dõi.

---

## Slide 11: Bước 3 (10 phút): .gitignore phải có trước git add

![Add trước khi có .gitignore làm .env vào staging; có .gitignore thì không](/slides/img/s06-gitignore.svg)

::: details Ghi chú cho mentor
- `.gitignore` chỉ có tác dụng với tệp chưa theo dõi. Chỉ minh họa bằng giá trị giả, không bao giờ bằng secret thật.
- Dự án Club đã có sẵn `.gitignore` chặn `.env` và `node_modules`.
:::

---

## Slide 12: Bước 3: Chứng minh .env bị chặn

Tạo một `.env` giả từ tệp mẫu, rồi kiểm tra Git có bỏ qua tệp đó hay không.

```bash
cd ~/devops-labs/club
cat .gitignore
cp .env.example .env
git check-ignore -v .env
git status --short
```

Kết quả: `check-ignore` in một dòng có `.gitignore:1:.env`; `git status --short` không liệt kê `.env`.

**Kiểm tra: kết quả đúng khi** `.env` không xuất hiện trong `git status`.

::: details Ghi chú cho mentor
- Giá trị trong `.env.example` chỉ là giá trị mẫu, không phải secret thật.
- Luôn chạy `git check-ignore` trước khi `git add`.
:::

---

## Slide 13: Bước 4 (10 phút): Commit đúng thư mục club

Chỉ add thư mục `club/`. Không dùng `git add .` khi chưa chắc `.gitignore` đã đầy đủ.

```bash
cd ~/devops-labs
git add club
git status --short
git commit -m "Add Club project"
git ls-files | grep -i '\.env$' || echo "OK: khong co file .env"
```

Kết quả: commit báo `N files changed`, dòng cuối là `OK: khong co file .env`.

**Kiểm tra: kết quả đúng khi** `git log --oneline -1` hiển thị commit `Add Club project`.

::: details Ghi chú cho mentor
- Tệp `.env.example` được phép có mặt vì nó không chứa secret.
- Yêu cầu học viên đọc `git status --short` trước khi commit: toàn bộ dòng có dạng `A  club/...`.
:::

---

## Slide 14: Bước 5 (15 phút): Push branch lên GitHub

Tùy chọn `-u` ghi nhớ upstream, vì vậy các lần sau chỉ cần chạy `git push`.

```bash
git push -u origin feature/add-club
```

Kết quả: dòng cuối là `branch 'feature/add-club' set up to track 'origin/feature/add-club'`.

**Kiểm tra: kết quả đúng khi** trang repository trên GitHub hiển thị nút "Compare & pull request".

::: details Ghi chú cho mentor
- Lỗi `Permission denied (publickey)`: SSH key chưa được thêm vào GitHub; chẩn đoán bằng `ssh -T git@github.com`.
:::

---

## Slide 15: Khái niệm: Pull Request và merge

- **Pull Request** (PR) là yêu cầu của GitHub để đưa các commit của một branch vào branch khác, kèm không gian xem xét (review) thay đổi.
- **Merge** là thao tác Git hợp nhất lịch sử của hai branch; PR được merge khi nội dung đã được xem xét.
- Ví dụ trong dự án: PR từ `feature/add-club` vào `main`, rồi nút "Merge pull request" đưa `club/` vào `main`.

---

## Slide 16: Bước 5: Mở Pull Request và tự review

![Dev A push, mở PR, reviewer approve, merge, rồi git pull](/slides/img/s06-pr-flow.svg)

Chọn "Compare & pull request": base là `main`, compare là `feature/add-club`. Mở tab "Files changed" và đọc lại diff để kiểm tra có tệp thừa hoặc secret hay không.

::: details Ghi chú cho mentor
- PR là tính năng của GitHub, không phải của Git.
- Mô tả PR gồm: đã thay đổi gì, vì sao, cách kiểm tra.
- Khi học một mình, không thể Approve PR của chính mình: tự review diff rồi chọn "Merge pull request" (kiểu mặc định). Khi làm nhóm, nhờ thành viên khác Approve trước.
- Không bật branch protection hôm nay.
:::

---

## Slide 17: Bước 6 (5 phút): Merge và cập nhật main local

Sau khi merge trên GitHub, kéo `main` mới về máy rồi xóa branch đã xong việc.

```bash
git switch main
git pull
git branch -d feature/add-club
git log --oneline --graph -5
ls club
```

Kết quả: `Deleted branch feature/add-club`; `git log` có commit `Add Club project` và một merge commit.

**Kiểm tra: kết quả đúng khi** PR có nhãn Merged và `ls club` liệt kê đủ các thư mục của dự án.

::: details Ghi chú cho mentor
- Lỗi thường gặp: quên `git pull` nên `main` trên máy chưa có `club/`.
:::

---

## Slide 18: Khái niệm: Merge conflict

- **Merge conflict** (xung đột merge) xảy ra khi hai branch cùng sửa một vị trí trong một tệp và Git không thể tự chọn kết quả.
- Git chỉ đánh dấu các đoạn khác nhau trong tệp; việc quyết định nội dung cuối cùng thuộc về con người.
- Ví dụ trong dự án: ở Bước 7, hai branch cùng sửa dòng 1 của `club/README.md`.

---

## Slide 19: Bước 7 (30 phút): Người merge sau là người gỡ conflict

![Hai nhánh cùng sửa dòng 1: PR P merge trước, PR Q báo conflict rồi được gỡ](/slides/img/s06-conflict-flow.svg)

::: details Ghi chú cho mentor
- Conflict xảy ra khi hai branch sửa cùng một dòng. Hôm nay conflict được tạo có chủ đích để lần đầu gặp không gây lúng túng.
- Git chỉ đánh dấu chỗ khác nhau; quyết định kết quả là việc của con người.
:::

---

## Slide 20: Bước 7: Hai branch cùng sửa dòng 1 (phần 1/2)

Branch `title-a` đi ra từ `main` và sửa dòng 1 của `club/README.md`.

```bash
git switch main
git switch -c feature/title-a
sed -i '1s/.*/# Club Management - ban A/' club/README.md
git commit -am "Change title (A)"
git push -u origin feature/title-a
```

**Kiểm tra: kết quả đúng khi** `git push` thành công và GitHub có branch `feature/title-a`.

---

## Slide 21: Bước 7: Hai branch cùng sửa dòng 1 (phần 2/2)

Branch `title-b` cũng đi ra từ `main` và sửa đúng dòng 1 đó.

```bash
git switch main
git switch -c feature/title-b
sed -i '1s/.*/# Club Management - ban B/' club/README.md
git commit -am "Change title (B)"
git push -u origin feature/title-b
```

**Kiểm tra: kết quả đúng khi** GitHub có cả hai branch `title-a` và `title-b`.

---

## Slide 22: Bước 7: Merge A trước, rồi gặp conflict ở B

Trên GitHub, mở PR cho cả hai branch và merge PR của `title-a` trước. PR của `title-b` khi đó báo: `This branch has conflicts that must be resolved`.

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
- Dòng `CONFLICT (content)` là kết quả mong đợi, không phải lỗi hệ thống.
:::

---

## Slide 23: Bước 7: Đọc dấu conflict

Mở tệp bằng lệnh `code club/README.md`. Nội dung có dạng:

```text
<<<<<<< HEAD
# Club Management - ban B
=======
# Club Management - ban A
>>>>>>> origin/main
```

Phần phía trên `=======` là nội dung của branch hiện tại, phần phía dưới là của `main`. Chọn một dòng kết quả, ví dụ `# Club Management - A va B`, và xóa cả ba dòng dấu hiệu.

::: details Ghi chú cho mentor
- Với conflict thật, cần trao đổi với tác giả của thay đổi kia trước khi chọn kết quả.
- Không xóa code của người khác khi chưa hiểu.
:::

---

## Slide 24: Bước 7: Kiểm tra, commit, push

```bash
grep -n '^<<<<<<<\|^=======\|^>>>>>>>' club/README.md || echo "Khong con conflict marker"
git add club/README.md
git commit -m "Merge main into feature/title-b and resolve title conflict"
git push
```

**Kiểm tra: kết quả đúng khi** `grep` in `Khong con conflict marker`.

::: details Ghi chú cho mentor
- Lỗi thường gặp: còn sót marker sau commit. Chạy lại `grep`, sửa, rồi commit lại.
:::

---

## Slide 25: Bước 7: Merge B và dọn dẹp

Quay lại GitHub: PR của `title-b` đã hết conflict, chọn Merge. Sau đó dọn dẹp:

```bash
git switch main
git pull
git branch -d feature/title-a feature/title-b
head -1 club/README.md
```

**Kiểm tra: kết quả đúng khi** `head -1 club/README.md` là dòng đã chọn khi gỡ conflict.

::: details Ghi chú cho mentor
- Khi `git branch -d` báo branch chưa merge, kiểm tra PR tương ứng đã ở trạng thái Merged chưa.
- Kết thúc ngày: `club/` nằm trên `main`, PR đã merge, conflict đã được gỡ.
:::

---

## Slide 26: Lỗi thường gặp: push bị từ chối

```text
! [rejected]  main -> main (fetch first)
```

Remote có commit mới mà repository trên máy chưa có. Chạy `git pull`, gỡ conflict nếu có, rồi chạy `git push`. Không dùng `git push --force`, vì lệnh này xóa commit của đồng đội.

::: details Ghi chú cho mentor
- Điều tra: `git fetch origin`, `git log --oneline --graph --all`.
- Cách tốt hơn là làm việc trên branch riêng và dùng PR.
:::

---

## Slide 27: Lỗi thường gặp: Permission denied và .env

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `Permission denied (publickey)` khi push | SSH key chưa thêm vào GitHub | `ssh -T git@github.com`, rồi làm lại phần SSH của Ngày 1 |
| `.env` xuất hiện trong `git status` | `.gitignore` thiếu dòng `.env`, hoặc file đã bị theo dõi | Thêm `.env` vào `.gitignore`; đã tracked thì `git rm --cached club/.env` rồi commit |

::: details Ghi chú cho mentor
- Khi secret thật đã được push lên GitHub, phải đổi secret đó; chỉ xóa tệp là chưa đủ.
:::

---

## Slide 28: Lỗi thường gặp: club đã tồn tại, marker còn sót

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `cp: cannot create directory ... File exists` | `club/` đã có từ lần thử trước | `ls ~/devops-labs/club`; nếu chỉ là bản thử thì `rm -rf ~/devops-labs/club` rồi copy lại |
| `<<<<<<<` còn trong file sau commit | Quên xóa ba dòng dấu hiệu | Chạy `grep` ở Bước 7, sửa, commit lại |
| Merge xong nhưng `main` local chưa có `club/` | Quên `git pull` | `git switch main` rồi `git pull` |

::: details Ghi chú cho mentor
- Cảnh báo về `rm -rf`: chỉ xóa khi chắc chắn đó là bản thử, và kiểm tra đường dẫn hai lần.
:::

---

## Slide 29: Tự kiểm tra

1. Tệp `.env` đã được thêm vào `.gitignore` nhưng `git status` vẫn báo `.env` thay đổi. Nguyên nhân là gì?
2. Vì sao người merge sau là người phải gỡ conflict?
3. Một đồng đội hỏi: "Push bị rejected, có nên chạy `git push --force` không?". Câu trả lời đúng là gì?

::: details Ghi chú cho mentor
- 1: Tệp đã được Git theo dõi từ trước; `.gitignore` chỉ áp dụng cho tệp chưa theo dõi. Chạy `git rm --cached .env` rồi commit. Secret thật đã push thì phải đổi.
- 2: `main` đã thay đổi khi PR đầu tiên được merge. Branch của người merge sau đưa `main` mới vào (`git merge origin/main`), tự quyết định kết quả, rồi push lại.
- 3: Không. Rejected nghĩa là remote có commit mới; force push sẽ xóa các commit đó. Chạy `git pull`, gỡ conflict nếu có, rồi push thông thường.
:::

---

## Slide 30: Tiếp theo

Ngày 4 chạy trang Club bằng container: [Ngày 4 – Chạy trang Club bằng container](../02-docker/session-07.md).

---

## Slide 31: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Pro Git book](https://git-scm.com/book/en/v2): sách Git chính thức, miễn phí.
- **Tài liệu chính thức:** [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow): quy trình branch, PR, merge đơn giản.
- **Best practice:** [Comparing Git workflows (Atlassian)](https://www.atlassian.com/git/tutorials/comparing-workflows): so sánh các cách làm việc nhóm với Git.
- **Best practice:** [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): bảo vệ nhánh main khỏi sửa trực tiếp.
