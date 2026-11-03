# Slide Ngày 03 – Đưa dự án Club vào Git bằng Pull Request

> **Tóm tắt:** Đưa dự án Club vào repo `devops-labs` bằng feature branch và Pull Request, chặn `.env` bằng `.gitignore`, và tự gỡ một merge conflict.

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: nhánh riêng, Pull Request, main an toàn](/slides/img/s06-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Sản phẩm cuối ngày: thư mục `club/` nằm trên `main` của `devops-labs` qua một PR đã merge.
- Hỏi: ai từng push nhầm lên nhánh chính?
:::

---

## Slide 2: 5 bạn cùng push thẳng lên main

![Push thẳng main dẫn tới lộ .env, mất commit, demo hỏng](/slides/img/s06-chaos.svg)

::: details Ghi chú cho mentor
- Kể: một bạn commit nhầm `.env` chứa mật khẩu database, một bạn `git push --force` làm mất commit của cả nhóm.
- Đến buổi demo `main` không chạy được và không ai biết commit nào gây lỗi.
:::

---

## Slide 3: Bốn vùng của Git

![Working directory, staging, local repository, remote và lệnh giữa các vùng](/slides/img/s06-four-areas.svg)

::: details Ghi chú cho mentor
- Chỉ đọc theo lệnh: `git add`, `git commit`, `git push`. `git pull` là fetch cộng merge.
- Không đi sâu HEAD, rebase.
:::

---

## Slide 4: Từ feature branch đến main

![Dev A push, mở PR, reviewer approve, merge, rồi git pull](/slides/img/s06-pr-flow.svg)

::: details Ghi chú cho mentor
- PR là tính năng của GitHub, không phải của Git.
- `-u` ghi nhớ upstream, về sau chỉ cần `git push`. Không thể Approve PR của chính mình; học một mình thì tự review diff rồi merge.
:::

---

## Slide 5: .gitignore phải có trước git add

![Add trước khi có .gitignore làm .env vào staging; có .gitignore thì không](/slides/img/s06-gitignore.svg)

::: details Ghi chú cho mentor
- `.gitignore` chỉ có tác dụng với file chưa theo dõi. Chỉ demo bằng giá trị giả, không bao giờ bằng secret thật.
- Kiểm tra: `git check-ignore -v .env` cho biết mẫu nào đang chặn file.
:::

---

## Slide 6: Demo: đưa Club vào repo

```bash
git switch -c feature/add-club
cp -r ~/devops-course/starter-project ~/devops-labs/club
git add club
git commit -m "Add Club project"
git push -u origin feature/add-club
```

Mở PR trên web, base là `main`, đọc lại diff rồi Merge.

::: details Ghi chú cho mentor
- Trước `git add`: `git status --short`, `git check-ignore -v .env`.
- Mô tả PR: đã đổi gì, vì sao, cách kiểm tra.
- Sau merge: `git switch main`, `git pull`.
:::

---

## Slide 7: Người merge sau là người gỡ conflict

![Hai nhánh cùng sửa dòng 1: PR P merge trước, PR Q báo conflict rồi được gỡ](/slides/img/s06-conflict-flow.svg)

::: details Ghi chú cho mentor
- Đưa `main` mới nhất vào branch của mình (`git fetch origin`, `git merge origin/main`), sửa ở local, push lại.
- Git chỉ đánh dấu chỗ khác nhau; quyết định kết quả là việc của con người.
:::

---

## Slide 8: Đọc dấu conflict

![Các dòng dấu hiệu và phần của bạn, phần của main trong file bị conflict](/slides/img/s06-conflict-markers.svg)

::: details Ghi chú cho mentor
- Kiểm tra marker còn sót: `grep -n '^<<<<<<<\|^=======\|^>>>>>>>' club/README.md`.
- Rồi `git add`, `git commit`, `git push`.
:::

---

## Slide 9: Lab Ngày 3

| Bước | Việc làm | Mốc xong |
| --- | --- | --- |
| 1-4 | Branch, copy `club/`, `.gitignore`, commit | `git ls-files` không có `.env` |
| 5-6 | Push, mở PR, merge | PR Merged, `main` có `club/` |
| 7 | Tạo và gỡ conflict | `Khong con conflict marker` |
| 8 | Viết `notes/day-03.md` | Note được merge qua PR |

Lệnh đầy đủ: [Ngày 3 – Đưa dự án Club vào Git bằng Pull Request](../../labs/week-03/session-06.md).

::: details Ghi chú cho mentor
- Không bật branch protection hôm nay (để ở phần thử thách).
- Nhắc: không dán token hay password vào lệnh, file, chat.
:::

---

## Slide 10: Debug: push bị từ chối

```text
$ git push
! [rejected]  main -> main (fetch first)
$ git pull
$ git push
```

Remote có commit mới. Không `git push --force`: sẽ xóa commit của đồng đội.

::: details Ghi chú cho mentor
- Điều tra: `git fetch origin`, `git log --oneline --graph --all`, rồi `git pull`, xử lý conflict nếu có.
- Các lỗi khác (`Permission denied (publickey)`, `.env` trong `git status`): xem bảng Gặp lỗi? trong bài lab.
:::

---

## Slide 11: Recap

![Ba điều cần nhớ: nhánh rồi PR, conflict bình thường, không force](/slides/img/s06-recap.svg)

Ngày tiếp theo: [Ngày 4 – Chạy trang Club bằng container](../02-docker/session-07.md).

---

## Slide 12: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Pro Git book](https://git-scm.com/book/en/v2): sách Git chính thức, miễn phí.
- **Tài liệu chính thức:** [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow): quy trình branch, PR, merge đơn giản.
- **Best practice:** [Comparing Git workflows (Atlassian)](https://www.atlassian.com/git/tutorials/comparing-workflows): so sánh các cách làm việc nhóm với Git.
- **Best practice:** [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): bảo vệ nhánh main khỏi sửa trực tiếp.
