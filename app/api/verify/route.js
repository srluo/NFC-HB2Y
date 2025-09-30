import { kv } from "@/lib/kv";

function parseUUID(uuid) {
  return {
    uid: uuid.substring(0, 16),
    tp:  uuid.substring(16, 18),
    ts:  uuid.substring(18, 27),
    rlc: uuid.substring(27)
  };
}

// ⚠️ 佔位：請換成 Mickey 1.0 產生的期望 RLC 再比對
function verifyRLCPlaceholder(uid, tp, ts, rlc) {
  if (!uid || !tp || !ts || !rlc) return false;
  return /^[0-9a-fA-F]+$/.test(rlc); // 只檢查為 hex，避免全通過；正式須換真驗證
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const d = searchParams.get("d");
  const uuid = searchParams.get("uuid");
  if (!d || !uuid) return Response.json({ status:"error", reason:"缺少參數" }, { status:400 });

  const { uid, tp, ts, rlc } = parseUUID(uuid);

  if (tp !== "HB") return Response.json({ status:"error", reason:"TP 不符" }, { status:403 });

  const key = `card:${uid}`;
  let card = await kv.hgetall(key);

  // 若未登錄，先建 PENDING（或你也可以強制必須先 import 才可用）
  if (!card) {
    card = {
      uid, tp, birthday: d, status: "PENDING",
      points: 0, ts_last: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await kv.hset(key, card);
    await kv.sadd("cards", uid);
  }

  // TS 遞增防重播
  const last = parseInt(card.ts_last || "0", 10);
  const nowTs = parseInt(ts || "0", 10);
  if (!(nowTs > last)) return Response.json({ status:"error", reason:"TS 過期或重播" }, { status:403 });

  // RLC 校驗（正式須用 Mickey 1.0）
  if (!verifyRLCPlaceholder(uid, tp, ts, rlc)) {
    return Response.json({ status:"error", reason:"RLC 錯誤" }, { status:403 });
  }

  await kv.hset(key, { ...card, ts_last: nowTs, updated_at: new Date().toISOString() });

  if (card.status === "PENDING") {
    return Response.json({ status:"pending" });
  }

  if (card.status === "ACTIVATED") {
    return Response.json({
      status:"activated",
      user: {
        uid: card.uid,
        name: card.user_name || "",
        birthday: card.birthday,
        birthday_detail: card.user_birthday_detail || "",
        blood_type: card.blood_type || "",
        hobbies: card.hobbies || ""
      },
      points: parseInt(card.points || "0", 10)
    });
  }

  return Response.json({ status:"error", reason:"卡片狀態異常" }, { status:403 });
}