# Kịch bản mentor – Buổi 06: Git & GitHub Workflow

::: warning Dành cho mentor
Trang này dành cho người dạy; học viên không cần đọc. Bài học viên: [Buổi 06 – Git & GitHub Workflow](../../labs/week-03/session-06.md). Slide: [Slide buổi 06](../../slides/01-foundation/session-06.md). Đáp án: [Walkthrough tuần 3](../walkthroughs/week-03.md). Chấm bài: [Chấm bài tuần 3](../grading/week-03.md).
:::

> **Tóm tắt:** Kịch bản dạy buổi 06: khung thời gian, demo Git và GitHub, câu hỏi cho lớp và ghi chú giảng viên theo từng slide.

## Khung thời gian buổi

Mỗi buổi 120 phút: 15' ôn tập, 30' kiến thức và demo, 60' thực hành, 15' review. Buổi thứ hai của tuần dồn vào thực hành, thử thách L2 và review bài làm.

Chuẩn bị trước buổi: tạo sẵn repo public `git-demo` trên tài khoản mentor (có commit khởi tạo), kiểm tra `ssh -T git@github.com` chạy được trên máy chiếu. Chia nhóm 2-3 người và chọn Bạn A (chủ repo) ngay từ đầu buổi.

Thời lượng gợi ý theo slide: mở đầu 2 phút, vấn đề 2 phút, bốn vùng 3 phút, commit/branch/merge 3 phút, PR và review 3 phút, luồng feature branch 3 phút, luồng conflict 3 phút, demo 1 khoảng 4 phút, demo 2 khoảng 4 phút, demo 3 khoảng 3 phút. Lab 60 phút: chuẩn bị 5, Phần 1 10, Phần 2 10, Phần 3 10, Phần 4 15, Phần 5 10.

## Demo của mentor

Mentor dùng một repo trống tên `git-demo` (public, tạo sẵn trên GitHub) và máy chiếu terminal WSL. Thời lượng khoảng 15 phút của phần 30 phút kiến thức.

1. Clone và xem trạng thái.

```bash
mkdir -p ~/work && cd ~/work
git clone git@github.com:MENTOR_USER/git-demo.git
cd git-demo
git status
git log --oneline
```

Kết quả mong đợi:

```text
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
a1b2c3d Initial commit
```

Câu hỏi cho lớp: "Hash `a1b2c3d` đại diện cho cái gì? Nếu tôi đổi một chữ trong commit này thì hash có đổi không?" (Có, vì hash tính từ nội dung.)

2. Tạo branch, sửa, commit.

```bash
git switch -c feature/add-members
echo "- Nguyen Van A" >> members.md
git status --short
git add members.md
git commit -m "Add first member"
git log --oneline --graph --all
```

Kết quả mong đợi:

```text
?? members.md
* 9f8e7d6 (HEAD -> feature/add-members) Add first member
* a1b2c3d (origin/main, origin/HEAD, main) Initial commit
```

Câu hỏi: "Dòng `??` nghĩa là gì? Vì sao `main` chưa thay đổi?"

3. Push và mở PR trên web, rồi để một học viên review và Approve.

```bash
git push -u origin feature/add-members
```

Kết quả mong đợi: Git in ra đường dẫn gợi ý tạo Pull Request (`Create a pull request for 'feature/add-members' on GitHub by visiting: ...`) và dòng `branch 'feature/add-members' set up to track 'origin/feature/add-members'`.

4. Demo `.gitignore` sai thứ tự: tạo file `.env`, `git add .`, thấy nó bị staged, sau đó `git restore --staged .env`, tạo `.gitignore` chứa `.env` và chạy lại `git status`.

```bash
echo "DB_PASSWORD=dummy" > .env
git add .
git status --short
git restore --staged .env
echo ".env" > .gitignore
git status --short
```

Kết quả mong đợi: lần đầu có dòng `A  .env`, lần sau chỉ còn `?? .gitignore`. Câu hỏi: "Nếu tôi đã commit `.env` rồi mới thêm `.gitignore`, chuyện gì xảy ra?" (File vẫn bị theo dõi và vẫn nằm trong lịch sử.)

