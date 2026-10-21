// Worker nhỏ: chỉ xử lý /api/*, mọi đường dẫn khác do static assets phục vụ.
// Nhờ "run_worker_first": ["/api/*"] trong wrangler.jsonc, chỉ request /api/* mới chạy code này.
// Trên Cloudflare, biến môi trường và secret nằm ở env (không phải process.env).

export async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/hello") {
    const name = (url.searchParams.get("name") || "bạn").slice(0, 40);
    return Response.json({
      message: `Xin chào ${name}`,
      platform: "cloudflare-workers-static",
      time: new Date().toISOString(),
    });
  }

  if (url.pathname === "/api/env-check") {
    // Chỉ báo "đã cấu hình hay chưa". KHÔNG BAO GIỜ trả về giá trị của secret.
    return Response.json({ MY_SECRET_configured: Boolean(env.MY_SECRET) });
  }

  if (url.pathname.startsWith("/api/")) {
    return Response.json({ error: "Không có endpoint này" }, { status: 404 });
  }

  // Phòng khi route khác cũng vào Worker: chuyển cho static assets.
  return env.ASSETS.fetch(request);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },
};
