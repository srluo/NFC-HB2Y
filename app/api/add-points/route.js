import { kv } from "@/lib/kv";

export async function POST(req) {
  const { uid, action, cost } = await req.json();
  if (!uid || !action || !cost) return Response.json({ status:"error", reason:"缺少參數" }, { status:400 });

  const key = `card:${uid}`;
  const card = await kv.hgetall(key);
  if (!card) return Response.json({ status:"error", reason:"卡片不存在" }, { status:404 });
  if (card.status !== "ACTIVATED") return Response.json({ status:"error", reason:"卡片未啟用" }, { status:403 });

  const current = parseInt(card.points || "0", 10);
  if (current < cost) return Response.json({ status:"error", reason:"點數不足", points: current }, { status:402 });

  const after = current - cost;
  await kv.hset(key, { ...card, points: after, updated_at: new Date().toISOString() });
  await kv.rpush(`transactions:${uid}`, JSON.stringify({
    ts: new Date().toISOString(), action, cost: -cost, points_after: after
  }));

  return Response.json({ status:"ok", action, cost, points: after });
}