import { kv } from "@/lib/kv";

export async function POST(req) {
  const { cards } = await req.json();
  if (!Array.isArray(cards) || !cards.length) {
    return Response.json({ success:false, reason:"沒有資料" }, { status:400 });
  }

  let count = 0;
  for (const c of cards) {
    const uid = (c.uid || "").trim();
    if (!uid) continue;
    const item = {
      uid,
      tp: (c.tp || "HB").trim(),
      birthday: (c.birthday || "").trim(), // YYYYMMDD
      status: "PENDING",
      points: parseInt(c.points || "0", 10) || 0,
      ts_last: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await kv.hset(`card:${uid}`, item);
    await kv.sadd("cards", uid);
    count++;
  }
  return Response.json({ success:true, count });
}