// GET /api/hello?name=An
export default async (req, context) => {
  const url = new URL(req.url);
  const name = (url.searchParams.get("name") || "bạn").slice(0, 40);
  return Response.json({
    message: `Xin chào ${name}`,
    platform: "netlify",
    time: new Date().toISOString(),
  });
};

export const config = { path: "/api/hello" };
