# Slide buổi 06 – Git & GitHub Workflow

> **Tóm tắt:** Làm việc nhóm với feature branch, Pull Request, code review, xử lý merge conflict đúng cách và bảo vệ nhánh main bằng branch protection.

Lệnh chi tiết của lab nằm trong bài học: [Buổi 06 – Git & GitHub Workflow](../../labs/week-03/session-06.md).

## Slide 1: Hôm nay bạn làm được gì

![Ba mục tiêu: nhánh riêng, Pull Request, main an toàn](/slides/img/s06-goals.svg)

::: details Ghi chú cho mentor
- Đọc nhanh 3 thẻ. Ngoài ra: viết `.gitignore` để không commit `.env`, `node_modules`.
- Branch protection yêu cầu PR và một review trước khi vào `main` (bật ở phần thử thách, sau khi xong các bước push trực tiếp).
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
- Ví von gửi bưu kiện: bỏ đồ vào hộp (add), niêm phong (commit), mang ra bưu điện (push).
- `git pull` là fetch cộng merge.
:::

---

## Slide 4: Branch chỉ là con trỏ

![Đồ thị commit có main, feature/x và HEAD](/slides/img/s06-branches.svg)

::: details Ghi chú cho mentor
- Commit có hash, tác giả, thời gian, trỏ tới commit cha. Branch tạo rất rẻ.
- Buổi này dùng merge; rebase viết lại lịch sử nên chưa dùng.
:::

---

## Slide 5: Từ feature branch đến main

![Dev A push, mở PR, reviewer approve, merge, rồi git pull](/slides/img/s06-pr-flow.svg)

::: details Ghi chú cho mentor
- PR là tính năng của GitHub, không phải của Git.
- `-u` ghi nhớ upstream, về sau chỉ cần `git push`. Không thể Approve PR của chính mình.
- Mọi commit nằm trên branch riêng, `main` không bị ảnh hưởng.
:::

---

## Slide 6: Reviewer hỏi gì

| Câu hỏi | Ví dụ |
| --- | --- |
| Đúng mô tả chưa? | Code làm đúng điều PR nói |
| Có lộ secret không? | `.env`, token, password |
| Có file thừa không? | `node_modules`, file log |
| Có thể lỗi ở đâu? | Trường hợp biên, dữ liệu rỗng |

Góp ý về code, không về con người. PR nhỏ, một mục đích.

::: details Ghi chú cho mentor
- PR nên dưới khoảng 300 dòng. Giá trị của PR: chỗ thảo luận, review, chạy kiểm tra tự động, lưu lý do thay đổi.
:::

---

## Slide 7: Demo: từ clone đến Pull Request

```bash
git switch -c feature/add-ten-ban
git add docs/members/ten-ban.md
git commit -m "Add Ten Ban profile"
git push -u origin feature/add-ten-ban
```

Mở PR trên web, base là `main`; mời bạn comment một dòng và Approve.

::: details Ghi chú cho mentor
- Trước đó: clone repo, sửa file, `git status` thấy `??`. Sau commit, `git log --oneline --graph --all` cho thấy `main` chưa đổi.
- Mô tả PR: đã đổi gì, vì sao, cách kiểm tra.
:::

---

## Slide 8: .gitignore phải có trước git add

![Add trước khi có .gitignore làm .env vào staging; có .gitignore thì không](/slides/img/s06-gitignore.svg)

::: details Ghi chú cho mentor
- `.gitignore` chỉ có tác dụng với file chưa theo dõi. Chỉ demo bằng giá trị giả, không bao giờ bằng secret thật.
- Kiểm tra: `git check-ignore -v .env` cho biết mẫu nào đang chặn file.
:::

---

## Slide 9: Người merge sau là người gỡ conflict

![Hai nhánh cùng sửa dòng 1: PR P merge trước, PR Q báo conflict rồi được gỡ](/slides/img/s06-conflict-flow.svg)

