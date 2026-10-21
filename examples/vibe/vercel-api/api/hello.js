// GET /api/hello?name=An  ->  { "message": "Xin chào An", ... }
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const name = (url.searchParams.get("name") || "bạn").slice(0, 40);
    return Response.json({
      message: `Xin chào ${name}`,
      platform: "vercel",
      time: new Date().toISOString(),
    });
  },
};
