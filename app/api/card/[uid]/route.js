import { kv } from "@/lib/kv";
import { apiError } from "@/lib/apiError";

export async function GET(req, { params }) {
  const { uid } = params;
  if (!uid) return apiError("MISSING_UID", 400);

  const key = `card:${uid}`;
  try {
    const card = await kv.hgetall(key);

    if (!card) return apiError("CARD_NOT_FOUND", 404);

    return Response.json({
      status: "ok",
      debug: { redisUrl: process.env.UPSTASH_REDIS_REST_URL },
      card
    });
  } catch (err) {
    return apiError("SERVER_ERROR", 500);
  }
}
