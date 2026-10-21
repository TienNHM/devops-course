// Chỉ báo "đã cấu hình hay chưa". KHÔNG BAO GIỜ trả về giá trị của secret.
// Trên Cloudflare, biến môi trường nằm ở context.env (không phải process.env).
export function onRequestGet(context) {
  const configured = Boolean(context.env.MY_SECRET);
  return Response.json({ MY_SECRET_configured: configured });
}