5. Mentor chỉ nhanh một conflict mẫu (xem Phần 4 của lab) để lớp thấy dấu `<<<<<<<`, `=======`, `>>>>>>>` trước khi tự làm.

## Câu hỏi mentor nên hỏi lớp

1. Bạn nào từng bị mất code vì ghi đè? (Mở đầu, dẫn tới vì sao cần branch và PR.)
2. Tôi commit rồi nhưng chưa push, đồng đội có thấy không? (Không.)
3. Nếu đổi một chữ trong commit thì hash có đổi không? (Có, hash tính từ nội dung.)
4. Dòng `??` nghĩa là gì? Vì sao `main` chưa đổi?
5. Bước nào GitHub mới biết có thay đổi của bạn? (Sau `git push`.)
6. Vì sao không được xóa phần của người kia cho nhanh khi resolve conflict?
7. Nếu commit `.env` rồi mới thêm `.gitignore` thì sao? (File vẫn bị theo dõi và vẫn nằm trong lịch sử.)
8. Ai gặp `Permission denied (publickey)` rồi?

## Thử thách tại lớp

Cho 2 phút thảo luận theo nhóm rồi gọi một nhóm trả lời.

- Đồng đội hỏi: "Mình push bị rejected, mình nên `git push --force` đúng không?"
- Bạn trả lời gì, và nên đề xuất quy trình nào thay thế?
- Bonus: bạn là chủ repo, một mình, branch protection yêu cầu 1 approval: chuyện gì xảy ra?

Gợi ý: rejected nghĩa là remote có commit mới. Force push sẽ làm gì với commit đó?

Đáp án: không force. `git pull`, xử lý conflict, push thường; tốt hơn là dùng feature branch và PR. Bonus: không tự Approve được PR của mình nên không merge được nếu rule áp dụng cho admin; đó là chủ đích để luôn có người thứ hai xem qua.

## Ghi chú giảng viên theo slide

