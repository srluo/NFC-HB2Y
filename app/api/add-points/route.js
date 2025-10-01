import { kv } from "@/lib/kv";
import { apiError } from "@/lib/apiError";

export async function POST(req) {
  const { uid, action, cost } = await req.json();

  if (!uid) return apiError("MISSING_UID", 400);
  if (!action) return apiError("MISSING_ACTION", 400);
  if (!cost) return apiError("MISSING_COST", 400);

  const key = `card:${uid}`;
  const card = await kv.hgetall(key);

  if (!card) return apiError("CARD_NOT_FOUND", 404);
  if (card.status !== "ACTIVATED") return apiError("CARD_NOT_ACTIVATED", 403);

  const current = parseInt(card.points || "0", 10);
  if (current < cost) return apiError("INSUFFICIENT_POINTS", 402);

  const after = current - cost;
  await kv.hset(key, { ...card, points: after, updated_at: new Date().toISOString() });
  await kv.rpush(`transactions:${uid}`, JSON.stringify({
    ts: new Date().toISOString(),
    action,
    cost: -cost,
    points_after: after
  }));

  return Response.json({
    status: "ok",
    action,
    cost,
    points: after
  });
}