::: details Ghi chú cho mentor
- Đưa `main` mới nhất vào branch của mình (`git fetch origin`, `git merge origin/main`), sửa ở local, push lại.
- Git chỉ đánh dấu chỗ khác nhau; quyết định kết quả là việc của con người.
:::

---

## Slide 10: Đọc dấu conflict

![Các dòng dấu hiệu và phần của bạn, phần của main trong file bị conflict](/slides/img/s06-conflict-markers.svg)

::: details Ghi chú cho mentor
- Kiểm tra marker còn sót: `grep -rn '^<<<<<<<\|^=======\|^>>>>>>>' README.md docs/`.
- Rồi `git add`, `git commit`, `git push`.
:::

---

## Slide 11: Hoàn tác an toàn: revert

![git revert thêm commit đảo ngược; reset hard và force push làm mất commit](/slides/img/s06-revert.svg)

::: details Ghi chú cho mentor
- Lab: `git revert --no-edit HEAD` trên branch `practice/revert-demo`.
- Secret đã lên GitHub coi như đã lộ: phải đổi secret, không chỉ xóa file.
:::

---

## Slide 12: Lab: bốn phần trong 60 phút

| Phần | Việc làm | Mốc xong |
| --- | --- | --- |
| 1 | Commit đầu tiên và `.gitignore` | `git ls-files` không có `.env` |
| 2 | Feature branch và PR | PR Merged, có Approve |
| 3 | `git revert` trên branch thực hành | `README.md` hết dòng sai |
| 4 | Tạo và gỡ conflict theo cặp | `Khong con conflict marker` |

Lệnh đầy đủ: [Buổi 06 – Git & GitHub Workflow](../../labs/week-03/session-06.md).

::: details Ghi chú cho mentor
- Chưa bật branch protection trước khi xong các bước push trực tiếp.
- Nộp `lab-06/`; kiểm tra `git ls-files | grep -i env` trước khi push.
:::

---

## Slide 13: Debug: push bị từ chối

```text
$ git push
! [rejected]  main -> main (fetch first)
$ git pull
$ git push
```

Remote có commit mới. Không `git push --force`: sẽ xóa commit của đồng đội.

::: details Ghi chú cho mentor
- Điều tra: `git fetch origin`, `git log --oneline --graph --all`, rồi `git pull`, xử lý conflict nếu có.
- Tốt hơn: chuyển sang feature branch và PR.
:::

---

## Slide 14: Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `Permission denied (publickey)` | `ssh -T git@github.com`, thêm SSH key hoặc dùng HTTPS |
| `.env` trong `git status` | Thêm `.gitignore`; đã tracked thì `git rm --cached` |
| `Please tell me who you are` | Cấu hình `user.name` và `user.email` |
| Merge xong `main` local chưa đổi | `git switch main` rồi `git pull` |

::: details Ghi chú cho mentor
- Marker conflict còn sót: dùng `grep` trước khi commit.
:::

---

## Slide 15: Recap

![Ba điều cần nhớ: nhánh rồi PR, conflict bình thường, không force](/slides/img/s06-recap.svg)

Branch protection biến quy ước thành quy tắc, là nền cho CI/CD tuần sau.

Buổi tiếp theo: [Buổi 07 – Container Fundamentals](../02-docker/session-07.md).

---

## Slide 16: Đọc thêm: tài liệu chuẩn và best practices

- **Tài liệu chính thức:** [Pro Git book](https://git-scm.com/book/en/v2): sách Git chính thức, miễn phí.
- **Tài liệu chính thức:** [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow): quy trình branch, PR, merge đơn giản.
- **Best practice:** [Comparing Git workflows (Atlassian)](https://www.atlassian.com/git/tutorials/comparing-workflows): so sánh các cách làm việc nhóm với Git.
- **Best practice:** [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): bảo vệ nhánh main khỏi sửa trực tiếp.
