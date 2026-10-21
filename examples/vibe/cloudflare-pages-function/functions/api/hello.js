// GET /api/hello?name=An
export function onRequestGet(context) {
  const url = new URL(context.request.url);
  const name = (url.searchParams.get("name") || "bạn").slice(0, 40);
  return Response.json({
    message: `Xin chào ${name}`,
    platform: "cloudflare-pages",
    time: new Date().toISOString(),
  });
}
