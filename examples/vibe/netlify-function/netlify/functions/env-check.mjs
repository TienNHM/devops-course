// Chỉ báo "đã cấu hình hay chưa". KHÔNG BAO GIỜ trả về giá trị của secret.
export default async () => {
  const configured = Boolean(process.env.MY_SECRET);
  return Response.json({ MY_SECRET_configured: configured });
};

export const config = { path: "/api/env-check" };
