import { kv } from "@/lib/kv";
import { apiError } from "@/lib/apiError";
import pkg from "@/lib/sign.cjs";
const { sign } = pkg;

export const runtime = "nodejs";

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const d = searchParams.get("d");
  const uuid = (searchParams.get("uuid") || "").toUpperCase().trim();

  if (!d || !uuid) return apiError("MISSING_PARAMS", 400);

  // 解析 UUID → UID(14) + TP(2) + TS(8) + RLC(8)
  const match = uuid.match(/^([0-9A-F]{14})(HB)([0-9A-F]{8})([0-9A-F]{8})$/);
  if (!match) return apiError("INVALID_UUID_FORMAT", 400);

  const uid = match[1];
  const tp  = match[2];
  const ts  = match[3];
  const rlc = match[4];

  // 1. Mickey 簽章驗證
  let expected;
  try {
    expected = sign({ uid, ts }).toUpperCase();
  } catch (e) {
    console.error("SIGN ERROR:", e);
    return apiError("SERVER_ERROR", 500);
  }
  if (expected !== rlc) return apiError("INVALID_TOKEN", 401);

  // 2. TS 遞增驗證
  const tsKey = `ts:${uid}`;
  const lastTS = await kv.get(tsKey);
  if (lastTS && parseInt(ts, 16) <= parseInt(lastTS, 16)) {
    return apiError("TS_REPLAY_ATTACK", 403);
  }
  await kv.set(tsKey, ts);

  // 3. 查詢卡片資料
  const cardKey = `card:${uid}`;
  const card = await kv.hgetall(cardKey);

  if (!card) {
    // 還沒有建立卡片記錄
    return Response.json({
      status: "verify_ok_but_no_card",
      uid, tp, ts, rlc, birthday: d
    });
  }

  if (card.status !== "ACTIVATED") {
    // 已發卡，但還沒開卡 → 需要填表
    return Response.json({
      status: "verify_ok_but_not_activated",
      uid, tp, ts, rlc,
      birthday: card.birthday || d
    });
  }

  // 4. 已開卡 → 回傳生日書首頁 & 點數
  return Response.json({
    status: "verify_ok_and_activated",
    uid,
    tp,
    ts,
    rlc,
    birthday: card.birthday,
    user: {
      name: card.user_name || "",
      birthday_detail: card.user_birthday_detail || "",
      blood_type: card.blood_type || "",
      hobbies: card.hobbies || ""
    },
    points: parseInt(card.points || "0", 10)
  });
}
