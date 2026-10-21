// Trang admin. Đăng nhập chỉ là cửa trước; RLS mới là khóa thật:
// người không có tên trong bảng admins sẽ nhận về danh sách rỗng dù có biết địa chỉ trang này.
(function () {
  var cfg = window.APP_CONFIG || null;
  var $ = function (id) { return document.getElementById(id); };
  var lastRows = [];

  function say(text, type) {
    var m = $('adminMsg');
    m.hidden = !text;
    m.textContent = text || '';
    m.className = 'alert alert-' + (type || 'error');
  }

  var ok = cfg && cfg.SUPABASE_URL && cfg.SUPABASE_KEY &&
    cfg.SUPABASE_URL.indexOf('YOUR-PROJECT-REF') === -1 &&
    cfg.SUPABASE_KEY.indexOf('YOUR_') === -1 && window.supabase;
  if (!ok) { $('setupNotice').hidden = false; return; }

  var client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

  function csvCell(v) {
    var s = String(v == null ? '' : v);
    // Chống "CSV injection": ô bắt đầu bằng = + - @ sẽ bị Excel coi là công thức.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function render(rows) {
    lastRows = rows;
    var tbody = $('rows');
    tbody.textContent = '';
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      [new Date(r.created_at).toLocaleString('vi-VN'), r.full_name, r.email, r.student_id || '', r.interest]
        .forEach(function (val) {
          var td = document.createElement('td');
          td.textContent = val; // textContent, không dùng innerHTML: tránh XSS từ dữ liệu người dùng nhập
          tr.appendChild(td);
        });
      tbody.appendChild(tr);
    });
    $('count').textContent = 'Tổng số: ' + rows.length + ' thành viên';
  }

  async function showList(session) {
    $('loginPanel').hidden = true;
    $('listPanel').hidden = false;
    $('whoami').textContent = 'Đang đăng nhập: ' + session.user.email;
    var res = await client.from('members')
      .select('created_at, full_name, email, student_id, interest')
      .order('created_at', { ascending: false });
    if (res.error) { console.error(res.error); return say('Không tải được danh sách.', 'error'); }
    render(res.data || []);
    if ((res.data || []).length === 0) {
      say('Danh sách trống. Nếu đã có người đăng ký, hãy kiểm tra tài khoản này đã nằm trong bảng admins chưa (xem README).', 'warn');
    } else say('');
  }

  function showLogin() {
    $('listPanel').hidden = true;
    $('loginPanel').hidden = false;
  }

  $('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    say('');
    var res = await client.auth.signInWithPassword({
      email: $('loginEmail').value.trim(),
      password: $('loginPassword').value
    });
    $('loginPassword').value = '';
    if (res.error) return say('Sai email hoặc mật khẩu.', 'error');
    showList(res.data.session);
  });

  $('logoutBtn').addEventListener('click', async function () {
    await client.auth.signOut();
    render([]);
    say('');
    showLogin();
  });

  $('csvBtn').addEventListener('click', function () {
    var header = ['created_at', 'full_name', 'email', 'student_id', 'interest'];
    var lines = [header.join(',')].concat(lastRows.map(function (r) {
      return header.map(function (h) { return csvCell(r[h]); }).join(',');
    }));
    var blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'members.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  client.auth.getSession().then(function (r) {
    if (r.data && r.data.session) showList(r.data.session); else showLogin();
  });
})();
