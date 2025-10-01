import { kv } from "@/lib/kv";
import { apiError } from "@/lib/apiError";
import { sign } from "@/lib/sign.cjs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get("d");
  const uuid = searchParams.get("uuid");

  if (!d || !uuid) {
    return apiError("MISSING_PARAMS", 400);
  }

  // 解析 uuid
  const regex = /^([0-9A-F]{14})([A-Z]{2})([0-9]{8})([0-9A-F]{8})$/i;
  const match = uuid.match(regex);
  if (!match) return apiError("INVALID_UUID_FORMAT", 400);

  const uid = match[1];
  const tp = match[2];
  const ts = match[3];
  const rlc = match[4];

  console.log("DEBUG:", { uid, tp, ts, rlc, d });

  // 1. TS 遞增驗證
  const tsKey = `ts:${uid}`;
  const lastTS = await kv.get(tsKey);
  if (lastTS && parseInt(ts, 10) <= parseInt(lastTS, 10)) {
    return apiError("TS_REPLAY_ATTACK", 403);
  }

  // 更新最新 TS
  await kv.set(tsKey, ts);

  // 2. RLC 驗證 (Mickey)
  try {
    const expectedRlc = sign({ uid, ts }).slice(0, 8).toUpperCase();
    if (expectedRlc !== rlc.toUpperCase()) {
      return apiError("INVALID_RLC", 403);
    }
  } catch (err) {
    console.error("SIGN ERROR:", err);
    return apiError("SERVER_ERROR", 500);
  }

  // 3. 生日驗證
  const cardKey = `card:${uid}`;
  const card = await kv.hgetall(cardKey);
  if (!card) return apiError("CARD_NOT_FOUND", 404);
  if (card.birthday !== d) return apiError("BIRTHDAY_MISMATCH", 401);

  return Response.json({
    status: "ok",
    uid,
    tp,
    ts,
    rlc,
    birthday: d,
    lastTS: lastTS || null,
  });
}
