// Logic của trang đăng ký. Chỉ dùng khóa công khai; quyền thật sự do RLS trong Supabase quyết định.
(function () {
  var cfg = window.APP_CONFIG || null;
  var form = document.getElementById('joinForm');
  var notice = document.getElementById('setupNotice');
  var msg = document.getElementById('formMsg');
  var btn = document.getElementById('submitBtn');

  document.getElementById('year').textContent = new Date().getFullYear();
  if (cfg && cfg.CLUB_NAME) document.getElementById('clubName').textContent = cfg.CLUB_NAME;

  function configured() {
    return cfg && cfg.SUPABASE_URL && cfg.SUPABASE_KEY &&
      cfg.SUPABASE_URL.indexOf('YOUR-PROJECT-REF') === -1 &&
      cfg.SUPABASE_KEY.indexOf('YOUR_') === -1;
  }

  function show(text, type) {
    msg.hidden = false;
    msg.textContent = text;
    msg.className = 'alert alert-' + type;
  }

  var client = null;
  if (configured() && window.supabase) {
    client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);
  } else {
    notice.hidden = false;
    btn.disabled = true;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    msg.hidden = true;
    if (!client) return;

    var data = new FormData(form);
    // Ô bẫy bot được điền: giả vờ thành công, không gửi gì cả.
    if (String(data.get('website') || '').trim() !== '') {
      show('Cảm ơn bạn đã đăng ký!', 'ok');
      form.reset();
      return;
    }

    var fullName = String(data.get('full_name') || '').trim();
    var email = String(data.get('email') || '').trim().toLowerCase();
    var studentId = String(data.get('student_id') || '').trim();
    var interest = String(data.get('interest') || 'general');

    if (fullName.length < 2) return show('Vui lòng nhập họ tên (ít nhất 2 ký tự).', 'error');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return show('Email chưa đúng định dạng.', 'error');
    if (!data.get('consent')) return show('Bạn cần đồng ý lưu thông tin để đăng ký.', 'error');

    btn.disabled = true;
    btn.textContent = 'Đang gửi...';

    // Không gọi .select() sau insert: khách không có quyền đọc bảng, chỉ có quyền ghi.
    var res = await client.from('members').insert({
      full_name: fullName,
      email: email,
      student_id: studentId || null,
      interest: interest
    });

    btn.disabled = false;
    btn.textContent = 'Gửi đăng ký';

    if (res.error) {
      if (res.error.code === '23505') return show('Email này đã đăng ký rồi. Cảm ơn bạn!', 'ok');
      console.error(res.error);
      return show('Chưa gửi được. Kiểm tra mạng và thử lại sau.', 'error');
    }
    form.reset();
    show('Đăng ký thành công! CLB sẽ liên hệ với bạn qua email.', 'ok');
  });
})();