- **Slide 1 – Mục tiêu buổi học.** Mở đầu 2 phút. Hôm nay làm theo nhóm 2-3 người, nên chia nhóm và chọn Bạn A (chủ repo) ngay từ đầu buổi.
- **Slide 2 – Vấn đề thực tế.** Hỏi lớp: bạn nào từng bị mất code vì ghi đè? Nhấn mạnh quy trình này là nền của CI/CD: GitHub Actions sẽ chạy trên mỗi PR ở các tuần sau. 2 phút.
- **Slide 3 – Bốn vùng của Git.** Vẽ bốn hộp nối nhau trên bảng. Hỏi: tôi commit rồi nhưng chưa push, đồng đội có thấy không? (Không.) 3 phút.
- **Slide 4 – Commit, branch, merge.** Hỏi: nếu đổi một chữ trong commit thì hash có đổi không? (Có, hash tính từ nội dung.) 3 phút.
- **Slide 5 – Pull Request và code review.** Cho ví dụ một comment review tốt và một comment kém. Nhắc quy ước đặt tên: `feature/add-member-list`, `fix/readme-typo`; commit dạng câu mệnh lệnh. 3 phút.
- **Slide 6 – .gitignore và quy tắc an toàn.** Nhắc câu hỏi: nếu commit .env rồi mới thêm .gitignore thì sao? File vẫn bị theo dõi và vẫn nằm trong lịch sử. 3 phút.
- **Slide 7 – Luồng feature branch đến merge.** Đi từng mũi tên 3 phút. Hỏi: bước nào GitHub mới biết có thay đổi của bạn?
- **Slide 8 – Luồng của một conflict.** Hỏi: vì sao không được xóa phần của người kia cho nhanh? Chuẩn bị cho phần demo conflict. 3 phút.
- **Slide 9 – Demo clone, branch, commit.** Thay MENTOR_USER bằng tài khoản thật của mentor. Hỏi: dòng ?? nghĩa là gì? Vì sao main chưa đổi? Hash trong output chỉ để minh họa. 4 phút.
- **Slide 10 – Demo push và mở Pull Request.** Làm trực tiếp trên GitHub chiếu lên màn hình. Gọi một học viên lên để comment trên một dòng cụ thể. 4 phút.
- **Slide 11 – Demo .gitignore sai thứ tự.** Output rút gọn: đúng là lần đầu có dòng A cho .env, lần sau chỉ còn ?? .gitignore. Chỉ dùng giá trị dummy, không bao giờ demo bằng secret thật. 3 phút.
- **Lab – Chuẩn bị nhóm.** Thay OWNER bằng tài khoản của Bạn A; ai dùng HTTPS thì dùng URL https. Nếu ssh -T git@github.com lỗi, xử lý xác thực trước khi vào lab. Không dán token vào lệnh hay chat. 5 phút.
- **Lab L1 – Skeleton và .gitignore.** Lab 60 phút: Phần 1 khoảng 10 phút. Giải thích git check-ignore -v cho biết mẫu nào đang chặn file, hữu ích khi debug.
- **Lab L1 – Feature branch và commit.** Nhắc git diff chỉ hiện file đã theo dõi; file mới chỉ thấy trong git status. Mỗi người cần ít nhất 2 commit. 10 phút.
- **Lab L1 – PR, review, merge.** Nếu chọn Squash, git branch -d sẽ báo branch chưa merge và phải dùng -D. Phần hoàn tác an toàn bằng git revert trên branch practice làm theo bài lab (Phần 3).
- **Lab L1 – Tạo và resolve conflict.** Nhóm 3 người: C đóng vai reviewer cho cả hai PR. Làm theo cặp 15 phút; đi vòng các nhóm kiểm tra ai đã thấy dấu hiệu conflict.
- **Đọc dấu conflict và hoàn tất.** Nhấn mạnh: xóa sạch phần của người kia là sai. Nếu grep còn in dòng nào, nghĩa là còn marker. Reviewer là P xem phần đã gộp trước khi Approve.
- **Lab L2 – Thử thách.** Repo private trên gói miễn phí có thể không hỗ trợ branch protection, nên dùng repo public. Chủ repo vẫn push được nghĩa là rule cho phép admin bypass. Lịch sử cũ vẫn chứa .env nên secret thật phải đổi.
- **Lỗi thường gặp.** Chọn 2 lỗi hay gặp nhất của lớp để nhấn mạnh. Hỏi: ai gặp Permission denied publickey rồi?
- **Phá lỗi – Push bị từ chối.** Tái hiện: P và Q cùng sửa dòng đầu của docs/team.md ngay trên main local, P push trước, Q push sau. Làm trước khi bật branch protection. 5 phút.
- **Thử thách tại lớp.** Cho 2 phút thảo luận theo nhóm rồi gọi một nhóm trả lời.
- **Recap.** Nhắc nộp `lab-06/` kèm link PR và ảnh PR đã Approve và merged. Kiểm tra bằng `git ls-files | grep -i env` trước khi push. Buổi sau bắt đầu Docker.

## Lưu ý riêng cho người dạy

- Thứ tự quan trọng: chỉ bật branch protection sau khi nhóm đã xong các bước push trực tiếp lên `main` (Phần 1 và phần Phá lỗi nâng cao), vì rule sẽ chặn các thao tác đó.
- Buổi này là nơi giải thích đầy đủ Git và GitHub; học viên đã gặp bản rút gọn "Git trong 10 phút" ở trang Bắt đầu từ đây và ở Buổi 01, nên có thể hỏi nhanh ai đã làm để điều chỉnh tốc độ.
- Repo của học viên (`devops-labs`) để public vì cần cho GitHub Pages và GHCR miễn phí về sau; repo nhóm `club-team-lab` cũng public để bật được branch protection trên gói miễn phí.
- Học viên làm một mình (không có nhóm) vẫn làm được Phần 4 bằng hai branch tự đóng cả hai vai; PR vẫn cần một bạn review thật cho bài tập.
