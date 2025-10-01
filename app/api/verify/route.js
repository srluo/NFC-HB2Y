import { kv } from "@/lib/kv";
import { apiError } from "@/lib/apiError";

// 強制使用 Node runtime，否則 Edge runtime 無法載入 sign.cjs
export const runtime = "nodejs";

function parseUuid(raw) {
  if (!raw) return null;
  const U = raw.toUpperCase().trim();
  // 格式: 14 HEX UID + "HB" + 8 HEX TS + 8 HEX RLC
  const m = U.match(/^([0-9A-F]{14})HB([0-9A-F]{8})([0-9A-F]{8})$/);
  if (!m) return null;
  return { uid: m[1], ts: m[2], rlc: m[3] };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const d = searchParams.get("d");     // 生日 YYYYMMDD
    const uuid = searchParams.get("uuid");

    if (!d || !uuid) return apiError("MISSING_PARAMS", 400);
    if (!/^\d{8}$/.test(d)) return apiError("INVALID_BIRTHDAY", 400);

    const parsed = parseUuid(uuid);
    if (!parsed) return apiError("INVALID_UUID_FORMAT", 400);

    const { uid, ts, rlc } = parsed;

    // 動態載入 sign.cjs (CJS module)，路徑要用相對位置
    const { sign } = await import("../../../lib/sign.cjs");

    // 計算期望 RLC
    const expect = String(sign({ uid, ts })).toUpperCase();
    if (expect !== rlc.toUpperCase()) {
      return apiError("INVALID_TOKEN", 401);
    }

    // 防重放：TS 必須大於上次
    const tsKey = `ts:${uid}`;
    const lastTs = await kv.get(tsKey);
    if (lastTs && parseInt(ts, 16) <= parseInt(String(lastTs), 16)) {
      return apiError("REPLAY_DETECTED", 401);
    }
    await kv.set(tsKey, ts, { ex: 86400 }); // 記錄 24h

    // 查卡片狀態
    const cardKey = `card:${uid}`;
    const card = await kv.hgetall(cardKey);

    return Response.json({
      status: "ok",
      step: !card || Object.keys(card).length === 0 ? "NEW_CARD" : "KNOWN_CARD",
      uid,
      ts,
      birthday_param: d,
      card: card || null
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return apiError("SERVER_ERROR", 500);
  }
}
